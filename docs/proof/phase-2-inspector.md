# Phase 2 proof — the three video interactions through MCP Inspector CLI, 2026-09-19

Same server/client as phase-1. 10 tools, 2 resources, 1 prompt.

```
### tools/list (names)
      "name": "get_property_guide",
      "name": "get_current_stay",
      "name": "report_issue",
      "name": "get_todays_agenda",
      "name": "list_vendors",
      "name": "schedule_repair",
      "name": "check_supplies",
      "name": "order_supply",
      "name": "notify_host",
      "name": "host_briefing",

### "the coffee pods are out" → check_supplies + order_supply
      "type": "text",
      "text": "coffee pods: 4 left, tin by the machine; spare box in the hall cupboard (low)"
      "type": "text",
      "text": "Ordered 2 coffee pods, arriving Sunday. Meanwhile: tin by the machine; spare box in the hall cupboard. The host has been told."

### "the shower is dripping" → report_issue + schedule_repair + get_todays_agenda
      "type": "text",
      "text": "Logged as ticket 1. The host has been told."
      "type": "text",
      "text": "Dan Whitlock Plumbing is booked for Sunday at 15:00 for the plumbing issue. I've let Priya and the host know."
    "avoidedDays": []

### host_briefing
      "type": "text",
      "text": "Priya is in until 2026-09-22. 3 events: Order #1: 2 × coffee pods (POD-LUNGO-40), ordered, arrives 2026-09-20; #1 plumbing: the shower is dripping (reported by Priya); #1 plumbing: Dan Whitlock Plumbing booked Sunday 2026-09-20 15:00. Low: coffee pods, firewood bundle. Next: The Okafors on 2026-09-23."

### resources/list
      "uri": "property://lakeview/guide",
      "uri": "stay://current",
### prompts/list
      "name": "host-morning-briefing",
```
