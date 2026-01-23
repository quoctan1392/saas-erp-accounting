import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];
    
    // Debug logging
    if (!tenantId) {
      console.error('[TenantId Decorator] Tenant context missing!');
      console.error('[TenantId Decorator] request.user:', request.user);
      console.error('[TenantId Decorator] request.headers[x-tenant-id]:', request.headers['x-tenant-id']);
      console.error('[TenantId Decorator] All headers:', request.headers);
      throw new UnauthorizedException('Tenant context missing');
    }
    
    return tenantId;
  },
);

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId || request.user?.sub;
  },
);
