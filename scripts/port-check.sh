#!/bin/bash
echo "=== Port Status Check ==="
echo ""
echo "🔌 Common Development Ports:"
echo ""
for port in 3000 3001 5000 8000 8080 9000; do
    if lsof -i :$port > /dev/null 2>&1; then
        process=$(lsof -i :$port | tail -1 | awk '{print $1}')
        echo "  Port $port: ✅ IN USE ($process)"
    else
        echo "  Port $port: ⭕ Available"
    fi
done
echo ""
echo "📊 All listening ports:"
lsof -i -P -n | grep LISTEN | head -10 2>/dev/null || netstat -tuln | grep LISTEN | head -10
