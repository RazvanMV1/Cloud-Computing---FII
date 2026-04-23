import httpx
from config import config

TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com"


async def translate_text(text: str, to_lang: str = "ro", from_lang: str = None) -> dict:
    url = f"{TRANSLATOR_ENDPOINT}/translate"
    params = {
        "api-version": "3.0",
        "to": to_lang
    }
    if from_lang:
        params["from"] = from_lang

    headers = {
        "Ocp-Apim-Subscription-Key": config.AZURE_TRANSLATOR_KEY,
        "Ocp-Apim-Subscription-Region": config.AZURE_TRANSLATOR_REGION,
        "Content-Type": "application/json"
    }

    body = [{"text": text}]

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, params=params, headers=headers, json=body, timeout=10)
            response.raise_for_status()
            data = response.json()

            if data and len(data) > 0:
                translation = data[0]["translations"][0]
                detected = data[0].get("detectedLanguage", {})
                return {
                    "original_text": text,
                    "translated_text": translation["text"],
                    "to_language": translation["to"],
                    "detected_language": detected.get("language", from_lang or "unknown"),
                    "confidence": detected.get("score", None)
                }
            raise Exception("Raspuns gol de la Translator API")

        except httpx.TimeoutException:
            raise Exception("Azure Translator timeout")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Azure Translator error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"Azure Translator nu este accesibil: {str(e)}")


async def translate_batch(texts: list, to_lang: str = "ro") -> list:
    url = f"{TRANSLATOR_ENDPOINT}/translate"
    params = {
        "api-version": "3.0",
        "to": to_lang
    }

    headers = {
        "Ocp-Apim-Subscription-Key": config.AZURE_TRANSLATOR_KEY,
        "Ocp-Apim-Subscription-Region": config.AZURE_TRANSLATOR_REGION,
        "Content-Type": "application/json"
    }

    body = [{"text": t} for t in texts]

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, params=params, headers=headers, json=body, timeout=15)
            response.raise_for_status()
            data = response.json()

            results = []
            for i, item in enumerate(data):
                translation = item["translations"][0]
                results.append({
                    "original_text": texts[i],
                    "translated_text": translation["text"],
                    "to_language": translation["to"]
                })
            return results

        except httpx.TimeoutException:
            raise Exception("Azure Translator timeout")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Azure Translator error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"Azure Translator nu este accesibil: {str(e)}")
