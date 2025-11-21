#!/usr/bin/env bash
set -euo pipefail

# Clear existing proxy and registry settings that may be injected by the environment
npm config delete proxy >/dev/null 2>&1 || true
npm config delete https-proxy >/dev/null 2>&1 || true
npm config delete http-proxy >/dev/null 2>&1 || true
npm config delete registry >/dev/null 2>&1 || true

# Unset proxy-related environment variables for this shell so npm install runs cleanly
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY npm_config_http_proxy npm_config_https_proxy

# Restore the public npm registry
npm config set registry https://registry.npmjs.org/

echo "npm configuration after reset (proxy values should be empty):"
npm config list

echo "\nRunning npm install with cleaned proxy configuration..."
npm install "$@"
