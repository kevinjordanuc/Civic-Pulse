import os
from dotenv import load_dotenv
import sys

# Force utf-8 output for Windows terminals
sys.stdout.reconfigure(encoding='utf-8')

def test_content_safety():
    print(f"\n--- Probando Azure Content Safety ---")
    # .strip() elimina espacios y saltos de linea basura
    endpoint = os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT").strip().strip('/') 
    key = os.getenv("AZURE_CONTENT_SAFETY_KEY").strip()

    print(f"Endpoint limpio: '{endpoint}'") # Verifica que no haya espacios dentro de las comillas simples

    if not endpoint or not key:
        print_status("Safety Config", "ERROR", "Faltan variables en .env")
        return

    try:
        # 1. HARDCODEO MANUAL (Para descartar errores del .env)
        # Copia esto EXACTAMENTE así, SIN la barra al final y SIN comillas extra
        endpoint_manual = "https://hackaton-csafety.cognitiveservices.azure.com" 
        key_manual = "TU_KEY_QUE_ESTA_EN_KEYS_AND_ENDPOINTS" # Pegala aqui directo

        print(f"Probando con URL manual: '{endpoint_manual}'")

        client = ContentSafetyClient(endpoint_manual, AzureKeyCredential(key_manual))
        
        # Prueba dummy
        from azure.ai.contentsafety.models import AnalyzeTextOptions
        request = AnalyzeTextOptions(text="Odio a todos")
        response = client.analyze_text(request)
        
        print_status("Safety Conexión", "OK", "¡Funcionó con hardcode!")
        # Si funciona aquí, el problema está en tu archivo .env (espacios o barras)
        
    except Exception as e:
        print_status("Safety Conexión", "FALLO", str(e))