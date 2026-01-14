#!/bin/bash

# Fetch latest changes from remote
echo "Fetching from origin..."
git fetch origin

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Show diff between local and remote
echo ""
echo "Showing diff between local and remote ${CURRENT_BRANCH}..."
git diff ${CURRENT_BRANCH}..origin/${CURRENT_BRANCH}
