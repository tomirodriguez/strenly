#!/bin/bash
# Start just the API server
# This script runs only the API server for backend development

set -e

# Run API server
pnpm --filter api dev
