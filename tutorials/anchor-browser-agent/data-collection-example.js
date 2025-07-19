let chromium, axios;

try {
    chromium = require('playwright-core').chromium;
    axios = require('axios');
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.log("📦 Missing dependencies detected!");
        console.log("Please install the required packages:");
        console.log("npm install playwright-core axios");
        process.exit(1);
    } else {
        throw error;
    }
}

const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY;

async function dataCollectionExample(connectionString = `wss://connect.anchorbrowser.io?apiKey=${ANCHOR_API_KEY}`) {
    const browser = await chromium.connectOverCDP(connectionString);
    const context = browser.contexts()[0];
    const ai = context.serviceWorkers()[0];
    const page = context.pages()[0];

    await page.goto(
        "https://play.grafana.org/a/grafana-k8s-app/navigation/nodes?from=now-1h&to=now&refresh=1m",
        { waitUntil: 'domcontentloaded' }
    );
    const result = await ai.evaluate('Collect the node names and their CPU average %, return in JSON array');
    return result;
}

// Create a session with a profile
async function createSessionWithProfile(profileName = "my-profile") {
    const url = "https://api.anchorbrowser.io/v1/sessions";

    const payload = {
        "browser": {
            "profile": {
                "name": profileName,   // Replace "my-profile" to match your existing profile name
                "persist": true
            }
        },
        "session": {
            "timeout": {                // Reduced timeouts for cost-effective learning
                "max_duration": 4,
                "idle_timeout": 2
            }
        }
    };
    const headers = {
        "anchor-api-key": ANCHOR_API_KEY,
        "Content-Type": "application/json"
    };

    try {
        // Initialize session using profile "my-profile"
        const response = await axios.post(url, payload, { headers });

        // Make sure to keep the cdpUrl for the next step
        const sessionData = response.data;
        console.log(sessionData);
        return sessionData;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401) {
                console.error("❌ Authentication failed (401): Invalid or missing API key");
                console.log("Please check your ANCHOR_API_KEY environment variable");
                process.exit(1);
            } else {
                console.error(`❌ HTTP Error ${error.response.status}: ${error.response.statusText}`);
                console.error("Response data:", error.response.data);
                process.exit(1);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error("❌ Network error: No response received from server");
            process.exit(1);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("❌ Error:", error.message);
            process.exit(1);
        }
    }
}

async function dataCollectionExampleWithProfile(profileName = "my-profile") {
    const sessionData = await createSessionWithProfile(profileName);
    const connectionString = sessionData.data.cdp_url;
    const result = await dataCollectionExample(connectionString);
    return result;
}

if (!ANCHOR_API_KEY) {
    throw new Error("ANCHOR_API_KEY is not set, please run `export ANCHOR_API_KEY=<your-api-key>` and try again.");
}

(async () => {
    try {
        console.log("data_collection_example:");
        const result1 = await dataCollectionExample();
        console.log(result1);
        console.log("-".repeat(100));
        console.log("data_collection_example_with_profile:");
        const result2 = await dataCollectionExampleWithProfile("my-profile");
        console.log(result2);
    } catch (error) {
        console.error(error.message);
        console.log("Please check the data-collection guide for more troubleshooting.");
        process.exit(1);
    }
})(); 