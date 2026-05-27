#!/bin/sh
# Wrapper: setzt lokalen Node in PATH, dann startet Next.js dev server.
export PATH="/Users/benduering/Documents/tagtig/.node/bin:$PATH"
cd /Users/benduering/Documents/tagtig/tagtig-os
exec npm run dev
