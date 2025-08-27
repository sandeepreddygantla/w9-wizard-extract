import os
import httpx
import json
import difflib
from typing import Optional, Dict, Any

from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict, model_validator, field_validator

from langchain_openai import AzureChatOpenAI
from azure.identity import ClientSecretCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient

load_dotenv()

# --- TikToken cache (as shown in your screenshots) ---
tiktoken_cache_dir = os.path.abspath("tiktoken_cache")
os.environ["TIKTOKEN_CACHE_DIR"] = tiktoken_cache_dir

assert os.path.exists(os.path.join(
    tiktoken_cache_dir,
    "9b5ad71b2ce5302211f9c61530b329a4922fc6a4"
)), "Tokenizer file missing in 'tiktoken_cache' directory."


# --- Auth Function (client credentials to get Azure AD access token) ---
def get_access_token():
    auth = "https://api.uhg.com/oauth2/token"
    scope = "https://api.uhg.com/.default"
    grant_type = "client_credentials"

    client_id_llm = os.getenv("AZURE_CLIENT_ID")
    client_secret_llm = os.getenv("AZURE_CLIENT_SECRET")

    with httpx.Client() as client:
        body = {
            "grant_type": grant_type,
            "scope": scope,
            "client_id": client_id_llm,
            "client_secret": client_secret_llm,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        response = client.post(auth, headers=headers, data=body, timeout=60)
        response.raise_for_status()
        return response.json()["access_token"]


# --- Build AzureChatOpenAI client using Azure AD token ---
def get_llm(access_token: str):
    return AzureChatOpenAI(
        azure_deployment="gpt-4.1-2025-04-14",
        model="gpt-4.1",
        api_version="2025-01-01-preview",
        azure_endpoint="https://api.uhg.com/api/cloud/api-management/ai-gateway/1.0",
        openai_api_type="azure_ad",
        validate_base_url=False,
        azure_ad_token=access_token,
        default_headers={
            "projectId": os.getenv("AZURE_PROJECT_ID"),
        },
    )


access_token = get_access_token()
llm = get_llm(access_token)

# --- Pydantic model for normalized W-9 fields ---
class W9Data(BaseModel):
    model_config = ConfigDict(extra="allow")

    entity_type: Optional[str] = None
    name: Optional[str] = None
    business_name: Optional[str] = None
    ein: Optional[str] = None
    ssn: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    user_signed: Optional[str] = None
    signed_date: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_keys(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        expected_keys = {
            "entity_type", "name", "business_name", "ein", "ssn",
            "address", "city", "state", "zip_code", "user_signed", "signed_date"
        }
        normalized: Dict[str, Any] = {}
        for key, value in data.items():
            cleaned_key = key.strip().lower().replace("_", " ").replace("-", " ")
            best_match = difflib.get_close_matches(cleaned_key, expected_keys, n=1, cutoff=0.7)
            if best_match:
                normalized[best_match[0]] = value
        return normalized

    @field_validator("user_signed", mode="before")
    @classmethod
    def normalize_user_signed(cls, v):
        if v and str(v).strip().lower() in ("yes", "y", "signed", "true"):
            return "Y"
        return ""


# --- W-9 document extraction pipeline ---
def extract_data_from_w9_documents(file_paths, llm):
    results = []

    tenant_id = os.getenv("tenant_id")
    client_id = os.getenv("client_id")
    client_secret = os.getenv("client_secret")
    endpoint = os.getenv("endpoint")

    credential = ClientSecretCredential(tenant_id, client_id, client_secret)
    client = DocumentIntelligenceClient(endpoint=endpoint, credential=credential)

    for file_path in file_paths:
        try:
            with open(file_path, "rb") as f:
                document = f.read()

            poller = client.begin_analyze_document(
                model_id="prebuilt-layout",
                body=document,
                features=["keyValuePairs"]
            )
            result = poller.result()

            if not result.pages:
                print(f"⚠️ No pages found in: {file_path}")
                continue

            # Use only the first page
            page = result.pages[0]
            extracted_text = "\n".join(line.content for line in page.lines)

            # Selection marks (checkboxes) -> nearest text
            checkbox_info = []
            marks = getattr(page, "selection_marks", []) or []
            lines = getattr(page, "lines", []) or []

            for mark in marks:
                if not getattr(mark, "polygon", None):
                    continue

                # Compute checkbox center
                x_coords = mark.polygon[::2]
                y_coords = mark.polygon[1::2]
                checkbox_center = (
                    sum(x_coords) / len(x_coords),
                    sum(y_coords) / len(y_coords)
                )

                # Find nearest line to the checkbox center
                nearest_text = ""
                min_dist = float("inf")
                for line in lines:
                    if not getattr(line, "polygon", None):
                        continue
                    lx, ly = line.polygon[0], line.polygon[1]
                    dist = ((lx - checkbox_center[0]) ** 2 + (ly - checkbox_center[1]) ** 2) ** 0.5
                    if dist < min_dist:
                        min_dist = dist
                        nearest_text = line.content

                checkbox_info.append({"label": nearest_text, "state": mark.state})

            checkbox_text = "\n".join(
                [f"Checkbox labeled '{box['label']}' is {box['state']}" for box in checkbox_info]
            )

            prompt = f"""
You are an expert assistant that extracts structured data from W9 tax forms.
Return only the result in valid JSON format. Do NOT add any explanation or surrounding text.
Use the exact key names below (spelling and casing matters):

{{
  "entity_type": "",
  "name": "",
  "business_name": "",
  "ein": "",
  "ssn": "",
  "address": "",
  "city": "",
  "state": "",
  "zip_code": "",
  "user_signed": "Y" if signed, "" otherwise,
  "signed_date": ""
}}

Below is the content of the form:
{extracted_text}

Below are the checkbox states:
{checkbox_text}

Only return JSON do not add explanations
"""

            response = llm.invoke([
                {"role": "system", "content": "You are a helpful assistant that extracts W9 tax form data."},
                {"role": "user", "content": prompt}
            ])

            # Extract only JSON content
            json_start = response.content.find('{')
            json_end = response.content.rfind('}') + 1
            raw_json = json.loads(response.content[json_start:json_end])

            try:
                normalized = W9Data.normalize_keys(raw_json)
                validated_data = W9Data(**normalized)
                json_data = validated_data.model_dump()
            except Exception as e:
                print(f"⚠️ Pydantic validation error: {e}")
                continue

            results.append({
                "file": file_path,
                "response": json_data
            })

        except Exception as e:
            results.append({
                "file": file_path,
                "response": {"error": str(e)}
            })

    return results