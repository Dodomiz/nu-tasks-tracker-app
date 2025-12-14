#!/bin/bash

# GitHub Repository Setup Script
# This script helps you create a new GitHub repository and push your code

echo "🚀 GitHub Repository Setup"
echo "=========================="
echo ""

# Repository details
REPO_NAME="nu-tasks-tracker-app"
REPO_DESCRIPTION="Cross-platform task management application with gamification features - ASP.NET Core + React + MongoDB"

echo "Repository Name: $REPO_NAME"
echo "Description: $REPO_DESCRIPTION"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI detected"
    echo ""
    echo "Creating GitHub repository..."
    
    # Create repository using GitHub CLI
    gh repo create "$REPO_NAME" \
        --public \
        --description "$REPO_DESCRIPTION" \
        --source=. \
        --remote=origin \
        --push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Repository created and code pushed successfully!"
        echo ""
        echo "🔗 Repository URL: https://github.com/$(gh api user -q .login)/$REPO_NAME"
        echo ""
        echo "Next steps:"
        echo "1. Visit your repository on GitHub"
        echo "2. Add topics/tags for discoverability"
        echo "3. Update repository settings (if needed)"
        echo "4. Enable GitHub Actions (if CI/CD needed)"
    else
        echo "❌ Failed to create repository"
        exit 1
    fi
else
    echo "⚠️  GitHub CLI not found"
    echo ""
    echo "Option 1: Install GitHub CLI"
    echo "  macOS: brew install gh"
    echo "  Then run: gh auth login"
    echo "  Then run: ./setup-github.sh"
    echo ""
    echo "Option 2: Manual setup"
    echo "  1. Go to https://github.com/new"
    echo "  2. Repository name: $REPO_NAME"
    echo "  3. Description: $REPO_DESCRIPTION"
    echo "  4. Set to Public or Private"
    echo "  5. DON'T initialize with README (we have one)"
    echo "  6. Click 'Create repository'"
    echo ""
    echo "  Then run these commands:"
    echo "  ----------------------------------------"
    echo "  git remote add origin git@github.com:YOUR_USERNAME/$REPO_NAME.git"
    echo "  git push -u origin main"
    echo "  ----------------------------------------"
    echo ""
fi
