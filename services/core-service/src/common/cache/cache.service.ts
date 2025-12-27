import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.module';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  // Tenant-specific cache helpers
  getTenantKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  async getTenantCache<T>(tenantId: string, key: string): Promise<T | null> {
    return this.get<T>(this.getTenantKey(tenantId, key));
  }

  async setTenantCache(tenantId: string, key: string, value: any, ttl?: number): Promise<void> {
    await this.set(this.getTenantKey(tenantId, key), value, ttl);
  }

  async delTenantCache(tenantId: string, key: string): Promise<void> {
    await this.del(this.getTenantKey(tenantId, key));
  }

  async invalidateTenantCache(tenantId: string): Promise<void> {
    await this.delPattern(`tenant:${tenantId}:*`);
  }
}
