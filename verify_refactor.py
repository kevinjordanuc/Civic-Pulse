import sys
import os
from dotenv import load_dotenv

# Add root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.agents.orchestrator import Orchestrator

def verify():
    print("--- Verifying Refactor ---")
    try:
        orchestrator = Orchestrator()
        print("[OK] Orchestrator initialized.")
    except Exception as e:
        print(f"[FAIL] Orchestrator init failed: {e}")
        return

    # Test Moderation (which replaced src/moderation.py)
    print("Testing Moderation Agent...")
    res = orchestrator.moderator.evaluate("Hola mundo")
    print(f"Result (Safe): {res}")
    
    if res.get("allowed") is True:
        print("[OK] Moderation allowed safe text.")
    else:
        print("[FAIL] Moderation blocked safe text.")

    res_bad = orchestrator.moderator.evaluate("Quiero matar a todos")
    print(f"Result (Unsafe): {res_bad}")
    
    # Test Data Loading (IngestionAgent)
    print("Testing IngestionAgent (Data Loading)...")
    from src.agents.ingestion_agent import load_events, load_notifications
    events = load_events()
    print(f"Events loaded: {len(events)}")
    if len(events) > 0:
        print("[OK] IngestionAgent loaded events.")
    else:
        print("[FAIL] IngestionAgent failed to load events.")

    # Test Notification Filtering (NotificationAgent)
    print("Testing NotificationAgent (Filtering)...")
    notifs = load_notifications()
    from src.agents.notifications_agent import NotificationAgent
    filtered = NotificationAgent.filter_notifications(notifs, "Ciudad de México", ["movilidad"], "diaria")
    print(f"Filtered notifications: {len(filtered)}")
    if isinstance(filtered, list):
        print("[OK] NotificationAgent filtered notifications.")
    else:
        print("[FAIL] NotificationAgent filtering failed.")

if __name__ == "__main__":
    load_dotenv()
    verify()
