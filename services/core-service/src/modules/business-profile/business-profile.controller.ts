import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BusinessProfileService } from './business-profile.service';
import { CreateBusinessProfileDto } from './dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { CreateEInvoiceProviderDto } from './dto/create-einvoice-provider.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';

@Controller('business-profile')
@UseGuards(JwtAuthGuard)
export class BusinessProfileController {
  constructor(private readonly businessProfileService: BusinessProfileService) {}

  @Post()
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateBusinessProfileDto,
  ) {
    return this.businessProfileService.create(tenantId, userId, dto);
  }

  @Get()
  findByTenant(@TenantId() tenantId: string) {
    return this.businessProfileService.findByTenant(tenantId);
  }

  @Put()
  update(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    return this.businessProfileService.update(tenantId, userId, dto);
  }

  @Get('settings')
  getSettings(@TenantId() tenantId: string) {
    return this.businessProfileService.getSettings(tenantId);
  }

  // E-Invoice Provider endpoints
  @Post('einvoice-providers')
  createEInvoiceProvider(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateEInvoiceProviderDto,
  ) {
    return this.businessProfileService.createEInvoiceProvider(tenantId, userId, dto);
  }

  @Get('einvoice-providers')
  findEInvoiceProviders(@TenantId() tenantId: string) {
    return this.businessProfileService.findEInvoiceProviders(tenantId);
  }

  @Put('einvoice-providers/:id')
  updateEInvoiceProvider(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: Partial<CreateEInvoiceProviderDto>,
  ) {
    return this.businessProfileService.updateEInvoiceProvider(id, tenantId, userId, dto);
  }

  @Delete('einvoice-providers/:id')
  deleteEInvoiceProvider(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.businessProfileService.deleteEInvoiceProvider(id, tenantId, userId);
  }
}
