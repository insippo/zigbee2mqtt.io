# VuePress MCP Server

This is a Model Context Protocol (MCP) server designed to help manage and interact with VuePress documentation projects.

## Features

The MCP server provides the following tools:

### Documentation Management
- **list_docs**: List all documentation files in the docs directory
- **read_doc**: Read a specific documentation file
- **search_docs**: Search for content in documentation files

### Device Management
- **list_devices**: List supported devices from the devices component

### Development Tools
- **run_dev_server**: Start the VuePress development server
- **build_docs**: Build the documentation for production
- **generate_docs**: Generate documentation from source

### Project Information
- **get_project_info**: Get information about the current project

## Installation

1. Install the MCP SDK:
```bash
npm install @modelcontextprotocol/sdk
```

2. Make the server executable:
```bash
chmod +x mcp-server.js
```

## Usage

### Starting the Server

The server can be started directly:
```bash
node mcp-server.js
```

Or using npm:
```bash
npm start
```

### Integration with MCP Clients

To use this server with an MCP client, add the following configuration to your client's config file:

```json
{
  "mcpServers": {
    "vuepress-mcp": {
      "command": "node",
      "args": ["/path/to/your/project/mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Available Tools

### list_docs
Lists all documentation files in the docs directory.

**Parameters:** None

**Example:**
```json
{
  "name": "list_docs",
  "arguments": {}
}
```

### read_doc
Reads a specific documentation file.

**Parameters:**
- `filepath` (string, required): Path to the documentation file relative to docs/

**Example:**
```json
{
  "name": "read_doc",
  "arguments": {
    "filepath": "guide/README.md"
  }
}
```

### search_docs
Searches for content in documentation files.

**Parameters:**
- `query` (string, required): Search query
- `filetype` (string, optional): File type to search in (md, vue, etc.)

**Example:**
```json
{
  "name": "search_docs",
  "arguments": {
    "query": "installation",
    "filetype": "md"
  }
}
```

### list_devices
Lists supported devices from the devices component.

**Parameters:** None

**Example:**
```json
{
  "name": "list_devices",
  "arguments": {}
}
```

### run_dev_server
Starts the VuePress development server.

**Parameters:**
- `include_devices` (boolean, optional): Whether to include devices in the build (default: false)

**Example:**
```json
{
  "name": "run_dev_server",
  "arguments": {
    "include_devices": true
  }
}
```

### build_docs
Builds the documentation for production.

**Parameters:** None

**Example:**
```json
{
  "name": "build_docs",
  "arguments": {}
}
```

### generate_docs
Generates documentation from source.

**Parameters:** None

**Example:**
```json
{
  "name": "generate_docs",
  "arguments": {}
}
```

### get_project_info
Gets information about the current project.

**Parameters:** None

**Example:**
```json
{
  "name": "get_project_info",
  "arguments": {}
}
```

## Development

### Adding New Tools

To add a new tool to the server:

1. Add the tool definition to the `tools` array in the `ListToolsRequestSchema` handler
2. Add a case for the tool in the `CallToolRequestSchema` handler
3. Implement the tool method in the `VuePressMCPServer` class

### Error Handling

The server includes comprehensive error handling. All errors are caught and returned as text content with an "Error:" prefix.

## Requirements

- Node.js 14 or higher
- Access to the VuePress project directory
- npm or yarn for package management

## License

MIT License