#!/bin/bash
echo "=== Disk Usage Report ==="
df -h | head -n 10
echo ""
echo "=== Largest Directories in Home ==="
du -sh ~/* 2>/dev/null | sort -rh | head -n 5