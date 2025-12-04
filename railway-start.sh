#!/bin/bash
# Railway startup script - ensures server starts quickly for health checks

echo "🚀 Starting server for Railway..."
NODE_ENV=production node dist/index.js

