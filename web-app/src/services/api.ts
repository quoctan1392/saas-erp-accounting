import axios, { type AxiosInstance } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';

class ApiService {
  private authApi: AxiosInstance;
  private tenantApi: AxiosInstance;

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

    // Add token to requests
    this.authApi.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.tenantApi.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth API
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
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
    const response = await this.tenantApi.post(`/tenants/${tenantId}/onboarding/business-info`, data);
    return response.data;
  }

  async completeOnboarding(tenantId: string) {
    const response = await this.tenantApi.post(`/tenants/${tenantId}/onboarding/complete`);
    return response.data;
  }
}

export const apiService = new ApiService();
