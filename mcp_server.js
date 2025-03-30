#!/usr/bin/env node

// mcp_server.js - Entry point for the MCP server
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import services
import { ConfigService } from './services/configService.js';
import { LoggerService } from './services/loggerService.js';
import { FileService } from './services/fileService.js';
import { GitService } from './services/gitService.js';
import { ToolService } from './services/toolService.js';

// Initialize and start the MCP server
async function startMcpServer() {
  try {
    // Initialize configuration
    const configService = new ConfigService();
    
    // Initialize logger
    const loggerService = new LoggerService(configService.get('logFile'));
    await loggerService.initialize();
    const logger = (message) => loggerService.log(message);
    
    logger('Starting MCP server...');
    
    // Initialize file service
    const fileService = new FileService(configService.get('baseDirectory'), logger);
    
    // Ensure base directory exists
    const dirExists = await fileService.ensureDirectoryExists(configService.get('baseDirectory'));
    if (!dirExists) {
      logger('Failed to ensure base directory exists. Exiting.');
      process.exit(1);
    }
    
    logger(`Using BASE_DIRECTORY: ${fileService.getBaseDirectory()}`);
    
    // Initialize git service
    const gitService = new GitService(configService.get('baseDirectory'), logger);
    
    // Create server instance
    const server = new McpServer({
      name: configService.get('serverName'),
      version: configService.get('serverVersion'),
      capabilities: {
        resources: {},
        tools: {},
        authentication: {
          supported: false
        },
        fileSystem: {
          supported: true
        }
      },
    });
    
    // Initialize and register tools
    const toolService = new ToolService(server, fileService, gitService, logger);
    toolService.registerAllTools();
    
    // Set up error handlers
    process.on('uncaughtException', (err) => {
      logger(`Uncaught exception: ${err.message}`);
      logger(err.stack || "No stack trace available");
    });
    
    process.on('unhandledRejection', (reason) => {
      const reasonStr = reason instanceof Error ? reason.message : String(reason);
      logger(`Unhandled rejection: ${reasonStr}`);
    });
    
    // Connect to transport and start server
    logger('Connecting to transport...');
    const transport = new StdioServerTransport();
    
    try {
      await server.connect(transport);
      logger('Server successfully connected and started');
      
      // Keep the process alive
      setInterval(() => {}, 60000);
    } catch (error) {
      logger(`Error connecting server: ${error.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Fatal error in startMcpServer: ${error.message}`);
    console.error(error.stack || "No stack trace available");
    process.exit(1);
  }
}

// Run the server
startMcpServer().catch((error) => {
  console.error(`Fatal error: ${error.message}\n${error.stack || ''}`);
  process.exit(1);
});
