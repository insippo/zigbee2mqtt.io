#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class VuePressMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vuepress-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_docs',
            description: 'List all documentation files in the docs directory',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'read_doc',
            description: 'Read a specific documentation file',
            inputSchema: {
              type: 'object',
              properties: {
                filepath: {
                  type: 'string',
                  description: 'Path to the documentation file relative to docs/',
                },
              },
              required: ['filepath'],
            },
          },
          {
            name: 'search_docs',
            description: 'Search for content in documentation files',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                filetype: {
                  type: 'string',
                  description: 'File type to search in (md, vue, etc.)',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'list_devices',
            description: 'List supported devices from the devices component',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'run_dev_server',
            description: 'Start the VuePress development server',
            inputSchema: {
              type: 'object',
              properties: {
                include_devices: {
                  type: 'boolean',
                  description: 'Whether to include devices in the build',
                  default: false,
                },
              },
            },
          },
          {
            name: 'build_docs',
            description: 'Build the documentation for production',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'generate_docs',
            description: 'Generate documentation from source',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_project_info',
            description: 'Get information about the current project',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_docs':
            return await this.listDocs();
          case 'read_doc':
            return await this.readDoc(args.filepath);
          case 'search_docs':
            return await this.searchDocs(args.query, args.filetype);
          case 'list_devices':
            return await this.listDevices();
          case 'run_dev_server':
            return await this.runDevServer(args.include_devices);
          case 'build_docs':
            return await this.buildDocs();
          case 'generate_docs':
            return await this.generateDocs();
          case 'get_project_info':
            return await this.getProjectInfo();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async listDocs() {
    const docsPath = path.join(process.cwd(), 'docs');
    const files = await this.recursiveReadDir(docsPath);
    
    return {
      content: [
        {
          type: 'text',
          text: `Documentation files found:\n\n${files.map(f => `- ${f}`).join('\n')}`,
        },
      ],
    };
  }

  async readDoc(filepath) {
    const fullPath = path.join(process.cwd(), 'docs', filepath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    return {
      content: [
        {
          type: 'text',
          text: `Content of ${filepath}:\n\n${content}`,
        },
      ],
    };
  }

  async searchDocs(query, filetype = 'md') {
    const docsPath = path.join(process.cwd(), 'docs');
    const files = await this.recursiveReadDir(docsPath, filetype);
    const results = [];

    for (const file of files) {
      const content = await fs.readFile(path.join(docsPath, file), 'utf-8');
      if (content.toLowerCase().includes(query.toLowerCase())) {
        results.push(file);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Search results for "${query}":\n\n${results.map(f => `- ${f}`).join('\n')}`,
        },
      ],
    };
  }

  async listDevices() {
    const devicesPath = path.join(process.cwd(), 'supported-devices-component');
    try {
      const files = await fs.readdir(devicesPath);
      const deviceFiles = files.filter(f => f.endsWith('.vue') || f.endsWith('.js'));
      
      return {
        content: [
          {
            type: 'text',
            text: `Supported device components:\n\n${deviceFiles.map(f => `- ${f}`).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error reading devices directory: ${error.message}`,
          },
        ],
      };
    }
  }

  async runDevServer(includeDevices = false) {
    const script = includeDevices ? 'dev:devices' : 'dev';
    const command = `npm run ${script}`;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      return {
        content: [
          {
            type: 'text',
            text: `Development server started:\n\n${stdout}\n${stderr}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error starting development server: ${error.message}`,
          },
        ],
      };
    }
  }

  async buildDocs() {
    try {
      const { stdout, stderr } = await execAsync('npm run build');
      return {
        content: [
          {
            type: 'text',
            text: `Build completed:\n\n${stdout}\n${stderr}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error building documentation: ${error.message}`,
          },
        ],
      };
    }
  }

  async generateDocs() {
    try {
      const { stdout, stderr } = await execAsync('npm run docgen');
      return {
        content: [
          {
            type: 'text',
            text: `Documentation generation completed:\n\n${stdout}\n${stderr}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error generating documentation: ${error.message}`,
          },
        ],
      };
    }
  }

  async getProjectInfo() {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const scripts = Object.keys(packageJson.scripts);
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    return {
      content: [
        {
          type: 'text',
          text: `Project Information:\n\nName: ${packageJson.name}\nVersion: ${packageJson.version}\nDescription: ${packageJson.description}\n\nAvailable Scripts:\n${scripts.map(s => `- ${s}`).join('\n')}\n\nDependencies: ${dependencies.length}\nDev Dependencies: ${devDependencies.length}`,
        },
      ],
    };
  }

  async recursiveReadDir(dir, filetype = null) {
    const files = [];
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(process.cwd(), fullPath);
        
        if (item.isDirectory()) {
          const subFiles = await this.recursiveReadDir(fullPath, filetype);
          files.push(...subFiles);
        } else if (item.isFile()) {
          if (!filetype || item.name.endsWith(`.${filetype}`)) {
            files.push(relativePath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
    
    return files;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('VuePress MCP Server started');
  }
}

// Start the server
const server = new VuePressMCPServer();
server.run().catch(console.error);