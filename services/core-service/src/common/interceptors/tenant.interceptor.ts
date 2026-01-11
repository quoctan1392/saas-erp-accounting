import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // If endpoint is marked public, skip tenant requirement
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];

    if (!tenantId && !isPublic) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Attach tenantId to request for easy access (may be undefined for public routes)
    request.tenantId = tenantId;

    return next.handle();
  }
}
