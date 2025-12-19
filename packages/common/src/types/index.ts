export type UserRole = 'super_admin' | 'tenant_admin' | 'accountant' | 'manager' | 'employee' | 'viewer';

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled';

export type TenantPlan = 'free' | 'starter' | 'business' | 'enterprise';

export type EventType = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'tenant.created'
  | 'tenant.updated'
  | 'tenant.deleted'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled';
