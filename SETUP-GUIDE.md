# Zigbee2MQTT MCP Server Setup Guide

This guide will help you set up and use the MCP (Model Context Protocol) server for the Zigbee2MQTT documentation project.

## Prerequisites

- Node.js 16.x (required for VuePress compatibility)
- npm or yarn package manager
- Access to the Zigbee2MQTT documentation repository

## Installation Steps

### 1. Install Dependencies

```bash
# Make sure you're using Node.js 16
nvm use 16

# Install project dependencies
npm install
```

### 2. Verify Installation

```bash
# Test the MCP server
npm run mcp-server
```

The server should start and display "Zigbee2MQTT MCP Server started" in the console.

### 3. Make Server Executable

```bash
chmod +x mcp-server.js
```

## Available Tools

The MCP server provides the following tools:

### 1. `search_docs`
Search through the Zigbee2MQTT documentation for specific terms.

**Usage:**
```json
{
  "query": "MQTT configuration"
}
```

### 2. `get_device_info`
Get detailed information about a specific Zigbee device.

**Usage:**
```json
{
  "device_name": "TS0601"
}
```

### 3. `list_devices`
List all available Zigbee devices in the documentation.

**Usage:**
```json
{}
```

### 4. `get_project_info`
Get information about the project structure and available commands.

**Usage:**
```json
{}
```

### 5. `run_docgen`
Run the documentation generation script.

**Usage:**
```json
{}
```

## Integration with MCP Clients

### For Claude Desktop

1. Open Claude Desktop settings
2. Navigate to the MCP configuration section
3. Add the following configuration:

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

### For Other MCP Clients

Use the configuration from `mcp-client-config.json` as a reference for your specific MCP client.

## Testing the Server

Run the test script to verify everything is working:

```bash
node test-mcp.js
```

This will test all available tools and show sample outputs.

## Common Use Cases

### 1. Finding Device Information

When working with Zigbee devices, you can quickly look up device specifications:

```
Use get_device_info with device_name: "TS0601"
```

### 2. Searching Documentation

When you need to find specific information in the docs:

```
Use search_docs with query: "MQTT broker setup"
```

### 3. Project Management

When working on the documentation project:

```
Use get_project_info to understand the project structure
Use run_docgen to update device documentation
```

## Troubleshooting

### Node.js Version Issues

If you encounter build errors, ensure you're using Node.js 16:

```bash
nvm install 16
nvm use 16
npm install
```

### Permission Issues

If the server won't start, check file permissions:

```bash
chmod +x mcp-server.js
```

### MCP Client Connection Issues

1. Verify the server path is correct
2. Ensure Node.js is in your PATH
3. Check that all dependencies are installed

## Development

### Adding New Tools

1. Edit `mcp-server.js` to add new tool handlers
2. Update the tool schemas in `mcp-server-config.json`
3. Test your new tools
4. Update this documentation

### Modifying Existing Tools

1. Locate the tool handler in `mcp-server.js`
2. Make your changes
3. Test the modified tool
4. Update documentation if needed

## Project Structure

```
├── mcp-server.js              # Main MCP server implementation
├── mcp-server-config.json     # Server configuration
├── mcp-client-config.json     # Client configuration example
├── test-mcp.js               # Test script
├── MCP-SERVER-README.md      # Detailed server documentation
├── SETUP-GUIDE.md            # This setup guide
├── package.json              # Project dependencies
└── docs/                     # Zigbee2MQTT documentation
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify Node.js version compatibility
3. Ensure all dependencies are properly installed
4. Check the MCP client configuration

## Contributing

To contribute to the MCP server:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This MCP server is part of the Zigbee2MQTT documentation project and follows the same license terms.