# Phase 1 proof — MCP Inspector CLI against the built server, 2026-09-19

Server: `node apps/mcp/dist/server.js` (MCP_TOKEN=demo SEED=1), protocol 2025-11-25, Streamable HTTP, stateless, JSON responses.
Client: `npx @modelcontextprotocol/inspector --cli http://localhost:3101/mcp --transport http --header "Authorization: Bearer demo"`

## tools/list
```json
{
  "tools": [
    {
      "name": "get_property_guide",
      "title": "Ask the house",
      "description": "Answer a guest's question about how something in this house works (hot tub, wifi, heating, checkout, bins, coffee). Call this first for any 'how do I' or 'where is' question. Returns the host's own instructions and, when there is one, a picture to show.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "question": {
            "type": "string",
            "description": "The guest's question, as spoken"
          }
        },
        "required": [
          "question"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      },
      "execution": {
        "taskSupport": "forbidden"
      }
    },
    {
      "name": "get_current_stay",
      "title": "Who is staying",
      "description": "Get the current booking at this house: guest name, party size, check-in and check-out dates, checkout time, and the next arrival. Use it to personalise a reply or before scheduling anything at the property.",
      "inputSchema": {
        "type": "object",
        "properties": {},
        "$schema": "http://json-schema.org/draft-07/schema#"
      },
      "execution": {
        "taskSupport": "forbidden"
      }
    },
    {
      "name": "report_issue",
      "title": "Report a problem",
      "description": "Log something broken or wrong at the house (leak, no hot water, heating, appliance, noise, pests). Creates a maintenance ticket for the host and returns its number. Use urgency 'urgent' only when there is water, gas, electrical danger or the guest cannot stay.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "category": {
            "type": "string",
            "enum": [
              "plumbing",
              "electrical",
              "heating",
              "appliance",
              "cleaning",
              "other"
            ]
          },
          "description": {
            "type": "string",
            "description": "What the guest said, in their words"
          },
          "urgency": {
            "type": "string",
            "enum": [
              "normal",
              "urgent"
            ],
            "default": "normal"
          }
        },
        "required": [
          "category",
          "description"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      },
      "execution": {
        "taskSupport": "forbidden"
      }
    }
  ]
}
```

## tools/call
```
### get_property_guide "how do I turn on the hot tub?"
{
  "content": [
    {
      "type": "text",
      "text": "Lift the grey cover and fold it onto the rail. Press the power button on the panel by the steps, then JETS. It takes about 15 minutes to warm up. Please put the cover back when you're done."
    }
  ],
  "structuredContent": {
    "found": true,
    "topic": "hot tub",
    "answer": "Lift the grey cover and fold it onto the rail. Press the power button on the panel by the steps, then JETS. It takes about 15 minutes to warm up. Please put the cover back when you're done.",
    "imageUrl": "/img/lakeview/hot-tub.jpg"
  }
}

### get_current_stay
{
  "content": [
    {
      "type": "text",
      "text": "Priya (2 guests) is staying at Lakeview Cabin until 2026-09-22; checkout is 11:00. The next guests arrive 2026-09-23."
    }
  ],
  "structuredContent": {
    "property": {
      "id": "lakeview",
      "name": "Lakeview Cabin",
      "address": "14 Shore Road, Lake Placid, NY",
      "checkout_time": "11:00",
      "wifi_ssid": "Lakeview-Guest"
    },
    "stay": {
      "id": "stay-current",
      "guest_name": "Priya",
      "guests": 2,
      "check_in": "2026-09-18",
      "check_out": "2026-09-22"
    },
    "nextStay": {
      "id": "stay-next",
      "guest_name": "The Okafors",
      "guests": 4,
      "check_in": "2026-09-23",
      "check_out": "2026-09-28"
    }
  }
}

### report_issue plumbing "the shower is dripping"
{
  "content": [
    {
      "type": "text",
      "text": "Logged as ticket 1. The host has been told."
    }
  ],
  "structuredContent": {
    "ticketId": 1,
    "category": "plumbing",
    "urgency": "normal",
    "status": "open",
    "createdAt": "2026-09-19T13:50:24.387Z"
  }
}
```
