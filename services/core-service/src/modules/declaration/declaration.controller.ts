import { Controller, Get, UseGuards } from '@nestjs/common';
import { DeclarationService } from './declaration.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('declaration')
@UseGuards(JwtAuthGuard)
export class DeclarationController {
  constructor(private readonly declarationService: DeclarationService) {}

  @Get('counts')
  async getCounts(@TenantId() tenantId: string) {
    return this.declarationService.getCounts(tenantId);
  }
}
