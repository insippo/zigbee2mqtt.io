#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class SimpleMCPServer {
  constructor() {
    this.setupStdin();
    this.setupStdout();
  }

  setupStdin() {
    process.stdin.setEncoding('utf8');
    let buffer = '';
    
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      
      // Try to parse complete JSON messages
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const message = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);
        
        if (message) {
          try {
            const parsed = JSON.parse(message);
            this.handleMessage(parsed);
          } catch (error) {
            this.sendError('Invalid JSON', error.message);
          }
        }
      }
    });
  }

  setupStdout() {
    // Ensure stdout is unbuffered
    if (process.stdout.isTTY) {
      process.stdout.setRawMode(false);
    }
  }

  sendResponse(id, result) {
    const response = {
      jsonrpc: '2.0',
      id,
      result
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }

  sendError(id, error) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code: -1,
        message: error
      }
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }

  async handleMessage(message) {
    const { id, method, params } = message;

    try {
      switch (method) {
        case 'initialize':
          await this.handleInitialize(id, params);
          break;
        case 'tools/list':
          await this.handleListTools(id, params);
          break;
        case 'tools/call':
          await this.handleCallTool(id, params);
          break;
        default:
          this.sendError(id, `Unknown method: ${method}`);
      }
    } catch (error) {
      this.sendError(id, error.message);
    }
  }

  async handleInitialize(id, params) {
    const result = {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'vuepress-mcp-server',
        version: '1.0.0'
      }
    };
    this.sendResponse(id, result);
  }

  async handleListTools(id, params) {
    const tools = [
      {
        name: 'list_docs',
        description: 'List all documentation files in the docs directory',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'read_doc',
        description: 'Read a specific documentation file',
        inputSchema: {
          type: 'object',
          properties: {
            filepath: {
              type: 'string',
              description: 'Path to the documentation file relative to docs/'
            }
          },
          required: ['filepath']
        }
      },
      {
        name: 'search_docs',
        description: 'Search for content in documentation files',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            filetype: {
              type: 'string',
              description: 'File type to search in (md, vue, etc.)'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'list_devices',
        description: 'List supported devices from the devices component',
        inputSchema: {
          type: 'object',
          properties: {}
        }
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
              default: false
            }
          }
        }
      },
      {
        name: 'build_docs',
        description: 'Build the documentation for production',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'generate_docs',
        description: 'Generate documentation from source',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_project_info',
        description: 'Get information about the current project',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];

    this.sendResponse(id, { tools });
  }

  async handleCallTool(id, params) {
    const { name, arguments: args } = params;

    try {
      let result;
      switch (name) {
        case 'list_docs':
          result = await this.listDocs();
          break;
        case 'read_doc':
          result = await this.readDoc(args.filepath);
          break;
        case 'search_docs':
          result = await this.searchDocs(args.query, args.filetype);
          break;
        case 'list_devices':
          result = await this.listDevices();
          break;
        case 'run_dev_server':
          result = await this.runDevServer(args.include_devices);
          break;
        case 'build_docs':
          result = await this.buildDocs();
          break;
        case 'generate_docs':
          result = await this.generateDocs();
          break;
        case 'get_project_info':
          result = await this.getProjectInfo();
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      this.sendResponse(id, {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      });
    } catch (error) {
      this.sendError(id, error.message);
    }
  }

  async listDocs() {
    const docsPath = path.join(process.cwd(), 'docs');
    const files = await this.recursiveReadDir(docsPath);
    return `Documentation files found:\n\n${files.map(f => `- ${f}`).join('\n')}`;
  }

  async readDoc(filepath) {
    const fullPath = path.join(process.cwd(), 'docs', filepath);
    const content = await fs.readFile(fullPath, 'utf-8');
    return `Content of ${filepath}:\n\n${content}`;
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

    return `Search results for "${query}":\n\n${results.map(f => `- ${f}`).join('\n')}`;
  }

  async listDevices() {
    const devicesPath = path.join(process.cwd(), 'supported-devices-component');
    try {
      const files = await fs.readdir(devicesPath);
      const deviceFiles = files.filter(f => f.endsWith('.vue') || f.endsWith('.js'));
      return `Supported device components:\n\n${deviceFiles.map(f => `- ${f}`).join('\n')}`;
    } catch (error) {
      return `Error reading devices directory: ${error.message}`;
    }
  }

  async runDevServer(includeDevices = false) {
    const script = includeDevices ? 'dev:devices' : 'dev';
    const command = `npm run ${script}`;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      return `Development server started:\n\n${stdout}\n${stderr}`;
    } catch (error) {
      return `Error starting development server: ${error.message}`;
    }
  }

  async buildDocs() {
    try {
      const { stdout, stderr } = await execAsync('npm run build');
      return `Build completed:\n\n${stdout}\n${stderr}`;
    } catch (error) {
      return `Error building documentation: ${error.message}`;
    }
  }

  async generateDocs() {
    try {
      const { stdout, stderr } = await execAsync('npm run docgen');
      return `Documentation generation completed:\n\n${stdout}\n${stderr}`;
    } catch (error) {
      return `Error generating documentation: ${error.message}`;
    }
  }

  async getProjectInfo() {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const scripts = Object.keys(packageJson.scripts);
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    return `Project Information:\n\nName: ${packageJson.name}\nVersion: ${packageJson.version}\nDescription: ${packageJson.description}\n\nAvailable Scripts:\n${scripts.map(s => `- ${s}`).join('\n')}\n\nDependencies: ${dependencies.length}\nDev Dependencies: ${devDependencies.length}`;
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

  run() {
    console.error('Simple VuePress MCP Server started');
  }
}

// Start the server
const server = new SimpleMCPServer();
server.run();