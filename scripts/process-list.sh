#!/bin/bash
echo "=== Top 10 Processes by CPU ==="
ps aux --sort=-%cpu | head -n 11
echo ""
echo "=== Top 10 Processes by Memory ==="
ps aux --sort=-%mem | head -n 11