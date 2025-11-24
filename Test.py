import os
from dotenv import load_dotenv

# Librerías cliente directas
from openai import AzureOpenAI
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.ai.contentsafety import ContentSafetyClient

# Cargar variables
load_dotenv()

# Colores para la consola
VERDE = "\033[92m"
ROJO = "\033[91m"
AMARILLO = "\033[93m"
RESET = "\033[0m"

def print_status(servicio, estado, mensaje=""):
    color = VERDE if estado == "OK" else ROJO
    print(f"[{servicio.ljust(20)}] {color}{estado}{RESET} {mensaje}")

def test_openai():
    print(f"\n--- Probando Azure OpenAI ---")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    key = os.getenv("AZURE_OPENAI_API_KEY")
    deployment = os.getenv("AZURE_OPENAI_MODEL") # O AZURE_OPENAI_DEPLOYMENT_NAME

    print(f"Endpoint: {endpoint}")
    print(f"Deployment a probar: {AMARILLO}{deployment}{RESET}")

    if not endpoint or not key or not deployment:
        print_status("OpenAI Config", "ERROR", "Faltan variables en .env")
        return

    try:
        client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=key,
            api_version="2023-05-15"
        )
        response = client.chat.completions.create(
            model=deployment,
            messages=[{"role": "user", "content": "Hola, ¿estás activo?"}],
            max_tokens=10
        )
        print_status("OpenAI Conexión", "OK", f"Respuesta: {response.choices[0].message.content}")
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg:
            print_status("OpenAI Conexión", "FALLO", "Error 404: El 'Deployment Name' no coincide o el Endpoint está mal.")
        elif "401" in error_msg:
            print_status("OpenAI Conexión", "FALLO", "Error 401: La API Key es incorrecta.")
        else:
            print_status("OpenAI Conexión", "FALLO", error_msg)

def test_search():
    print(f"\n--- Probando Azure AI Search ---")
    endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
    key = os.getenv("AZURE_SEARCH_KEY")

    if not endpoint or not key:
        print_status("Search Config", "ERROR", "Faltan variables en .env")
        return

    try:
        credential = AzureKeyCredential(key)
        client = SearchIndexClient(endpoint=endpoint, credential=credential)
        # Intentamos listar los índices para ver si hay conexión
        nombres = [index.name for index in client.list_indexes()]
        print_status("Search Conexión", "OK", f"Índices encontrados: {nombres}")
    except Exception as e:
        print_status("Search Conexión", "FALLO", str(e))

def test_content_safety():
    print(f"\n--- Probando Azure Content Safety ---")
    endpoint = os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT")
    key = os.getenv("AZURE_CONTENT_SAFETY_KEY")

    if not endpoint or not key:
        print_status("Safety Config", "ERROR", "Faltan variables en .env")
        return

    try:
        client = ContentSafetyClient(endpoint, AzureKeyCredential(key))
        # No hacemos llamada real para ahorrar, solo instanciar suele validar formato url
        # Pero mejor hacemos una prueba dummy rápida
        from azure.ai.contentsafety.models import AnalyzeTextOptions
        request = AnalyzeTextOptions(text="Test de conexión seguro")
        client.analyze_text(request)
        print_status("Safety Conexión", "OK", "Servicio responde correctamente")
    except Exception as e:
        print_status("Safety Conexión", "FALLO", str(e))

if __name__ == "__main__":
    print("==========================================")
    print("   DIAGNÓSTICO DE CREDENCIALES AZURE      ")
    print("==========================================")
    test_openai()
    test_search()
    test_content_safety()
    print("\n==========================================")