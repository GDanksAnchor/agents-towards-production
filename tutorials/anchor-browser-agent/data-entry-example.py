import os
import json
from playwright.sync_api import sync_playwright

ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")

if not ANCHOR_API_KEY:
    raise Exception("ANCHOR_API_KEY is not set, please run `export ANCHOR_API_KEY=<your-api-key>` and try again.")

def execute_form_submission(connection_string= f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}"):
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(connection_string)
        context = browser.contexts[0]
        ai = context.service_workers[0]
        page = context.pages[0]
        # Navigate to resume
        page.goto('https://www.wix.com/demone2/nicol-rider')
        # Execute AI task
        task_payload = {
            "prompt": "Read the resume, understand the details, and complete the form at https://formspree.io/library/donation/charity-donation-form/preview.html as if you were her. Limit the donation to $10.",
            "provider": "openai",
            "model": "gpt-4",
            "highlight_elements": True
        }
        result = ai.evaluate(json.dumps(task_payload))
        print("Task result:", result)
        browser.close()
        return result


print(execute_form_submission())