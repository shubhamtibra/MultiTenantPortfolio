#!/bin/bash

echo "🚀 Multi-Tenant Portfolio Subdomain Test Setup"
echo "=============================================="

# Check if hosts file entries exist
echo "📋 Checking /etc/hosts file..."

if grep -q "mikesplumbing.localhost" /etc/hosts; then
    echo "✅ mikesplumbing.localhost already exists in hosts file"
else
    echo "❌ mikesplumbing.localhost not found in hosts file"
    echo "📝 Adding to hosts file (requires sudo)..."
    echo "127.0.0.1 mikesplumbing.localhost" | sudo tee -a /etc/hosts
fi

if grep -q "example.localhost" /etc/hosts; then
    echo "✅ example.localhost already exists in hosts file"
else
    echo "❌ example.localhost not found in hosts file"
    echo "📝 Adding to hosts file (requires sudo)..."
    echo "127.0.0.1 example.localhost" | sudo tee -a /etc/hosts
fi

echo ""
echo "🎯 Test Instructions:"
echo "1. Make sure both backend (port 5000) and frontend (port 3000) servers are running"
echo "2. Create a portfolio at http://localhost:3000 with domain 'mikesplumbing.localhost'"
echo "3. Visit http://mikesplumbing.localhost:3000 to see the public portfolio"
echo ""
echo "🌐 Test URLs:"
echo "- Main App: http://localhost:3000"
echo "- Test Portfolio: http://mikesplumbing.localhost:3000"
echo "- Another Test: http://example.localhost:3000"
echo ""
echo "✨ Happy testing!"
