// services/fileService.js
import * as fs from 'fs/promises';
import path from 'path';

/**
 * Service responsible for file system operations
 */
export class FileService {
  constructor(baseDirectory, logger) {
    this.baseDirectory = baseDirectory;
    this.logger = logger;
  }
  
  /**
   * Set the base directory
   * @param {string} newBaseDir - The new base directory path
   */
  setBaseDirectory(newBaseDir) {
    this.baseDirectory = newBaseDir;
  }
  
  /**
   * Get the current base directory
   * @returns {string} - The current base directory path
   */
  getBaseDirectory() {
    return this.baseDirectory;
  }
  
  /**
   * Ensure the specified directory exists
   * @param {string} directoryPath - The directory path to ensure
   * @returns {Promise<boolean>} - Whether the directory exists or was created
   */
  async ensureDirectoryExists(directoryPath) {
    try {
      await fs.mkdir(directoryPath, { recursive: true });
      this.logger(`Directory ensured at: ${directoryPath}`);
      return true;
    } catch (error) {
      this.logger(`Error ensuring directory: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Validate and resolve a path to prevent directory traversal
   * @param {string} requestedPath - The requested path to resolve
   * @returns {string} - The safe absolute path
   */
  resolveSafePath(requestedPath) {
    try {
      // Handle root path request or empty path
      if (!requestedPath || requestedPath === '/' || requestedPath === '\\') {
        return this.baseDirectory;
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
      const absolutePath = path.join(this.baseDirectory, normalizedPath);
      
      // Extra safety check - verify the path is still within BASE_DIRECTORY
      const relativePath = path.relative(this.baseDirectory, absolutePath);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        throw new Error('Path resolves outside the base directory');
      }
      
      return absolutePath;
    } catch (error) {
      this.logger(`Path resolution error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * List files in a directory
   * @param {string} directory - The directory to list
   * @returns {Promise<Array>} - Array of directory entries
   */
  async listFiles(directory) {
    const safePath = this.resolveSafePath(directory || '');
    const entries = await fs.readdir(safePath, { withFileTypes: true });
    return entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory()
    }));
  }
  
  /**
   * Read a file's content
   * @param {string} filePath - The path to the file
   * @returns {Promise<string>} - The file content
   */
  async readFile(filePath) {
    const safePath = this.resolveSafePath(filePath);
    
    // Check if it's a directory
    const stats = await fs.stat(safePath);
    if (stats.isDirectory()) {
      const entries = await fs.readdir(safePath, { withFileTypes: true });
      return {
        isDirectory: true,
        entries: entries.map(entry => ({
          name: entry.name,
          isDirectory: entry.isDirectory()
        }))
      };
    }
    
    // Read file
    const content = await fs.readFile(safePath, 'utf8');
    return {
      isDirectory: false,
      content
    };
  }
  
  /**
   * Write content to a file
   * @param {string} filePath - The path to the file
   * @param {string} content - The content to write
   * @returns {Promise<void>}
   */
  async writeFile(filePath, content) {
    const safePath = this.resolveSafePath(filePath);
    
    // Create directory if needed
    const dirPath = path.dirname(safePath);
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write file
    await fs.writeFile(safePath, content, 'utf8');
  }
  
  /**
   * Delete a file or directory
   * @param {string} filePath - The path to delete
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    const safePath = this.resolveSafePath(filePath);
    
    // Check if it exists
    const stats = await fs.stat(safePath);
    
    if (stats.isDirectory()) {
      await fs.rm(safePath, { recursive: true, force: true });
    } else {
      await fs.unlink(safePath);
    }
  }
}
