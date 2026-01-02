#!/usr/bin/env sh

# Create git hooks that point to husky hooks
if [ -d ".git" ]; then
  # Pre-commit hook
  cat > .git/hooks/pre-commit << 'HOOK'
#!/usr/bin/env sh
. "$(dirname -- "$0")/../.husky/pre-commit"
HOOK
  chmod +x .git/hooks/pre-commit

  # Commit-msg hook
  cat > .git/hooks/commit-msg << 'HOOK'
#!/usr/bin/env sh
. "$(dirname -- "$0")/../.husky/commit-msg"
HOOK
  chmod +x .git/hooks/commit-msg

  echo "✓ Husky hooks installed"
else
  echo "⚠ Not a git repository, skipping husky setup"
fi
