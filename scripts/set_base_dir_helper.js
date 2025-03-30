// set_base_dir_helper.js
// This is a helper script to update the toolService.js file and fix the set_base_directory function

import * as fs from 'fs/promises';
import path from 'path';

async function fixToolService() {
  try {
    console.log("Starting fix for toolService.js...");
    
    // Get the path to the toolService.js file
    const toolServicePath = path.join(process.cwd(), 'services', 'toolService.js');
    
    // Read the current content
    const content = await fs.readFile(toolServicePath, 'utf8');
    
    // Check if the import is already there
    if (!content.includes("import path from 'path';")) {
      console.log("Adding missing path import...");
      
      // Add the path import at the top, after the z import
      const updatedContent = content.replace(
        "import { z } from 'zod';", 
        "import { z } from 'zod';\nimport path from 'path'; // Added missing path import"
      );
      
      // Write the updated content back
      await fs.writeFile(toolServicePath, updatedContent, 'utf8');
      console.log("Successfully updated toolService.js with path import");
    } else {
      console.log("path import already exists in toolService.js");
    }
    
    console.log("Fix completed. Please restart the MCP server for changes to take effect.");
  } catch (error) {
    console.error(`Error fixing toolService.js: ${error.message}`);
  }
}

// Run the fix
fixToolService();