import axios, { type AxiosInstance } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';
// Local fallback data when core service is not running locally
import localIndustries from '../data/industries';

class ApiService {
  private authApi: AxiosInstance;
  private tenantApi: AxiosInstance;
  private coreApi: AxiosInstance;

  constructor() {
    this.authApi = axios.create({
      baseURL: `${API_CONFIG.AUTH_SERVICE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.tenantApi = axios.create({
      baseURL: `${API_CONFIG.TENANT_SERVICE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.coreApi = axios.create({
      baseURL: `${API_CONFIG.CORE_SERVICE_URL}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.authApi.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.tenantApi.interceptors.request.use((config) => {
      // Endpoints that need user accessToken (not tenantAccessToken):
      // - POST /tenants (create tenant)
      // - GET /tenants/my-tenants (list user's tenants)
      // - POST /tenants/:id/select (select a tenant)
      const useUserToken =
        (config.method === 'post' && config.url === '/tenants') || // Create tenant
        config.url?.includes('/tenants/my-tenants') ||
        config.url?.includes('/select');

      let token: string | null = null;

      if (useUserToken) {
        token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      } else {
        // For other tenant endpoints, use tenantAccessToken first, fallback to accessToken
        token =
          localStorage.getItem('tenantAccessToken') ||
          localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[TenantAPI] No token available for request:', config.url);
      }

      return config;
    });

    this.coreApi.interceptors.request.use((config) => {
      const token =
        localStorage.getItem('tenantAccessToken') ||
        localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      console.log(
        '[CoreAPI Interceptor] tenantAccessToken:',
        localStorage.getItem('tenantAccessToken'),
      );
      console.log(
        '[CoreAPI Interceptor] accessToken:',
        localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      );
      console.log(
        '[CoreAPI Interceptor] Using token:',
        token ? token.substring(0, 20) + '...' : 'NONE',
      );

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[CoreAPI] No token available for request:', config.url);
      }

      return config;
    });

    // Response interceptor for debugging and token-retry handling
    this.coreApi.interceptors.response.use(
      (response) => {
        console.log('[CoreAPI Response]', response.config.url, 'Status:', response.status);
        console.log(
          '[CoreAPI Response] Full response.data:',
          JSON.stringify(response.data, null, 2),
        );
        console.log('[CoreAPI Response] Type of response.data:', typeof response.data);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        console.error('[CoreAPI Response Error]', originalRequest?.url, 'Status:', status, 'Data:', error.response?.data);

        // If token invalid and we used tenantAccessToken, try retrying with user accessToken
        try {
          const tenantToken = localStorage.getItem('tenantAccessToken');
          const userToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

          const usedToken = originalRequest?.headers?.Authorization?.toString().replace('Bearer ', '');

          const looksLikeTenantToken = tenantToken && usedToken && usedToken === tenantToken;

          if ((status === 401 || status === 403) && looksLikeTenantToken && userToken) {
            console.warn('[CoreAPI] tenant token invalid — retrying request with user accessToken');
            originalRequest.headers.Authorization = `Bearer ${userToken}`;
            // Use axios directly to avoid re-entering this interceptor
            const retryResp = await axios({
              ...originalRequest,
              baseURL: undefined, // preserve full URL from original config
              url: originalRequest.url,
            });
            return retryResp;
          }

          // If still unauthorized and we have a refresh token, attempt refresh once
          if ((status === 401 || status === 403) && localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)) {
            console.warn('[CoreAPI] attempting token refresh via auth API');
            try {
              const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) as string;
              if (refreshToken) {
                const refreshResp = await this.authApi.post('/auth/refresh', { refreshToken });
                const newAccessToken = refreshResp.data?.accessToken || refreshResp.data?.data?.accessToken;
                const newRefreshToken = refreshResp.data?.refreshToken || refreshResp.data?.data?.refreshToken;
                if (newAccessToken) {
                  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
                  if (newRefreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
                  // Set header and retry original request
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                  const retryResp2 = await axios({
                    ...originalRequest,
                    baseURL: undefined,
                    url: originalRequest.url,
                  });
                  return retryResp2;
                }
              }
            } catch (refreshErr) {
              console.warn('[CoreAPI] token refresh failed', refreshErr);
              // fall through to reject
            }
          }
        } catch (err) {
          console.error('[CoreAPI] error in response error handler', err);
        }

        return Promise.reject(error);
      },
    );
  }

  // Opening periods / opening balances (initial balance flow)
  async getOpeningPeriods() {
    const response = await this.coreApi.get('/api/opening-balance/periods');
    return response.data.data || response.data;
  }

  async createOpeningPeriod(payload: { periodName: string; openingDate: string; description?: string }) {
    const response = await this.coreApi.post('/api/opening-balance/periods', payload);
    return response.data.data || response.data;
  }

  async getAccountByNumber(accountNumber: string) {
    const response = await this.coreApi.get(`/api/accounts/by-number/${encodeURIComponent(accountNumber)}`);
    return response.data.data || response.data;
  }

  async batchCreateOpeningBalances(payload: { periodId: string; currencyId: string; balances: any[] }) {
    const response = await this.coreApi.post('/api/opening-balance/batch', payload);
    return response.data.data || response.data;
  }

  async getOpeningBalances(params: Record<string, any> = {}) {
    const response = await this.coreApi.get('/api/opening-balance', { params });
    return response.data.data || response.data;
  }

  async createOpeningBalance(payload: any) {
    const response = await this.coreApi.post('/api/opening-balance', payload);
    return response.data.data || response.data;
  }

  async batchCreateOpeningBalanceDetails(balanceId: string, payload: { details: any[] }) {
    const response = await this.coreApi.post(`/api/opening-balance/${balanceId}/details/batch`, payload);
    return response.data.data || response.data;
  }

  async lockOpeningPeriod(periodId: string) {
    const response = await this.coreApi.post(`/api/opening-balance/periods/${periodId}/lock`);
    return response.data.data || response.data;
  }

  // Units
  async createUnit(data: { code: string; name: string }) {
    const response = await this.coreApi.post('/api/units', data);
    return response.data.data || response.data;
  }

  async getUnits() {
    try {
      // Ensure numeric page/limit are provided to satisfy backend parsing if required
      const response = await this.coreApi.get('/api/units', { params: { page: 1, limit: 200 } });
      // Backend may return either an array, or a wrapper { data: [...] }, or nested wrappers
      if (response?.data) {
        if (Array.isArray(response.data)) return response.data;
        if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
        if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) return response.data.data.data;
        return response.data.data || response.data;
      }
      return [];
    } catch (error: any) {
      console.warn('[ApiService] getUnits error - returning empty list so caller can fallback to defaults:', error?.message || error);
      // Return empty list so callers (UI) can use local defaults instead of failing
      return [];
    }
  }

  // Auth API
  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    const response = await this.authApi.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.authApi.post('/auth/login', { email, password });
    return response.data;
  }

  async googleLogin(idToken: string) {
    const response = await this.authApi.post('/auth/google', { idToken });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.authApi.get('/auth/me');
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.authApi.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.authApi.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.authApi.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  // Tenant API
  async createTenant(name: string) {
    const response = await this.tenantApi.post('/tenants', { name });
    return response.data;
  }

  async getMyTenants() {
    const response = await this.tenantApi.get('/tenants/my-tenants');
    return response.data;
  }

  async selectTenant(tenantId: string) {
    const response = await this.tenantApi.post(`/tenants/${tenantId}/select`);
    return response.data;
  }

  // Onboarding API
  async getOnboardingStatus(tenantId: string) {
    const response = await this.tenantApi.get(`/tenants/${tenantId}/onboarding/status`);
    return response.data;
  }

  async updateBusinessType(tenantId: string, businessType: string) {
    const response = await this.tenantApi.put(`/tenants/${tenantId}/onboarding/business-type`, {
      businessType,
    });
    return response.data;
  }

  async getTaxInfo(taxId: string) {
    const response = await this.tenantApi.get(`/tax-info?taxId=${taxId}`);
    return response.data;
  }

  async saveBusinessInfo(tenantId: string, data: any) {
    const response = await this.tenantApi.post(
      `/tenants/${tenantId}/onboarding/business-info`,
      data,
    );
    return response.data;
  }

  async saveBusinessSector(tenantId: string, data: any) {
    const response = await this.tenantApi.post(
      `/tenants/${tenantId}/onboarding/business-sector`,
      data,
    );
    return response.data;
  }

  async saveAccountingSetup(tenantId: string, data: any) {
    const response = await this.tenantApi.post(
      `/tenants/${tenantId}/onboarding/accounting-setup`,
      data,
    );
    return response.data;
  }

  async saveAdvancedSetup(tenantId: string, data: any) {
    const response = await this.tenantApi.post(
      `/tenants/${tenantId}/onboarding/advanced-setup`,
      data,
    );
    return response.data;
  }

  async completeOnboarding(tenantId: string) {
    const response = await this.tenantApi.post(`/tenants/${tenantId}/onboarding/complete`);
    return response.data;
  }

  // Accounting Objects (customers/vendors/employees)
  async createAccountingObject(data: any) {
    try {
      const response = await this.coreApi.post('/api/objects', data);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      // If unauthorized, attempt explicit refresh + retry as a fallback
      if ((status === 401 || status === 403) && localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)) {
        try {
          const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) as string;
          const refreshResp = await this.authApi.post('/auth/refresh', { refreshToken });
          const newAccessToken = refreshResp.data?.accessToken || refreshResp.data?.data?.accessToken;
          const newRefreshToken = refreshResp.data?.refreshToken || refreshResp.data?.data?.refreshToken;
          if (newAccessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            if (newRefreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            // Retry request with new token
            const retryResp = await this.coreApi.post('/api/objects', data);
            return retryResp.data;
          }
        } catch (refreshErr) {
          console.warn('[ApiService] createAccountingObject refresh retry failed', refreshErr);
        }
      }

      // Re-throw original error if we couldn't recover
      throw error;
    }
  }

  async getAccountingObjects(query: Record<string, any> = {}) {
    const params = new URLSearchParams(query as Record<string, string>).toString();
    const url = params ? `/api/objects?${params}` : '/api/objects';
    const response = await this.coreApi.get(url);
    return response.data;
  }

  async getNextObjectCode(type: 'customer' | 'vendor' | 'employee' = 'customer') {
    try {
      console.log('[ApiService] Calling GET /api/objects/next-code?type=', type);
      const response = await this.coreApi.get(`/api/objects/next-code?type=${type}`);
      console.log('[ApiService] Raw response:', response);
      console.log('[ApiService] response.data:', response.data);

      // Handle wrapped response: { success, data: { code }, timestamp }
      if (response && response.data) {
        // Check for wrapped response (success/data/timestamp pattern)
        if (
          response.data.success &&
          response.data.data &&
          typeof response.data.data.code === 'string'
        ) {
          console.log('[ApiService] Returning response.data.data.code:', response.data.data.code);
          return response.data.data.code;
        }
        // Fallback: direct { code } pattern
        if (typeof response.data.code === 'string') {
          console.log('[ApiService] Returning response.data.code:', response.data.code);
          return response.data.code;
        }
        // Fallback: plain string
        if (typeof response.data === 'string') {
          console.log('[ApiService] Returning response.data (string):', response.data);
          return response.data;
        }
        // If unexpected shape, return undefined so caller can fallback
        console.warn('[ApiService] getNextObjectCode unexpected response:', response.data);
        return undefined as unknown as string;
      }
      console.warn('[ApiService] No response or response.data');
      return undefined as unknown as string;
    } catch (error) {
      console.error('[ApiService] getNextObjectCode error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('[ApiService] Error response:', (error as any).response);
      }
      throw error;
    }
  }

  // Warehouses
  async createWarehouse(data: any) {
    const response = await this.coreApi.post('/api/warehouses', data);
    return response.data;
  }

  async getNextWarehouseCode() {
    const response = await this.coreApi.get('/api/warehouses/next-code');
    // handle wrapped response { success, data: { code } }
    if (response?.data) {
      if (response.data.data && typeof response.data.data.code === 'string') return response.data.data.code;
      if (typeof response.data.code === 'string') return response.data.code;
      if (typeof response.data === 'string') return response.data;
      return response.data.data || response.data;
    }
    return undefined as unknown as string;
  }

  async getWarehouses() {
    try {
      // Ensure numeric page/limit are provided to satisfy backend ParseIntPipe
      const response = await this.coreApi.get('/api/warehouses', { params: { page: 1, limit: 100 } });
      // Backend returns { data, total, page, limit } or array
      if (response?.data) {
        // If wrapped response with data array
        if (Array.isArray(response.data)) return response.data;
        if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
        // If response.data itself is object with fields, try to normalize
        if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) return response.data.data.data;
        return response.data.data || response.data;
      }
      return [];
    } catch (error: any) {
      console.error('[ApiService] getWarehouses error:', error);
      // If network/auth error, propagate so caller can handle and show fallback
      throw error;
    }
  }

  // Subject Groups
  async createSubjectGroup(data: { code: string; name: string; type: 'customer' | 'vendor' | 'both'; description?: string; isActive?: boolean }) {
    const response = await this.coreApi.post('/api/subject-groups', data);
    // Backend wraps response in { success, data, timestamp }
    return response.data.data || response.data;
  }

  async getSubjectGroups() {
    const response = await this.coreApi.get('/api/subject-groups');
    // Backend wraps response in { success, data, timestamp }
    return response.data.data || response.data;
  }

  // Items / Item Categories
  async getNextItemCode() {
    const response = await this.coreApi.get('/api/items/next-code');
    if (response?.data) {
      if (response.data.data && typeof response.data.data.code === 'string') return response.data.data.code;
      if (typeof response.data.code === 'string') return response.data.code;
      if (typeof response.data === 'string') return response.data;
      return response.data.data || response.data;
    }
    return undefined as unknown as string;
  }

  async getItemCategories() {
    const response = await this.coreApi.get('/api/item-categories');
    return response.data.data || response.data;
  }

  async createItemCategory(data: { code: string; name: string; description?: string }) {
    const response = await this.coreApi.post('/api/item-categories', data);
    return response.data.data || response.data;
  }

  async createItem(data: any) {
    const response = await this.coreApi.post('/api/items', data);
    return response.data.data || response.data;
  }

  async updateItem(id: string, data: any) {
    const response = await this.coreApi.put(`/api/items/${id}`, data);
    return response.data.data || response.data;
  }

  async getItems(params?: any) {
    const response = await this.coreApi.get('/api/items', { params });
    return response.data.data || response.data;
  }

  async getItem(id: string) {
    const response = await this.coreApi.get(`/api/items/${id}`);
    return response.data.data || response.data;
  }

  async deleteItem(id: string) {
    const response = await this.coreApi.delete(`/api/items/${id}`);
    return response.data.data || response.data;
  }

  // Declaration Counts
  async getDeclarationCounts() {
    const response = await this.coreApi.get('/api/declaration/counts');
    // Backend wraps response in { success, data, timestamp }
    return response.data.data || response.data;
  }

  // Industries
  async getIndustries() {
    try {
      const response = await this.coreApi.get('/api/industries');
      return response.data.data || response.data;
    } catch (error: any) {
      // If request failed due to missing/invalid token, retry without auth header
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        try {
          const response = await axios.get(`${API_CONFIG.CORE_SERVICE_URL}/api/industries`);
          return response.data.data || response.data;
        } catch (err) {
          console.warn('[ApiService] anonymous getIndustries failed:', err);
          // Fallthrough to local fallback below
        }
      }

      // If network error or server not running, return local fallback data so UI remains usable
      if (!error?.response || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        console.warn('[ApiService] getIndustries network error — returning local fallback data');
        return localIndustries.map((d: any, idx: number) => ({ id: idx + 1, code: d.code, name: d.name, displayText: d.displayText }));
      }

      

      // For other errors, log and return local fallback as a safe default
      console.error('[ApiService] getIndustries error:', error);
      return localIndustries.map((d: any, idx: number) => ({ id: idx + 1, code: d.code, name: d.name, displayText: d.displayText }));
    }
  }
}

export const apiService = new ApiService();

export default apiService;
