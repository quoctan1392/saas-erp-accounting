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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantStatus, TenantPlan } from './entities/tenant.entity';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req) {
    return await this.tenantsService.create({
      ...createTenantDto,
      ownerId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiQuery({ name: 'status', required: false, enum: TenantStatus })
  @ApiQuery({ name: 'plan', required: false, enum: TenantPlan })
  async findAll(@Query('status') status?: TenantStatus, @Query('plan') plan?: TenantPlan) {
    return await this.tenantsService.findAll({ status, plan });
  }

  @Get('my-tenants')
  @ApiOperation({ summary: 'Get tenants owned by current user' })
  async getMyTenants(@Request() req) {
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
