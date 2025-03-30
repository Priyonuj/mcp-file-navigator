# MCP File Server

A secure file server implementation using the Model Context Protocol (MCP) that provides a standardized interface for file system operations.

## Overview

MCP File Server is a Node.js application that implements an MCP server specifically for file operations. It provides a secure and standardized way to interact with the file system through the MCP protocol, suitable for integration with AI assistants like Claude and developer tools like Cursor.

The server offers four primary file operation tools:
- `list_files`: Lists files in a specified directory
- `read_file`: Reads the content of a file
- `write_file`: Writes content to a file
- `delete_file`: Deletes a file or directory

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

### Integrating with Claude Desktop

To use MCP File Server with Claude Desktop:

1. Start the MCP server
2. Configure Claude Desktop to connect to the running server:
   - Open Claude Desktop settings
   - Navigate to the "Advanced" or "Integrations" section
   - Enable "Custom Tool Integration"
   - Point to the running MCP server

### Integrating with Cursor

To use MCP File Server with Cursor:

1. Start the MCP server
2. In Cursor, open settings and navigate to AI integrations
3. Configure the "Custom Tools" section to point to your running MCP server
4. Ensure the connection URL matches your server's address

## API Reference

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

## License

[Specify your license here]

## Contributing

[Specify contribution guidelines here]