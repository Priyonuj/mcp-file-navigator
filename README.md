# MCP File Server

A secure file server implementation using the Model Context Protocol (MCP) that provides a standardized interface for file system operations.

## Overview

MCP File Server is a Node.js application that implements an MCP server specifically for file operations. It provides a secure and standardized way to interact with the file system through the MCP protocol, suitable for integration with AI assistants like Claude and developer tools like Cursor.

The server offers the following file operation tools:
- `list_files`: Lists files in a specified directory
- `read_file`: Reads the content of a file
- `write_file`: Writes content to a file
- `delete_file`: Deletes a file or directory
- `set_base_directory`: Sets the base directory for file operations directly from chat
- `get_base_directory`: Gets the current base directory

## Security Features

- Robust path validation to prevent directory traversal attacks
- Careful normalization and resolution of file paths
- Operations logged to a dedicated log file for auditability
- Secure handling of relative paths

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn package manager

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd mcp-file-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Configuration

### Environment Variables

- `BASE_DIRECTORY`: (Optional) Path to the base directory for file operations. If not specified, defaults to the `files` directory in the project root.

### Directory Structure

- `/files`: Default base directory for file operations
- `/log`: Contains the debug log file

## Usage

### Starting the Server

```
npm start
```

The server will run and connect to standard input/output for communication.

### Setting Base Directory from Chat

One of the key features of this implementation is the ability to set the base directory directly from the chat interface. This means you don't need to restart the server or modify configuration files to change where files are stored and accessed.

Simply ask the AI assistant to set the base directory, for example:
- "Set the base directory to C:/Users/username/Documents"
- "Change the file storage location to /home/user/data"

The assistant will use the `set_base_directory` tool to update the location. You can verify the current location at any time by asking for the current base directory.

### Configuration Object Example

Below is an example configuration object for integrating the MCP File Server with Claude Desktop or Cursor:

```json
{
  "mcpServers": {
    "file-server": {
      "command": "node",
      "args": ["/path/to/mcp-file-server/mcp_server.js"],
      "disabled": false,
      "autoApprove": ["list_files", "read_file", "write_file", "delete_file", "set_base_directory", "get_base_directory"]
    }
  }
}
```

**Explanation of configuration properties:**

- `mcpServers`: Container for all MCP server configurations
- `file-server`: A unique identifier for this particular MCP server
- `command`: The command to execute (in this case, `node` to run the JavaScript file)
- `args`: Array of arguments to pass to the command (the path to your server script)
- `disabled`: Whether this server is currently disabled (false = enabled)
- `autoApprove`: List of tools that should be auto-approved without requiring user confirmation

### Integrating with Claude Desktop

To integrate MCP File Server with Claude Desktop:

1. Install Claude Desktop if you haven't already
2. Start the MCP server or configure it to start automatically
3. Configure Claude Desktop:
   - Open Claude Desktop
   - Click on Settings (gear icon)
   - Select "MCP Tools" from the sidebar
   - Click "Add MCP Server Configuration"
   - Add the configuration similar to the example above
   - Adjust paths to match your installation location
   - Save the configuration
4. Restart Claude Desktop
5. You should now see the file operations tools available in Claude's interface
6. Test the connection by asking Claude to list files or read a file
7. You can now set your base directory directly in chat with: "Set the base directory to /path/of/your/choice"

### Integrating with Cursor

To integrate MCP File Server with Cursor:

1. Install Cursor if you haven't already
2. Start the MCP server or configure it to start automatically
3. Configure Cursor:
   - Open Cursor
   - Go to Settings > AI > MCP Configuration
   - Add a new MCP server configuration
   - Enter the configuration details similar to the example above
   - Adjust paths to match your installation location
   - Save the configuration
4. Restart Cursor
5. You can now use file operation commands within Cursor's AI assistant interface
6. Test by asking the assistant to list files or read a specific file
7. You can now set your base directory directly in chat with: "Set the base directory to /path/of/your/choice"

## API Reference

### set_base_directory

Sets a new base directory for file operations.

**Parameters:**
- `path`: The absolute path to the new base directory

**Returns:**
- Confirmation message

### get_base_directory

Gets the current base directory path.

**Parameters:**
- None

**Returns:**
- The current base directory path

### list_files

Lists files in a specified directory.

**Parameters:**
- `directory`: (Optional) Directory path to list (defaults to root)

**Returns:**
- A formatted list of files and directories

### read_file

Reads the content of a file.

**Parameters:**
- `path`: Path to the file to read

**Returns:**
- The content of the file

### write_file

Writes content to a file.

**Parameters:**
- `path`: Path to the file to write
- `content`: Content to write to the file

**Returns:**
- Confirmation message

### delete_file

Deletes a file or directory.

**Parameters:**
- `path`: Path to the file or directory to delete

**Returns:**
- Confirmation message

## Troubleshooting

Check the log file at `log/mcp_debug.log` for detailed information about server operations and any errors that might occur.

Common issues:

1. **Path Access Errors**: Ensure the BASE_DIRECTORY is set to a location that the process has permission to access.
2. **Connection Refused**: Make sure the server is running before attempting to connect.
3. **Tool Not Found**: Verify that the tool names in your configuration match exactly with those defined in the server.
4. **Port Conflicts**: If you're running multiple MCP servers, ensure they're using different ports.
5. **Invalid Base Directory**: When setting a base directory from chat, ensure you provide an absolute path (not relative).

## License

[Specify your license here]

## Contributing

[Specify contribution guidelines here]