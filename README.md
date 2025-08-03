![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-homeassistantws

This is an n8n community node. It lets you use the Home Assistant Websocket API in your n8n workflows.

Home Assistant is an open source Smart Home Automation Platform.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  <!-- delete if no auth needed -->  
[Compatibility](#compatibility)  
[Usage](#usage)  <!-- delete if not using this section -->  
[Resources](#resources)  
[Version history](#version-history)  <!-- delete if not using this section -->  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Comparison to the core Home Assistant nodes

n8n comes with built-in Home Assistant nodes that use the REST API. This community node uses the WebSocket API, which provides significant advantages:

| Feature | Core Home Assistant Nodes | Home Assistant WS Node |
|---------|--------------------------|------------------------|
| **API Protocol** | REST API | WebSocket API |
| **Real-time Events** | ❌ Not Available | ✅ Real-time state changes |
| **State Triggers** | ❌ Not available | ✅ State change triggers |
| **Trigger Triggers** | ❌ Not available | ✅ Device trigger events |
| **Areas** | ❌ Not available | ✅ List and filter by areas |
| **Devices** | ❌ Not available | ✅ List and filter by devices |
| **Entities** | ✅ Basic operations | ✅ Advanced filtering and operations |
| **States** | ✅ Get/Set states | ✅ Get states |
| **Service Actions** | ✅ Execute services | ✅ Execute services with dynamic options |
| **Logbook** | ✅ Access to logbook entries | ✅ Access to logbook entries |
| **Categories** | ❌ Not available | ✅ Component-based filtering |
| **Camera** | ✅ Available | ❌ Not available

### Key Advantages of WebSocket API

- **Event-driven workflows**: Trigger workflows based on state changes or device events
- **More comprehensive API access**: Access to areas, devices, logbook, and advanced filtering
- **Generic Nodes**: access to all other websocket commands and subscriptions, including those from additional Home Assistant Plugins


## Operations

### Available Nodes

This package provides several nodes for different Home Assistant operations:

#### 1. **Home Assistant WS** (Main Node)
The primary node for interacting with Home Assistant via WebSocket API.

**Resources and Operations:**
- **Area**
  - `list` - Get all areas
- **Category** 
  - `list` - Get categories by scope
- **Device**
  - `list` - Get devices (optionally filtered by area)
- **Entity**
  - `list` - Get entities (with filtering by entity type, area, or device)
- **State**
  - `list` - Get states (with filtering by entity type, entity ID, or area)
- **Service Action**
  - `list` - Get available services
  - `execute` - Execute service calls with parameters
- **Logbook**
  - `read` - Read logbook entries (with time range, device, and entity filtering)

#### 2. **Home Assistant WS Trigger** (Trigger Node)
Triggers workflows based on Home Assistant events.

**Event Types:**
- **State Changed** - Trigger when entity states change
- **Trigger Fired** - Trigger when device triggers fire

#### 3. **Home Assistant Generic WS** (Generic Node)
Provides access to any WebSocket command not covered by the main node.

**Features:**
- Execute any WebSocket command type
- Support for parameters via key-value pairs or JSON
- Optional response handling
- Dynamic parameter support

#### 4. **Home Assistant WS Generic Trigger** (Generic Trigger Node)
Subscribe to any WebSocket event type not covered by the main trigger node.

**Features:**
- Subscribe to any event type
- Support for parameters via key-value pairs or JSON
- Real-time event streaming

## Credentials

Refer to [Core Home Assistant Docs](https://docs.n8n.io/integrations/builtin/credentials/homeassistant/) for the Credentials


## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Home Assistant Websocket API](https://developers.home-assistant.io/docs/api/websocket)

## Version history
* 1.0.0: Initial Release

