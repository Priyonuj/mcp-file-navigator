/**
 * Helper class with utility methods for the MCP File Server
 */
class Helper {
  /**
   * Formats a date to a string representation
   * @param {Date} date - The date to format
   * @param {string} format - The format string (default: 'YYYY-MM-DD')
   * @returns {string} The formatted date string
   */
  static formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    let result = format;
    result = result.replace('YYYY', year);
    result = result.replace('MM', month);
    result = result.replace('DD', day);
    result = result.replace('HH', hours);
    result = result.replace('mm', minutes);
    result = result.replace('ss', seconds);
    
    return result;
  }

  /**
   * Validates if a string is empty
   * @param {string} str - The string to validate
   * @returns {boolean} True if the string is empty or null/undefined
   */
  static isEmpty(str) {
    return str === null || str === undefined || str.trim() === '';
  }

  /**
   * Truncates a string to a specified length
   * @param {string} str - The string to truncate
   * @param {number} maxLength - The maximum length
   * @param {string} suffix - The suffix to add to truncated strings (default: '...')
   * @returns {string} The truncated string
   */
  static truncate(str, maxLength, suffix = '...') {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    
    return str.substring(0, maxLength) + suffix;
  }

  /**
   * Creates a path string with proper directory separators
   * @param {...string} segments - Path segments to join
   * @returns {string} The joined path
   */
  static joinPath(...segments) {
    return segments.join('/').replace(/\/+/g, '/');
  }

  /**
   * Generates a unique ID
   * @param {string} prefix - Optional prefix for the ID
   * @returns {string} A unique ID
   */
  static generateUniqueId(prefix = '') {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${timestamp}-${random}`;
  }

  /**
   * Safe JSON parse with error handling
   * @param {string} jsonString - The JSON string to parse
   * @param {any} defaultValue - Default value to return if parsing fails
   * @returns {any} The parsed object or the default value
   */
  static safeJsonParse(jsonString, defaultValue = {}) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return defaultValue;
    }
  }
}

module.exports = Helper;