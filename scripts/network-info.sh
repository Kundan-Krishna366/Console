#!/bin/bash
echo "=== Network Interfaces ==="
ifconfig 2>/dev/null || ip addr show
echo ""
echo "=== Active Connections ==="
netstat -an 2>/dev/null | grep ESTABLISHED | head -n 10 || ss -t | head -n 10