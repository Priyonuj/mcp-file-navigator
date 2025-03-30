// services/loggerService.js
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import path from 'path';

/**
 * Service for handling logging functionality
 */
export class LoggerService {
  /**
   * Create a new logger service
   * @param {string} logFilePath - Path to the log file
   */
  constructor(logFilePath) {
    this.logFilePath = logFilePath;
    this.logStream = null;
  }
  
  /**
   * Initialize the logger
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      // Ensure the log directory exists
      const logDir = path.dirname(this.logFilePath);
      await fsPromises.mkdir(logDir, { recursive: true });
      
      // Create the log stream
      this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
      
      // Log initialization
      this.log('Logger initialized');
      return true;
    } catch (error) {
      console.error(`Error initializing logger: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Log a message
   * @param {string} message - The message to log
   */
  log(message) {
    if (!this.logStream) {
      console.error('Logger not initialized');
      return;
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    this.logStream.write(logEntry);
  }
  
  /**
   * Close the logger
   */
  close() {
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }
}
