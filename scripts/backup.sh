#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
echo "=== Starting Backup ==="
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p $BACKUP_DIR
echo "Backup completed at: $DATE"
echo "Location: $BACKUP_DIR/backup_$DATE.tar.gz"