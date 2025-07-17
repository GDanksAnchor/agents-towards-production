# AnchorBrowser Agent Guide for Production

A comprehensive guide for integrating AnchorBrowser into production-ready AI agents, focusing on data entry and data collection use cases.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Core Features](#core-features)
- [Use Case 1: Data Entry (Form Submission)](#use-case-1-data-entry-form-submission)
- [Use Case 2: Data Collection (Grafana Dashboard)](#use-case-2-data-collection-grafana-dashboard)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

AnchorBrowser is a powerful cloud-based browser automation platform that enables AI agents to interact with web applications seamlessly. This guide demonstrates how to integrate AnchorBrowser into production-ready AI agents for common use cases like data entry and data collection.

### Key Benefits

- **Cloud-based**: No local browser installation required
- **AI-powered**: Built-in AI agents for intelligent web interactions
- **Session Management**: Persistent browser sessions with state preservation
- **Proxy Support**: Geographic distribution and IP rotation
- **Recording**: Session recording for debugging and compliance
- **Profiles**: Browser profile management for consistent user experiences

## Getting Started

### Prerequisites

1. **AnchorBrowser Account**: Sign up at [anchorbrowser.io](https://anchorbrowser.io?utm_source=agents-towards-production)
2. **API Key**: Get your API key from the [AnchorBrowser Dashboard](https://dashboard.anchorbrowser.io?utm_source=agents-towards-production)
3. **Node.js/Python**: Choose your preferred runtime environment

### Installation

#### Node.js Setup

```bash
npm install playwright-core axios
```

#### Python Setup

```bash
pip install playwright requests
playwright install chromium
```

### Environment Configuration

```bash
export ANCHOR_API_KEY="your-api-key-here"
```

## Core Features

### Session Management

AnchorBrowser provides robust session management with the following capabilities:

- **Session Persistence**: Maintain browser state across connections
- **Session Recording**: Record sessions for debugging and compliance
- **Session Timeouts**: Configurable session lifetime and idle timeouts
- **Live View**: Real-time browser session monitoring

### AI Integration

AnchorBrowser includes built-in AI agents that can:

- **Understand Web Content**: Parse and comprehend webpage content
- **Execute Tasks**: Perform complex web interactions
- **Handle Forms**: Fill out forms intelligently
- **Navigate Websites**: Follow links and navigate complex workflows

### Proxy Support

- **Residential Proxies**: High-quality residential IP addresses
- **Mobile Proxies**: Mobile network IP addresses
- **Geographic Distribution**: Choose from multiple countries
- **IP Rotation**: Automatic IP rotation for large-scale operations

## Use Case 1: Data Entry (Form Submission)

This use case demonstrates how to use AnchorBrowser for automated form submission, specifically for charity donation forms.

### Scenario

An AI agent needs to read a resume, extract personal information, and complete a charity donation form with the extracted details.

### Implementation

#### Step 1: Create Browser Session

```javascript
const { chromium } = require("playwright-core");
const axios = require("axios");

async function createSession() {
    const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY;
    
    const browserConfiguration = {
        session: {
            recording: true,  // Enable session recording
            proxy: {
                active: true,
                type: "anchor_residential",
                country_code: "us"
            }
        },
        max_duration: 30,  // 30 minutes
        idle_timeout: 5    // 5 minutes idle timeout
    };

    const response = await axios.post("https://api.anchorbrowser.io/v1/sessions", 
        browserConfiguration, {
        headers: {
            "anchor-api-key": ANCHOR_API_KEY,
            "Content-Type": "application/json",
        },
    });

    return response.data.data;
}
```

#### Step 2: Connect and Execute Task

```javascript
async function executeFormSubmission(session) {
    const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY;
    
    // Connect to the browser session
    const browser = await chromium.connectOverCDP(
        `wss://connect.anchorbrowser.io?apiKey=${ANCHOR_API_KEY}&sessionId=${session.id}`
    );
    
    const context = browser.contexts()[0];
    const ai = context.serviceWorkers()[0];
    const page = context.pages()[0];

    // Navigate to the resume page
    await page.goto('https://www.wix.com/demone2/nicol-rider');

    // Execute the AI task
    const taskPayload = {
        prompt: "Read the resume, understand the details, and complete the form at https://formspree.io/library/donation/charity-donation-form/preview.html as if you were her. Limit the donation to $10.",
        provider: "openai",
        model: "gpt-4",
        highlight_elements: true
    };

    const result = await ai.evaluate(JSON.stringify(taskPayload));
    console.log("Task result:", result);

    await browser.close();
    return result;
}
```

#### Step 3: Complete Implementation

```javascript
async function main() {
    try {
        console.log("Creating browser session...");
        const session = await createSession();
        console.log("Session created:", session.id);

        console.log("Executing form submission task...");
        const result = await executeFormSubmission(session);
        
        console.log("Task completed successfully!");
        console.log("Live view URL:", session.live_view_url);
        
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
```

### Python Implementation

```python
import os
import requests
from playwright.sync_api import sync_playwright
import json

def create_session():
    ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")
    
    browser_configuration = {
        "session": {
            "recording": True,
            "proxy": {
                "active": True,
                "type": "anchor_residential",
                "country_code": "us"
            }
        },
        "max_duration": 30,
        "idle_timeout": 5
    }

    response = requests.post(
        "https://api.anchorbrowser.io/v1/sessions",
        json=browser_configuration,
        headers={
            "anchor-api-key": ANCHOR_API_KEY,
            "Content-Type": "application/json",
        }
    )
    
    return response.json()["data"]

def execute_form_submission(session):
    ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")
    
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(
            f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}&sessionId={session['id']}"
        )
        
        context = browser.contexts[0]
        ai = context.service_workers()[0]
        page = context.pages()[0]

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

def main():
    try:
        print("Creating browser session...")
        session = create_session()
        print("Session created:", session["id"])

        print("Executing form submission task...")
        result = execute_form_submission(session)
        
        print("Task completed successfully!")
        print("Live view URL:", session["live_view_url"])
        
    except Exception as error:
        print("Error:", error)

if __name__ == "__main__":
    main()
```

### Key Features Demonstrated

- **AI-Powered Form Filling**: The AI agent reads the resume and intelligently fills the donation form
- **Session Recording**: All interactions are recorded for audit purposes
- **Proxy Usage**: Uses residential proxy for realistic browsing
- **Error Handling**: Comprehensive error handling and logging
- **Live View**: Real-time monitoring of the browser session

## Use Case 2: Data Collection (Grafana Dashboard)

This use case demonstrates how to use AnchorBrowser for automated data collection from web dashboards, specifically Grafana monitoring dashboards.

### Scenario

An AI agent needs to collect monitoring data from a Grafana dashboard, extract specific metrics, and store them for analysis.

### Implementation

#### Step 1: Create Session with Profile

```javascript
async function createSessionWithProfile() {
    const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY;
    
    const browserConfiguration = {
        session: {
            recording: true,
            proxy: {
                active: true,
                type: "anchor_residential",
                country_code: "us"
            }
        },
        browser: {
            profile: {
                name: "monitoring-user",
                persist: true  // Keep profile after session closes
            }
        },
        max_duration: 60,
        idle_timeout: 10
    };

    const response = await axios.post("https://api.anchorbrowser.io/v1/sessions", 
        browserConfiguration, {
        headers: {
            "anchor-api-key": ANCHOR_API_KEY,
            "Content-Type": "application/json",
        },
    });

    return response.data.data;
}
```

#### Step 2: Data Collection Task

```javascript
async function collectGrafanaData(session) {
    const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY;
    
    const browser = await chromium.connectOverCDP(
        `wss://connect.anchorbrowser.io?apiKey=${ANCHOR_API_KEY}&sessionId=${session.id}`
    );
    
    const context = browser.contexts()[0];
    const ai = context.service_workers()[0];
    const page = context.pages()[0];

    // Navigate to Grafana dashboard
    await page.goto('https://your-grafana-instance.com/d/your-dashboard');

    // Execute data collection task
    const taskPayload = {
        prompt: "Navigate through the Grafana dashboard and collect the following metrics: CPU usage, memory usage, disk usage, and network traffic. Extract the current values and trends for each metric. Format the data as JSON with timestamps.",
        provider: "openai",
        model: "gpt-4",
        highlight_elements: true
    };

    const result = await ai.evaluate(JSON.stringify(taskPayload));
    
    // Take a screenshot for verification
    const screenshot = await page.screenshot({
        fullPage: true,
        path: `grafana-dashboard-${Date.now()}.png`
    });

    await browser.close();
    return { data: result, screenshot };
}
```

#### Step 3: Profile Management

```javascript
async function manageProfiles() {
    const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY;
    
    // List existing profiles
    const profilesResponse = await axios.get("https://api.anchorbrowser.io/v1/profiles", {
        headers: {
            "anchor-api-key": ANCHOR_API_KEY,
            "Content-Type": "application/json",
        },
    });
    
    console.log("Available profiles:", profilesResponse.data);
    
    // Create a new profile for monitoring
    const newProfileConfig = {
        name: "monitoring-user",
        settings: {
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport: { width: 1920, height: 1080 },
            timezone: "America/New_York"
        }
    };
    
    const createProfileResponse = await axios.post("https://api.anchorbrowser.io/v1/profiles", 
        newProfileConfig, {
        headers: {
            "anchor-api-key": ANCHOR_API_KEY,
            "Content-Type": "application/json",
        },
    });
    
    return createProfileResponse.data;
}
```

### Python Implementation

```python
import os
import requests
from playwright.sync_api import sync_playwright
import json
from datetime import datetime

def create_session_with_profile():
    ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")
    
    browser_configuration = {
        "session": {
            "recording": True,
            "proxy": {
                "active": True,
                "type": "anchor_residential",
                "country_code": "us"
            }
        },
        "browser": {
            "profile": {
                "name": "monitoring-user",
                "persist": True
            }
        },
        "max_duration": 60,
        "idle_timeout": 10
    }

    response = requests.post(
        "https://api.anchorbrowser.io/v1/sessions",
        json=browser_configuration,
        headers={
            "anchor-api-key": ANCHOR_API_KEY,
            "Content-Type": "application/json",
        }
    )
    
    return response.json()["data"]

def collect_grafana_data(session):
    ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")
    
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(
            f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}&sessionId={session['id']}"
        )
        
        context = browser.contexts[0]
        ai = context.service_workers()[0]
        page = context.pages()[0]

        # Navigate to Grafana dashboard
        page.goto('https://your-grafana-instance.com/d/your-dashboard')

        # Execute data collection task
        task_payload = {
            "prompt": "Navigate through the Grafana dashboard and collect the following metrics: CPU usage, memory usage, disk usage, and network traffic. Extract the current values and trends for each metric. Format the data as JSON with timestamps.",
            "provider": "openai",
            "model": "gpt-4",
            "highlight_elements": True
        }

        result = ai.evaluate(json.dumps(task_payload))
        
        # Take screenshot
        screenshot_path = f"grafana-dashboard-{datetime.now().strftime('%Y%m%d-%H%M%S')}.png"
        page.screenshot(path=screenshot_path, full_page=True)

        browser.close()
        return {"data": result, "screenshot": screenshot_path}

def manage_profiles():
    ANCHOR_API_KEY = os.getenv("ANCHOR_API_KEY")
    
    # List profiles
    profiles_response = requests.get("https://api.anchorbrowser.io/v1/profiles", {
        headers: {
            "anchor-api-key": ANCHOR_API_KEY,
            "Content-Type": "application/json",
        },
    })
    
    print("Available profiles:", profiles_response.json())
    
    # Create new profile
    new_profile_config = {
        "name": "monitoring-user",
        "settings": {
            "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "viewport": {"width": 1920, "height": 1080},
            "timezone": "America/New_York"
        }
    }
    
    create_profile_response = requests.post("https://api.anchorbrowser.io/v1/profiles", 
        json=new_profile_config, {
        headers: {
            "anchor-api-key": ANCHOR_API_KEY,
            "Content-Type": "application/json",
        },
    })
    
    return create_profile_response.json()

def main():
    try:
        print("Managing browser profiles...")
        profiles = manage_profiles()
        print("Profiles configured:", profiles)

        print("Creating browser session with profile...")
        session = create_session_with_profile()
        print("Session created:", session["id"])

        print("Collecting Grafana data...")
        result = collect_grafana_data(session)
        
        print("Data collection completed!")
        print("Data:", result["data"])
        print("Screenshot saved:", result["screenshot"])
        print("Live view URL:", session["live_view_url"])
        
    except Exception as error:
        print("Error:", error)

if __name__ == "__main__":
    main()
```

### Browser Profiles Feature

The **Profiles** feature in AnchorBrowser allows you to maintain consistent browser configurations across sessions:

#### Profile Benefits

- **Consistent User Experience**: Maintain cookies, local storage, and browser settings
- **Authentication Persistence**: Keep login sessions across multiple sessions
- **Custom Settings**: Configure user agents, viewports, timezones, and more
- **Profile Reuse**: Use the same profile for multiple monitoring sessions

#### Profile Configuration

```javascript
const profileConfig = {
    name: "monitoring-user",
    settings: {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        viewport: { width: 1920, height: 1080 },
        timezone: "America/New_York",
        language: "en-US",
        geolocation: { latitude: 40.7128, longitude: -74.0060 }
    },
    persist: true  // Keep profile after session closes
};
```

#### Profile Management API

```javascript
// List all profiles
const profiles = await axios.get("https://api.anchorbrowser.io/v1/profiles", {
    headers: { "anchor-api-key": ANCHOR_API_KEY }
});

// Create new profile
const newProfile = await axios.post("https://api.anchorbrowser.io/v1/profiles", 
    profileConfig, {
    headers: { "anchor-api-key": ANCHOR_API_KEY }
});

// Delete profile
await axios.delete(`https://api.anchorbrowser.io/v1/profiles/${profileId}`, {
    headers: { "anchor-api-key": ANCHOR_API_KEY }
});
```

### Key Features Demonstrated

- **Persistent Profiles**: Maintain browser state across sessions
- **Data Extraction**: AI-powered extraction of structured data from dashboards
- **Screenshot Capture**: Visual verification of data collection
- **Session Recording**: Complete audit trail of data collection process
- **Error Handling**: Robust error handling for production environments

## Advanced Features

### Session Management

```javascript
// Advanced session configuration
const advancedConfig = {
    session: {
        recording: true,
        proxy: {
            active: true,
            type: "anchor_residential",
            country_code: "us"
        }
    },
    browser: {
        headless: { active: false },  // Enable live view
        adblock: { active: true },    // Block ads
        popup_blocker: { active: true }, // Block popups
        captcha_solver: { active: true } // Auto-solve captchas
    },
    max_duration: 120,  // 2 hours
    idle_timeout: 15    // 15 minutes idle
};
```

### Error Handling and Retry Logic

```javascript
async function executeWithRetry(task, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await task();
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}
```

### Monitoring and Logging

```javascript
class AnchorBrowserMonitor {
    constructor() {
        this.metrics = {
            sessionsCreated: 0,
            tasksCompleted: 0,
            errors: 0,
            averageTaskTime: 0
        };
    }

    async trackTask(taskName, taskFunction) {
        const startTime = Date.now();
        try {
            const result = await taskFunction();
            this.metrics.tasksCompleted++;
            this.updateAverageTime(Date.now() - startTime);
            console.log(`✅ Task ${taskName} completed successfully`);
            return result;
        } catch (error) {
            this.metrics.errors++;
            console.error(`❌ Task ${taskName} failed:`, error);
            throw error;
        }
    }

    updateAverageTime(newTime) {
        const total = this.metrics.averageTaskTime * (this.metrics.tasksCompleted - 1) + newTime;
        this.metrics.averageTaskTime = total / this.metrics.tasksCompleted;
    }

    getMetrics() {
        return this.metrics;
    }
}
```

## Best Practices

### 1. Session Management

- **Use Session Timeouts**: Set appropriate `max_duration` and `idle_timeout` values
- **Clean Up Sessions**: Always terminate sessions when done
- **Session Reuse**: Reuse sessions for related tasks to improve performance

### 2. Error Handling

- **Implement Retry Logic**: Add exponential backoff for transient failures
- **Graceful Degradation**: Handle partial failures gracefully
- **Comprehensive Logging**: Log all operations for debugging

### 3. Performance Optimization

- **Profile Reuse**: Use persistent profiles for authenticated sessions
- **Batch Operations**: Group related tasks in single sessions
- **Resource Management**: Close browsers and terminate sessions promptly

### 4. Security

- **API Key Management**: Use environment variables for API keys
- **Proxy Usage**: Use appropriate proxies for geographic distribution
- **Session Isolation**: Use separate sessions for different user contexts

### 5. Monitoring

- **Session Recording**: Enable recording for audit trails
- **Live View**: Use live view for real-time monitoring
- **Metrics Tracking**: Track performance metrics and success rates

### 6. Production Deployment

- **Environment Configuration**: Use different configurations for dev/staging/prod
- **Load Balancing**: Distribute sessions across multiple proxy locations
- **Rate Limiting**: Implement appropriate rate limiting for API calls
- **Health Checks**: Monitor session health and browser availability

## Troubleshooting

### Common Issues

#### 1. Session Connection Failures

**Problem**: Unable to connect to browser session
```javascript
// Error: Failed to connect to browser session
const browser = await chromium.connectOverCDP(connectionString);
```

**Solution**: Check API key and session ID
```javascript
// Verify API key is set
if (!process.env.ANCHOR_API_KEY) {
    throw new Error("ANCHOR_API_KEY environment variable not set");
}

// Verify session exists
const sessionResponse = await axios.get(`https://api.anchorbrowser.io/v1/sessions/${sessionId}`, {
    headers: { "anchor-api-key": process.env.ANCHOR_API_KEY }
});
```

#### 2. AI Agent Failures

**Problem**: AI agent fails to execute tasks
```javascript
// Error: Worker.evaluate: SyntaxError: Unexpected token ':'
const result = await ai.evaluate(taskPayload);
```

**Solution**: Ensure proper JSON formatting
```javascript
// Correct way to pass task payload
const taskPayload = {
    prompt: "Your task description",
    provider: "openai",
    model: "gpt-4",
    highlight_elements: true
};

const result = await ai.evaluate(JSON.stringify(taskPayload));
```

#### 3. Proxy Connection Issues

**Problem**: Proxy connection fails or returns errors
```javascript
// Error: Proxy connection timeout
```

**Solution**: Check proxy configuration and try different locations
```javascript
const proxyConfig = {
    active: true,
    type: "anchor_residential",
    country_code: "us"  // Try different country codes
};
```

#### 4. Session Timeout Issues

**Problem**: Sessions timeout before task completion
```javascript
// Error: Session expired
```

**Solution**: Increase timeout values and implement session renewal
```javascript
const sessionConfig = {
    max_duration: 120,  // 2 hours
    idle_timeout: 30    // 30 minutes idle
};

// Implement session renewal logic
async function renewSession(sessionId) {
    const response = await axios.post(`https://api.anchorbrowser.io/v1/sessions/${sessionId}/renew`, {}, {
        headers: { "anchor-api-key": process.env.ANCHOR_API_KEY }
    });
    return response.data;
}
```

### Debugging Tips

1. **Enable Session Recording**: Always enable recording for debugging
2. **Use Live View**: Monitor sessions in real-time
3. **Check Logs**: Review session logs for detailed error information
4. **Test Incrementally**: Test each component separately before integration

### Performance Optimization

1. **Session Pooling**: Maintain a pool of active sessions
2. **Task Batching**: Group related tasks in single sessions
3. **Profile Caching**: Cache and reuse browser profiles
4. **Connection Reuse**: Reuse browser connections when possible

## API Reference

### Session Management

#### Create Session
```javascript
POST https://api.anchorbrowser.io/v1/sessions
```

#### Get Session
```javascript
GET https://api.anchorbrowser.io/v1/sessions/{sessionId}
```

#### Delete Session
```javascript
DELETE https://api.anchorbrowser.io/v1/sessions/{sessionId}
```

### Profile Management

#### List Profiles
```javascript
GET https://api.anchorbrowser.io/v1/profiles
```

#### Create Profile
```javascript
POST https://api.anchorbrowser.io/v1/profiles
```

#### Delete Profile
```javascript
DELETE https://api.anchorbrowser.io/v1/profiles/{profileId}
```

### Tools

#### Fetch Webpage
```javascript
POST https://api.anchorbrowser.io/v1/tools/fetch-webpage
```

#### Take Screenshot
```javascript
POST https://api.anchorbrowser.io/v1/tools/screenshot
```

#### Perform Web Task
```javascript
POST https://api.anchorbrowser.io/v1/tools/perform-web-task
```

## Resources

- [AnchorBrowser Documentation](https://docs.anchorbrowser.io?utm_source=agents-towards-production)
- [API Reference](https://docs.anchorbrowser.io/api?utm_source=agents-towards-production)
- [Code Examples](https://docs.anchorbrowser.io/examples?utm_source=agents-towards-production)
- [Community Forum](https://community.anchorbrowser.io?utm_source=agents-towards-production)
- [GitHub Repository](https://github.com/anchorbrowser/anchorbrowser?utm_source=agents-towards-production)

## Support

For technical support and questions:

- **Documentation**: [docs.anchorbrowser.io](https://docs.anchorbrowser.io?utm_source=agents-towards-production)
- **Email**: support@anchorbrowser.io
- **Discord**: [Join our Discord community](https://discord.gg/anchorbrowser?utm_source=agents-towards-production)

---

*This guide is part of the Agents-Towards-Production repository, demonstrating how to integrate AnchorBrowser into production-ready AI agents.*