#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

class Zigbee2MQTTMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'zigbee2mqtt-docs-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  setupTools() {
    // Tool to search documentation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'search_docs':
          return await this.searchDocs(args.query);
        case 'get_device_info':
          return await this.getDeviceInfo(args.device_name);
        case 'list_devices':
          return await this.listDevices();
        case 'get_project_info':
          return await this.getProjectInfo();
        case 'run_docgen':
          return await this.runDocgen();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async searchDocs(query) {
    try {
      const docsPath = path.join(process.cwd(), 'docs');
      const files = await this.findMarkdownFiles(docsPath);
      
      const results = [];
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          const relativePath = path.relative(process.cwd(), file);
          results.push({
            file: relativePath,
            matches: this.findMatches(content, query)
          });
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} files matching "${query}":\n\n${results.map(r => 
              `**${r.file}**\n${r.matches.slice(0, 3).map(m => `- ${m}`).join('\n')}`
            ).join('\n\n')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching docs: ${error.message}`
          }
        ]
      };
    }
  }

  async getDeviceInfo(deviceName) {
    try {
      const devicesPath = path.join(process.cwd(), 'docs', 'devices');
      const files = await this.findMarkdownFiles(devicesPath);
      
      const deviceFile = files.find(file => 
        path.basename(file, '.md').toLowerCase().includes(deviceName.toLowerCase())
      );

      if (!deviceFile) {
        return {
          content: [
            {
              type: 'text',
              text: `Device "${deviceName}" not found. Use list_devices to see available devices.`
            }
          ]
        };
      }

      const content = await fs.readFile(deviceFile, 'utf-8');
      const relativePath = path.relative(process.cwd(), deviceFile);
      
      return {
        content: [
          {
            type: 'text',
            text: `**Device: ${path.basename(deviceFile, '.md')}**\n\nPath: ${relativePath}\n\n${content}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting device info: ${error.message}`
          }
        ]
      };
    }
  }

  async listDevices() {
    try {
      const devicesPath = path.join(process.cwd(), 'docs', 'devices');
      const files = await this.findMarkdownFiles(devicesPath);
      
      const devices = files.map(file => path.basename(file, '.md')).sort();
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${devices.length} devices:\n\n${devices.slice(0, 50).join(', ')}${devices.length > 50 ? `\n\n... and ${devices.length - 50} more` : ''}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing devices: ${error.message}`
          }
        ]
      };
    }
  }

  async getProjectInfo() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const readme = await fs.readFile('README.md', 'utf-8');
      
      return {
        content: [
          {
            type: 'text',
            text: `**Zigbee2MQTT Documentation Project**

**Project Name:** ${packageJson.name}
**Version:** ${packageJson.version}
**Description:** ${packageJson.description}

**Available Scripts:**
${Object.entries(packageJson.scripts).map(([name, script]) => `- ${name}: ${script}`).join('\n')}

**Key Directories:**
- \`docs/\`: Main documentation
- \`docgen/\`: Documentation generation scripts
- \`public/\`: Static assets
- \`supported-devices-component/\`: Vue.js components

**Quick Start:**
1. Install dependencies: \`npm ci\`
2. Run dev server: \`npm run dev\`
3. Generate device docs: \`npm run docgen\`
4. Build for production: \`npm run build\`

${readme.split('\n').slice(0, 20).join('\n')}...`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting project info: ${error.message}`
          }
        ]
      };
    }
  }

  async runDocgen() {
    try {
      const { exec } = require('child_process');
      
      return new Promise((resolve) => {
        exec('npm run docgen', { cwd: process.cwd() }, (error, stdout, stderr) => {
          if (error) {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `Error running docgen: ${error.message}\n\nStderr: ${stderr}`
                }
              ]
            });
          } else {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `Docgen completed successfully!\n\nOutput:\n${stdout}`
                }
              ]
            });
          }
        });
      });
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error running docgen: ${error.message}`
          }
        ]
      };
    }
  }

  async findMarkdownFiles(dir) {
    return new Promise((resolve, reject) => {
      glob(path.join(dir, '**/*.md'), (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }

  findMatches(content, query) {
    const lines = content.split('\n');
    const matches = [];
    const queryLower = query.toLowerCase();
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(queryLower)) {
        matches.push(`Line ${index + 1}: ${line.trim()}`);
      }
    });
    
    return matches;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Zigbee2MQTT MCP Server started');
  }
}

// Start the server
const server = new Zigbee2MQTTMCPServer();
server.run().catch(console.error);