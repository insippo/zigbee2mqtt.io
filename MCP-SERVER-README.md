# Zigbee2MQTT MCP Server

This MCP (Model Context Protocol) server provides tools to interact with the Zigbee2MQTT documentation project.

## Installation

1. Install the MCP SDK dependency:
```bash
npm install
```

2. Make the server executable:
```bash
chmod +x mcp-server.js
```

## Available Tools

### 1. `search_docs`
Search through the Zigbee2MQTT documentation for specific terms or topics.

**Parameters:**
- `query` (string): The search term to look for in the documentation

**Example:**
```json
{
  "query": "MQTT"
}
```

### 2. `get_device_info`
Get detailed information about a specific Zigbee device.

**Parameters:**
- `device_name` (string): The name of the device to get information about

**Example:**
```json
{
  "device_name": "TS0601"
}
```

### 3. `list_devices`
List all available Zigbee devices in the documentation.

**Parameters:** None

### 4. `get_project_info`
Get information about the Zigbee2MQTT documentation project structure and available commands.

**Parameters:** None

### 5. `run_docgen`
Run the documentation generation script to update device pages.

**Parameters:** None

## Usage

### Running the Server

You can run the MCP server directly:

```bash
npm run mcp-server
```

Or directly with Node.js:

```bash
node mcp-server.js
```

### Integration with MCP Clients

To use this server with an MCP client, configure it in your client's configuration file:

```json
{
  "mcpServers": {
    "zigbee2mqtt-docs": {
      "command": "node",
      "args": ["mcp-server.js"],
      "env": {}
    }
  }
}
```

## Features

- **Documentation Search**: Search through all markdown files in the docs directory
- **Device Information**: Get detailed information about specific Zigbee devices
- **Device Listing**: List all available devices in the documentation
- **Project Information**: Get project structure and available commands
- **Docgen Integration**: Run the documentation generation script

## Project Context

This MCP server is designed specifically for the Zigbee2MQTT documentation project, which includes:

- VuePress-based documentation
- Device documentation generation
- Zigbee device information
- Project build and development tools

The server helps automate common tasks when working with the Zigbee2MQTT documentation, such as:
- Finding specific information in the docs
- Looking up device specifications
- Running documentation generation
- Understanding project structure

## Troubleshooting

If you encounter issues:

1. Make sure all dependencies are installed: `npm install`
2. Ensure you're in the correct directory (Zigbee2MQTT docs project root)
3. Check that Node.js version 16 is being used (as required by VuePress)
4. Verify the MCP SDK is properly installed

## Development

To modify the server:

1. Edit `mcp-server.js` to add new tools or modify existing ones
2. Update `mcp-server-config.json` to reflect any schema changes
3. Test your changes by running the server locally
4. Update this README to document new features