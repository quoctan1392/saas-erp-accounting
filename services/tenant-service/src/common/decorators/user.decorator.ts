import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract userId from JWT token in request
 * The JWT token should contain either 'sub', 'userId', or 'id' field
 */
export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new Error('User not found in request. Make sure JwtAuthGuard is applied.');
    }
    
    // Try different possible field names for userId
    const userId = user.sub || user.userId || user.id;
    
    if (!userId) {
      throw new Error('UserId not found in JWT token');
    }
    
    return userId;
  },
);
