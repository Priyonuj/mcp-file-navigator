// services/gitService.js
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify exec for cleaner async/await usage
const execAsync = promisify(exec);

/**
 * Service for Git operations
 */
export class GitService {
  constructor(baseDirectory, logger) {
    this.baseDirectory = baseDirectory;
    this.logger = logger;
  }
  
  /**
   * Update the base directory
   * @param {string} newBaseDir - The new base directory
   */
  setBaseDirectory(newBaseDir) {
    this.baseDirectory = newBaseDir;
  }
  
  /**
   * Executes a git command
   * @param {string} command - The git command to execute (without the 'git' prefix)
   * @param {string} shell - Optional shell to use (cmd, powershell, bash)
   * @returns {Promise<{stdout: string, stderr: string}>} - Command output
   */
  async executeGitCommand(command, shell) {
    // Validate the command to prevent command injection
    if (!this.isValidGitCommand(command)) {
      throw new Error(`Invalid git command: ${command}`);
    }

    this.logger(`Executing git command: git ${command} in directory: ${this.baseDirectory}`);
    
    try {
      let fullCommand;
      
      // Use shell-specific execution if a shell is specified
      if (shell) {
        const shellPrefix = this.getShellPrefix(shell);
        fullCommand = `${shellPrefix} "git ${command.replace(/"/g, '\\"')}"`;
        this.logger(`Using shell: ${shell}, full command: ${fullCommand}`);
      } else {
        fullCommand = `git ${command}`;
      }
      
      // Execute the command
      const { stdout, stderr } = await execAsync(fullCommand, { cwd: this.baseDirectory });
      this.logger(`Git command executed successfully.`);
      
      return { stdout, stderr };
    } catch (error) {
      this.logger(`Error executing git command: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validates that the git command is safe to execute
   * @param {string} command - The git command to validate
   * @returns {boolean} - Whether the command is valid
   */
  isValidGitCommand(command) {
    // Remove leading/trailing whitespace
    const trimmedCommand = command.trim();
    
    // Check for attempts to chain commands
    if (/[;&|]/.test(trimmedCommand)) {
      return false;
    }
    
    // Check for attempts to use shell redirection
    if (/[><]/.test(trimmedCommand)) {
      return false;
    }
    
    // Block commands that could be dangerous
    const blockedCommands = [
      'config', // Changing git configuration could be dangerous
      'clean -xdf', // Force clean can delete files unexpectedly
    ];
    
    for (const blockedCmd of blockedCommands) {
      if (trimmedCommand.startsWith(blockedCmd)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Determines the appropriate shell command prefix based on shell type
   * @param {string} shell - Shell type (cmd, powershell, bash)
   * @returns {string} - Shell command prefix
   */
  getShellPrefix(shell) {
    switch (shell) {
      case 'cmd':
        return 'cmd /c';
      case 'powershell':
        return 'powershell -Command';
      case 'bash':
        return 'bash -c';
      default:
        return ''; // Default system shell
    }
  }
}
