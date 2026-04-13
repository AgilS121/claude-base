#!/usr/bin/env bash
# claude-base-dtit installer for Mac/Linux
# Usage: ./install.sh
#
# NOTE: This is a skeleton — Windows (install.ps1) is the primary target for DTIT.
# If you're on Mac/Linux, this should get you 80% there but test before relying on it.

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_HOME="$HOME/.claude"
USERNAME="${USER:-unknown}"

info()    { echo -e "\033[36m[INFO]\033[0m $1"; }
ok()      { echo -e "\033[32m[ OK ]\033[0m $1"; }
warn()    { echo -e "\033[33m[WARN]\033[0m $1"; }
err()     { echo -e "\033[31m[ERR ]\033[0m $1"; }
section() { echo ""; echo -e "\033[35m=== $1 ===\033[0m"; }

section "claude-base-dtit installer (bash)"
info "Repo root   : $REPO_ROOT"
info "Claude home : $CLAUDE_HOME"
info "Username    : $USERNAME"

mkdir -p "$CLAUDE_HOME"

# Step 1: Backup
if [ -f "$CLAUDE_HOME/CLAUDE.md" ]; then
    BACKUP_DIR="$CLAUDE_HOME/backup-$(date +%Y%m%d-%H%M%S)"
    warn "Existing CLAUDE.md found → backing up to $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    cp "$CLAUDE_HOME/CLAUDE.md" "$BACKUP_DIR/"
fi

# Step 2: Copy global
section "Step 2: Copy global"
cp -f "$REPO_ROOT/global/"*.md "$CLAUDE_HOME/" 2>/dev/null || true
cp -f "$REPO_ROOT/global/"*.json "$CLAUDE_HOME/" 2>/dev/null || true
ok "Global files copied"

# Step 3: Stack profiles
section "Step 3: Stack profiles"
mkdir -p "$CLAUDE_HOME/stack-profiles"
cp -rf "$REPO_ROOT/stack-profiles/"* "$CLAUDE_HOME/stack-profiles/"
ok "Stack profiles copied"

# Step 4: Skills
section "Step 4: Skills"
mkdir -p "$CLAUDE_HOME/skills"
cp -rf "$REPO_ROOT/skills/"* "$CLAUDE_HOME/skills/"
ok "Skills copied"

# Step 5: Pick stack
section "Step 5: Pick stack"
echo "  [1] PHP (Laravel / Yii / Blade)"
echo "  [2] JavaScript (Node / React / Next)"
echo "  [3] Fullstack"
read -p "Your choice: " STACK_CHOICE

case "$STACK_CHOICE" in
    1) IDENTITY="php" ;;
    2) IDENTITY="js" ;;
    3) IDENTITY="php" ;;
    *) IDENTITY="php"; warn "Invalid, defaulting to PHP" ;;
esac

cp "$REPO_ROOT/global/agent-identities/$IDENTITY.json" "$CLAUDE_HOME/agent-identity.json"
ok "Identity set to: $IDENTITY"

# Step 6: Register projects (simple version)
section "Step 6: Register projects"
echo "Project registration not fully automated in bash version."
echo "Please manually edit: $CLAUDE_HOME/project-registry.json"
echo "Use template: $REPO_ROOT/templates/project-registry.json.tpl"

# Copy template
cp "$REPO_ROOT/templates/project-registry.json.tpl" "$CLAUDE_HOME/project-registry.json"
warn "Copied template — YOU MUST EDIT it with your actual projects"

section "Install complete (partial)"
ok "Global + skills + stack profiles installed"
warn "Manual step: edit $CLAUDE_HOME/project-registry.json"
warn "Manual step: install MCP servers — see mcp-servers/README.md"
