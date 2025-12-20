import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantStatus, TenantPlan } from './entities/tenant.entity';
import { JwtService } from '@nestjs/jwt';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req: any) {
    const tenant = await this.tenantsService.create({
      ...createTenantDto,
      ownerId: req.user.id || req.user.sub,
    });

    return {
      success: true,
      data: {
        tenant,
      },
    };
  }

  @Get('my-tenants')
  @ApiOperation({ summary: 'Get all tenants that current user is a member of' })
  async getMyTenants(@Request() req: any) {
    const userId = req.user.id || req.user.sub;
    const tenants = await this.tenantsService.getUserTenants(userId);

    return {
      success: true,
      data: {
        tenants,
      },
    };
  }

  @Post(':tenantId/select')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select a tenant and get tenant-scoped access token' })
  async selectTenant(@Param('tenantId') tenantId: string, @Request() req: any) {
    const userId = req.user.id || req.user.sub;

    // Check if user is a member of this tenant
    const isMember = await this.tenantsService.isMember(tenantId, userId);
    if (!isMember) {
      throw new ForbiddenException("You don't have access to this tenant");
    }

    const tenant = await this.tenantsService.findOne(tenantId);
    const role = await this.tenantsService.getMemberRole(tenantId, userId);

    // Generate tenant-scoped token
    const tenantAccessToken = this.jwtService.sign({
      sub: userId,
      email: req.user.email,
      name: req.user.name,
      tenantId: tenant.id,
      tenantRole: role,
    });

    return {
      success: true,
      data: {
        tenantAccessToken,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          role,
        },
        expiresIn: 3600,
      },
    };
  }

  @Get('owned')
  @ApiOperation({ summary: 'Get tenants owned by current user' })
  async getOwnedTenants(@Request() req: any) {
    return await this.tenantsService.findByOwnerId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findOne(@Param('id') id: string) {
    return await this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return await this.tenantsService.update(id, updateTenantDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update tenant status' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: TenantStatus }) {
    return await this.tenantsService.updateStatus(id, body.status);
  }

  @Patch(':id/upgrade')
  @ApiOperation({ summary: 'Upgrade tenant plan' })
  async upgradePlan(@Param('id') id: string, @Body() body: { plan: TenantPlan }) {
    return await this.tenantsService.upgradePlan(id, body.plan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant' })
  async remove(@Param('id') id: string) {
    await this.tenantsService.remove(id);
    return { message: 'Tenant deleted successfully' };
  }
}
