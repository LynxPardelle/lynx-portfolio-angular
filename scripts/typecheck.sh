#!/bin/bash
# TypeScript check inside Docker container
echo "Running TypeScript check in Docker..."
docker exec dev npx tsc --noEmit --project tsconfig.json
echo "TypeScript check completed."
