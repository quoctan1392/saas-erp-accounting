#!/bin/bash
cd /Users/lammaidangvu/saas-erp-accounting/saas-erp-accounting/web-app
export NODE_OPTIONS="--max-old-space-size=4096"
exec npm run dev
