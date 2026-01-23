// Helper functions for JWT token handling

export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[parseJwt] Failed to parse token:', e);
    return null;
  }
}

/**
 * Save tenant access token and automatically extract & save selectedTenantId
 */
export function saveTenantAccessToken(token: string): void {
  if (!token) {
    console.warn('[saveTenantAccessToken] No token provided');
    return;
  }

  // Save token
  localStorage.setItem('tenantAccessToken', token);

  // Parse and extract tenantId
  const payload = parseJwt(token);
  if (payload && payload.tenantId) {
    localStorage.setItem('selectedTenantId', payload.tenantId);
    console.log('[saveTenantAccessToken] Saved selectedTenantId:', payload.tenantId);
  } else {
    console.warn('[saveTenantAccessToken] Token does not contain tenantId');
  }
}
