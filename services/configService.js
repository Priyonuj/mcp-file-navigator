// services/configService.js
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Service to manage application configuration
 */
export class ConfigService {
  constructor() {
    // Default configuration
    this.config = {
      baseDirectory: process.env.BASE_DIRECTORY || path.join(projectRoot, 'files'),
      logFile: path.join(projectRoot, 'log/mcp_debug.log'),
      serverName: "file-server-mcp",
      serverVersion: "1.0.0"
    };
  }
  
  /**
   * Get the value for a config key
   * @param {string} key - The config key to get
   * @returns {any} - The config value
   */
  get(key) {
    return this.config[key];
  }
  
  /**
   * Set a config value
   * @param {string} key - The config key
   * @param {any} value - The value to set
   */
  set(key, value) {
    this.config[key] = value;
  }
  
  /**
   * Get the full config object
   * @returns {Object} - The config object
   */
  getAll() {
    return { ...this.config };
  }
}
