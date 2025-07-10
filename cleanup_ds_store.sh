#!/bin/bash

# Script to remove .DS_Store files and prevent them in the future

echo "🧹 Cleaning up .DS_Store files..."

# Remove all .DS_Store files from current directory and subdirectories
echo "Removing .DS_Store files from filesystem..."
find . -name ".DS_Store" -delete

# Remove .DS_Store files from Git if they exist
echo "Removing .DS_Store files from Git index..."
find . -name .DS_Store -print0 | xargs -0 git rm --cached --ignore-unmatch 2>/dev/null

# Check if .gitignore exists, if not create it
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore file..."
    touch .gitignore
fi

# Add .DS_Store to .gitignore if not already present
if ! grep -q "\.DS_Store" .gitignore; then
    echo "Adding .DS_Store patterns to .gitignore..."
    echo "" >> .gitignore
    echo "# macOS system files" >> .gitignore
    echo ".DS_Store" >> .gitignore
    echo ".DS_Store?" >> .gitignore
    echo "**/.DS_Store" >> .gitignore
    echo "**/.DS_Store?" >> .gitignore
fi

# Stage .gitignore changes
git add .gitignore

# Check if there are any changes to commit
if ! git diff --cached --quiet; then
    echo "Committing changes..."
    git commit -m "Remove .DS_Store files and add to .gitignore"
else
    echo "No changes to commit."
fi

echo "✅ Cleanup complete!"
echo ""
echo "💡 To prevent .DS_Store creation globally on macOS, run:"
echo "   defaults write com.apple.desktopservices DSDontWriteNetworkStores true"
echo "   defaults write com.apple.desktopservices DSDontWriteUSBStores true"
echo "   killall Finder"
