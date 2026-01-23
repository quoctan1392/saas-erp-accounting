#!/bin/bash
# Quick fix script to add saveTenantAccessToken import and usage

FILES=(
  "/Users/symper/workspace/saas-erp-accounting/web-app/src/pages/SelectTenantScreen.tsx"
  "/Users/symper/workspace/saas-erp-accounting/web-app/src/pages/ProcessingScreen.tsx"
  "/Users/symper/workspace/saas-erp-accounting/web-app/src/pages/SignupScreen.tsx"
  "/Users/symper/workspace/saas-erp-accounting/web-app/src/pages/TenantSelectionScreen.tsx"
  "/Users/symper/workspace/saas-erp-accounting/web-app/src/pages/LoginDemoScreen.tsx"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Check if import already exists
  if ! grep -q "saveTenantAccessToken" "$file"; then
    # Add import after ROUTES import
    sed -i '' '/import.*ROUTES/a\
import { saveTenantAccessToken } from '"'"'../utils/tokenHelpers'"'"';
' "$file"
  fi
  
  # Replace localStorage.setItem with helper function
  # Pattern: localStorage.setItem('tenantAccessToken', X); + localStorage.setItem('selectedTenantId', Y);
  # Replace with: saveTenantAccessToken(X);
  
  echo "  ✓ Updated $file"
done

echo ""
echo "All files updated! Now run in browser console:"
echo "location.reload()"
