// examples/git_examples.js
// This is a demonstration script showing how to use the git_command feature

/*
To use the git_command feature from Claude or Cursor:

1. Basic git commands:
   - "Run git status"
   - "Execute git log --oneline"
   - "Show git branch"

2. With specific shells:
   - "Using PowerShell, run git status"
   - "In bash, execute git diff"
   - "With cmd, run git pull origin main"

3. Git repository operations:
   - "Initialize a git repository with git init"
   - "Add all files with git add ."
   - "Commit changes with git commit -m 'Initial commit'"
   - "Create a new branch with git checkout -b feature/new-feature"
   - "Switch to main branch with git checkout main"

4. View git information:
   - "Show commit history with git log"
   - "Show differences with git diff"
   - "Show remote repositories with git remote -v"
*/

// Example JSON payloads for the git_command tool:

// Basic git status
const statusExample = {
  command: "status"
};

// Git log with formatting
const logExample = {
  command: "log --oneline --graph --decorate --all -n 5"
};

// Using specific shell (PowerShell)
const powershellExample = {
  command: "status",
  shell: "powershell"
};

// Using specific shell (bash)
const bashExample = {
  command: "branch -a",
  shell: "bash"
};

// Using specific shell (cmd)
const cmdExample = {
  command: "remote -v",
  shell: "cmd"
};

console.log("Example payloads for the git_command tool:");
console.log("Basic git status:", JSON.stringify(statusExample, null, 2));
console.log("Git log with formatting:", JSON.stringify(logExample, null, 2));
console.log("Using PowerShell:", JSON.stringify(powershellExample, null, 2));
console.log("Using bash:", JSON.stringify(bashExample, null, 2));
console.log("Using cmd:", JSON.stringify(cmdExample, null, 2));
