// services/toolService.js
import { z } from 'zod';
import path from 'path'; // Added the path import that was missing

/**
 * Service for registering MCP tools
 */
export class ToolService {
  /**
   * Create a new tool service
   * @param {McpServer} server - The MCP server instance
   * @param {FileService} fileService - The file service instance
   * @param {GitService} gitService - The git service instance
   * @param {function} logger - The logger function
   */
  constructor(server, fileService, gitService, logger) {
    this.server = server;
    this.fileService = fileService;
    this.gitService = gitService;
    this.logger = logger;
  }
  
  /**
   * Register all tools with the MCP server
   */
  registerAllTools() {
    this.registerFileTools();
    this.registerGitTools();
  }
  
  /**
   * Register file operation tools
   */
  registerFileTools() {
    // Register set_base_directory tool
    this.server.tool(
      "set_base_directory",
      "Set the base directory for file operations",
      {
        path: z.string().describe("Absolute path to the new base directory")
      },
      async ({ path: newBasePath }) => {
        this.logger(`set_base_directory called with: ${JSON.stringify(newBasePath)}`);
        
        try {
          // Validate the new path
          if (!path.isAbsolute(newBasePath)) {
            return {
              content: [{ type: "text", text: `Error: Path must be absolute. Please provide a full path.` }]
            };
          }
          
          // Check if the path exists or can be created
          const dirExists = await this.fileService.ensureDirectoryExists(newBasePath);
          if (!dirExists) {
            return {
              content: [{ type: "text", text: `Error: Could not create or access directory at: ${newBasePath}` }]
            };
          }
          
          // Update the base directory
          const oldPath = this.fileService.getBaseDirectory();
          this.fileService.setBaseDirectory(newBasePath);
          this.gitService.setBaseDirectory(newBasePath);
          
          this.logger(`Base directory changed from ${oldPath} to ${newBasePath}`);
          
          return {
            content: [{ type: "text", text: `Base directory successfully set to: ${newBasePath}` }]
          };
        } catch (error) {
          this.logger(`Error in set_base_directory: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error setting base directory: ${error.message}` }]
          };
        }
      }
    );

    // Register get_base_directory tool
    this.server.tool(
      "get_base_directory",
      "Get the current base directory for file operations",
      {},
      async () => {
        this.logger(`get_base_directory called`);
        
        return {
          content: [{ type: "text", text: `Current BASE_DIRECTORY: ${this.fileService.getBaseDirectory()}` }]
        };
      }
    );
    
    // Register list_files tool
    this.server.tool(
      "list_files",
      "List files in a specified directory",
      {
        directory: z.string().optional().describe("Directory path to list (defaults to root)")
      },
      async ({ directory }) => {
        this.logger(`list_files called with: ${JSON.stringify(directory)}`);
        
        try {
          const entries = await this.fileService.listFiles(directory || '');
          const files = entries
            .map(entry => `${entry.isDirectory ? '[DIR]' : '[FILE]'} ${entry.name}`)
            .join('\n');
          
          return {
            content: [{ type: "text", text: `Files in ${directory || 'root'}:\n\n${files}` }]
          };
        } catch (error) {
          this.logger(`Error in list_files: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error listing files: ${error.message}` }]
          };
        }
      }
    );
    
    // Register read_file tool
    this.server.tool(
      "read_file",
      "Read the content of a file",
      {
        path: z.string().describe("Path to the file to read")
      },
      async ({ path: filePath }) => {
        this.logger(`read_file called with: ${JSON.stringify(filePath)}`);
        
        try {
          const result = await this.fileService.readFile(filePath);
          
          if (result.isDirectory) {
            const files = result.entries
              .map(entry => `${entry.isDirectory ? '[DIR]' : '[FILE]'} ${entry.name}`)
              .join('\n');
            
            return {
              content: [{ type: "text", text: `Directory: ${filePath}\n\n${files}` }]
            };
          }
          
          return {
            content: [{ type: "text", text: `File: ${filePath}\n\n${result.content}` }]
          };
        } catch (error) {
          this.logger(`Error in read_file: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error reading file: ${error.message}` }]
          };
        }
      }
    );
    
    // Register write_file tool
    this.server.tool(
      "write_file",
      "Write content to a file",
      {
        path: z.string().describe("Path to the file to write"),
        content: z.string().describe("Content to write to the file")
      },
      async ({ path: filePath, content }) => {
        this.logger(`write_file called with path: ${JSON.stringify(filePath)}`);
        
        try {
          await this.fileService.writeFile(filePath, content);
          
          return {
            content: [{ type: "text", text: `Successfully wrote to file: ${filePath}` }]
          };
        } catch (error) {
          this.logger(`Error in write_file: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error writing file: ${error.message}` }]
          };
        }
      }
    );
    
    // Register delete_file tool
    this.server.tool(
      "delete_file",
      "Delete a file or directory",
      {
        path: z.string().describe("Path to the file or directory to delete")
      },
      async ({ path: filePath }) => {
        this.logger(`delete_file called with: ${JSON.stringify(filePath)}`);
        
        try {
          await this.fileService.deleteFile(filePath);
          
          return {
            content: [{ type: "text", text: `Successfully deleted: ${filePath}` }]
          };
        } catch (error) {
          this.logger(`Error in delete_file: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error deleting file: ${error.message}` }]
          };
        }
      }
    );
  }
  
  /**
   * Register git operation tools
   */
  registerGitTools() {
    // Register git_command tool
    this.server.tool(
      "git_command",
      "Execute a git command in the base directory",
      {
        command: z.string().min(1).describe("Git command to execute (without the 'git' prefix)"),
        shell: z.enum(['cmd', 'powershell', 'bash']).optional().describe("Shell to use for execution (defaults to system default)"),
      },
      async ({ command, shell }) => {
        this.logger(`git_command called with: ${JSON.stringify({ command, shell })}`);
        
        try {
          // Execute the git command
          const { stdout, stderr } = await this.gitService.executeGitCommand(command, shell);
          
          // Format the response
          let response;
          
          if (shell) {
            response = `Command executed using ${shell}:\n\n`;
          } else {
            response = `Git command executed:\n\n`;
          }
          
          if (stdout) {
            response += `Output:\n${stdout}\n`;
          }
          
          if (stderr) {
            response += `Errors/Warnings:\n${stderr}\n`;
          }
          
          return {
            content: [{ type: "text", text: response }]
          };
        } catch (error) {
          this.logger(`Error in git_command: ${error.message}`);
          return {
            content: [{ type: "text", text: `Error executing git command: ${error.message}` }]
          };
        }
      }
    );
  }
}