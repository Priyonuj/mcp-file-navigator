#!/usr/bin/env node

// mcp_server.js - Simplified version for stability
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { z } from 'zod';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
let BASE_DIRECTORY = process.env.BASE_DIRECTORY || path.join(__dirname, 'files');
const LOG_FILE = path.join(__dirname, 'log/mcp_debug.log');

// Create a log file stream
const logStream = createWriteStream(LOG_FILE, { flags: 'a' });

// Custom logger to avoid writing to stdout/stderr
function logger(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  // Write to log file, not to stdout
  logStream.write(logEntry);
}

// Ensure the base directory exists
async function ensureBaseDirectoryExists(directoryPath) {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
    logger(`Base directory ensured at: ${directoryPath}`);
    return true;
  } catch (error) {
    logger(`Error ensuring base directory: ${error.message}`);
    return false;
  }
}

// Validate and resolve path to prevent directory traversal
function resolveSafePath(requestedPath) {
  try {
    // Handle root path request or empty path
    if (!requestedPath || requestedPath === '/' || requestedPath === '\\') {
      return BASE_DIRECTORY;
    }
    
    // Strip leading slashes to ensure path is treated as relative
    let cleanPath = requestedPath;
    while (cleanPath.startsWith('/') || cleanPath.startsWith('\\')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // Normalize to prevent directory traversal
    const normalizedPath = path.normalize(cleanPath);
    
    // Check if the path tries to go outside the base directory
    if (normalizedPath.includes('..')) {
      throw new Error('Directory traversal attempt detected');
    }
    
    // Use path.join to properly handle relative paths
    const absolutePath = path.join(BASE_DIRECTORY, normalizedPath);
    
    // Extra safety check - verify the path is still within BASE_DIRECTORY
    const relativePath = path.relative(BASE_DIRECTORY, absolutePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new Error('Path resolves outside the base directory');
    }
    
    return absolutePath;
  } catch (error) {
    logger(`Path resolution error: ${error.message}`);
    throw error;
  }
}

// Initialize and start the MCP server
async function startMcpServer() {
  try {
    logger('Starting MCP server...');
    
    // Ensure base directory exists
    const dirExists = await ensureBaseDirectoryExists(BASE_DIRECTORY);
    if (!dirExists) {
      logger('Failed to ensure base directory exists. Exiting.');
      process.exit(1);
    }
    
    logger(`Using BASE_DIRECTORY: ${BASE_DIRECTORY}`);
    
    // Create server instance
    const server = new McpServer({
      name: "file-server-mcp",
      version: "1.0.0",
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
    
    // New tool to set base directory
    server.tool(
      "set_base_directory",
      "Set the base directory for file operations",
      {
        path: z.string().describe("Absolute path to the new base directory")
      },
      async ({ path: newBasePath }) => {
        logger(`set_base_directory called with: ${JSON.stringify(newBasePath)}`);
        
        try {
          // Validate the new path
          if (!path.isAbsolute(newBasePath)) {
            return {
              content: [{ type: "text", text: `Error: Path must be absolute. Please provide a full path.` }]
            };
          }
          
          // Check if the path exists or can be created
          const dirExists = await ensureBaseDirectoryExists(newBasePath);
          if (!dirExists) {
            return {
              content: [{ type: "text", text: `Error: Could not create or access directory at: ${newBasePath}` }]
            };
          }
          
          // Update the base directory
          const oldPath = BASE_DIRECTORY;
          BASE_DIRECTORY = newBasePath;
          
          logger(`Base directory changed from ${oldPath} to ${BASE_DIRECTORY}`);
          
          return {
            content: [{ type: "text", text: `Base directory successfully set to: ${BASE_DIRECTORY}` }]
          };
        } catch (error) {
          logger(`Error in set_base_directory: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error setting base directory: ${error.message}` }]
          };
        }
      }
    );

    // Register get_base_directory tool
    server.tool(
      "get_base_directory",
      "Get the current base directory for file operations",
      {},
      async () => {
        logger(`get_base_directory called`);
        
        return {
          content: [{ type: "text", text: `Current BASE_DIRECTORY: ${BASE_DIRECTORY}` }]
        };
      }
    );
    
    // Register simple list_files tool
    server.tool(
      "list_files",
      "List files in a specified directory",
      {
        directory: z.string().optional().describe("Directory path to list (defaults to root)")
      },
      async ({ directory }) => {
        logger(`list_files called with: ${JSON.stringify(directory)}`);
        
        try {
          const safePath = resolveSafePath(directory || '');
          
          // List files
          const entries = await fs.readdir(safePath, { withFileTypes: true });
          const files = entries.map(entry => `${entry.isDirectory() ? '[DIR]' : '[FILE]'} ${entry.name}`).join('\n');
          
          return {
            content: [{ type: "text", text: `Files in ${directory || 'root'}:\n\n${files}` }]
          };
        } catch (error) {
          logger(`Error in list_files: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error listing files: ${error.message}` }]
          };
        }
      }
    );
    
    // Register simple read_file tool
    server.tool(
      "read_file",
      "Read the content of a file",
      {
        path: z.string().describe("Path to the file to read")
      },
      async ({ path: filePath }) => {
        logger(`read_file called with: ${JSON.stringify(filePath)}`);
        
        try {
          const safePath = resolveSafePath(filePath);
          
          // Check if it's a directory
          const stats = await fs.stat(safePath);
          if (stats.isDirectory()) {
            const entries = await fs.readdir(safePath, { withFileTypes: true });
            const files = entries.map(entry => `${entry.isDirectory() ? '[DIR]' : '[FILE]'} ${entry.name}`).join('\n');
            return {
              content: [{ type: "text", text: `Directory: ${filePath}\n\n${files}` }]
            };
          }
          
          // Read file
          const content = await fs.readFile(safePath, 'utf8');
          return {
            content: [{ type: "text", text: `File: ${filePath}\n\n${content}` }]
          };
        } catch (error) {
          logger(`Error in read_file: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error reading file: ${error.message}` }]
          };
        }
      }
    );
    
    // Register simple write_file tool
    server.tool(
      "write_file",
      "Write content to a file",
      {
        path: z.string().describe("Path to the file to write"),
        content: z.string().describe("Content to write to the file")
      },
      async ({ path: filePath, content }) => {
        logger(`write_file called with path: ${JSON.stringify(filePath)}`);
        
        try {
          const safePath = resolveSafePath(filePath);
          
          // Create directory if needed
          const dirPath = path.dirname(safePath);
          await fs.mkdir(dirPath, { recursive: true });
          
          // Write file
          await fs.writeFile(safePath, content, 'utf8');
          return {
            content: [{ type: "text", text: `Successfully wrote to file: ${filePath}` }]
          };
        } catch (error) {
          logger(`Error in write_file: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error writing file: ${error.message}` }]
          };
        }
      }
    );
    
    // Register simple delete_file tool
    server.tool(
      "delete_file",
      "Delete a file or directory",
      {
        path: z.string().describe("Path to the file or directory to delete")
      },
      async ({ path: filePath }) => {
        logger(`delete_file called with: ${JSON.stringify(filePath)}`);
        
        try {
          const safePath = resolveSafePath(filePath);
          
          // Check if it exists
          const stats = await fs.stat(safePath);
          
          if (stats.isDirectory()) {
            await fs.rm(safePath, { recursive: true, force: true });
          } else {
            await fs.unlink(safePath);
          }
          
          return {
            content: [{ type: "text", text: `Successfully deleted: ${filePath}` }]
          };
        } catch (error) {
          logger(`Error in delete_file: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error deleting file: ${error.message}` }]
          };
        }
      }
    );
    
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
    logger(`Fatal error in startMcpServer: ${error.message}`);
    logger(error.stack || "No stack trace available");
    process.exit(1);
  }
}

// Run the server
startMcpServer().catch((error) => {
  logStream.write(`Fatal error: ${error.message}\n${error.stack || ''}\n`);
  process.exit(1);
});