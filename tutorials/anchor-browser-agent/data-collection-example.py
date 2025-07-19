import os
import requests
from playwright.sync_api import sync_playwright

ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")

def data_collection_example(connection_string = f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}"):
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(connection_string)
        context = browser.contexts[0]
        ai = context.service_workers[0]
        page = context.pages[0]

        page.goto(
            "https://play.grafana.org/a/grafana-k8s-app/navigation/nodes?from=now-1h&to=now&refresh=1m",
            wait_until="domcontentloaded"
        )
        result = ai.evaluate('Collect the node names and their CPU average %, return in JSON array')
        return result


# Create a session with a profile
def create_session_with_profile(profile_name = "my-profile"):
    url = "https://api.anchorbrowser.io/v1/sessions"

    payload = {
        "browser": {
            "profile": {
                "name": profile_name,   # Replace "my-profile" to match your existing profile name
                "persist": True
            }
        },
        "session": {
            "timeout": {                # Reduced timeouts for cost-effective learning
                "max_duration": 4,
                "idle_timeout": 2
            }
        }
    }
    headers = {
        "anchor-api-key": ANCHOR_API_KEY,
        "Content-Type": "application/json"
    }

    # Initialize session using profile "my-profile"
    response = requests.request("POST", url, json=payload, headers=headers)

    # Make sure to keep the cdpUrl for the next step
    session_data = response.json()
    print(session_data)
    return session_data




def data_collection_example_with_profile(profile_name = "my-profile"):
    session_data = create_session_with_profile(profile_name)
    connection_string = session_data['data']['cdp_url']
    result = data_collection_example(connection_string)
    return result


if not ANCHOR_API_KEY:
    raise Exception("ANCHOR_API_KEY is not set, please run `export ANCHOR_API_KEY=<your-api-key>` and try again.")

try:
    print("data_collection_example:")
    print(data_collection_example())
    print("-"*100)
    print("data_collection_example_with_profile:")
    print(data_collection_example_with_profile("my-profile"))
except Exception as e:
    print(str(e))
    print("Please check the data-collection guide for more troubleshooting.")



