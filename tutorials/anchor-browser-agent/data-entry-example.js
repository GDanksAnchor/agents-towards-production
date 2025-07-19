let chromium;

try {
    chromium = require('playwright-core').chromium;
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.log("📦 Missing dependencies detected!");
        console.log("Please install the required packages:");
        console.log("npm install playwright-core");
        process.exit(1);
    } else {
        throw error;
    }
}

const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY;

if (!ANCHOR_API_KEY) {
    throw new Error("ANCHOR_API_KEY is not set, please run `export ANCHOR_API_KEY=<your-api-key>` and try again.");
}

async function executeFormSubmission(connectionString = `wss://connect.anchorbrowser.io?apiKey=${ANCHOR_API_KEY}`) {
    const browser = await chromium.connectOverCDP(connectionString);
    const context = browser.contexts()[0];
    const ai = context.serviceWorkers()[0];
    const page = context.pages()[0];
    
    // Navigate to resume
    await page.goto('https://www.wix.com/demone2/nicol-rider');
    
    // Execute AI task
    const taskPayload = {
        "prompt": "Read the resume, understand the details, and complete the form at https://formspree.io/library/donation/charity-donation-form/preview.html as if you were her. Limit the donation to $10.",
        "provider": "openai",
        "model": "gpt-4",
        "highlight_elements": true
    };
    
    const result = await ai.evaluate(JSON.stringify(taskPayload));
    console.log("Task result:", result);
    await browser.close();
    return result;
}

(async () => {
    try {
        const result = await executeFormSubmission();
        console.log(result);
    } catch (error) {
        console.error("Error:", error.message);
    }
})(); 