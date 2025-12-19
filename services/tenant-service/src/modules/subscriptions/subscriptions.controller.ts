import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionStatus } from './entities/subscription.entity';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return await this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  async findAll(@Query('tenantId') tenantId?: string) {
    return await this.subscriptionsService.findAll(tenantId);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get subscriptions by tenant ID' })
  async findByTenant(@Param('tenantId') tenantId: string) {
    return await this.subscriptionsService.findByTenantId(tenantId);
  }

  @Get('tenant/:tenantId/active')
  @ApiOperation({ summary: 'Get active subscription for tenant' })
  async getActiveSubscription(@Param('tenantId') tenantId: string) {
    return await this.subscriptionsService.getActiveSubscription(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  async findOne(@Param('id') id: string) {
    return await this.subscriptionsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update subscription status' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: SubscriptionStatus }) {
    return await this.subscriptionsService.updateStatus(id, body.status);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancel(@Param('id') id: string) {
    return await this.subscriptionsService.cancel(id);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew subscription' })
  async renew(@Param('id') id: string) {
    return await this.subscriptionsService.renew(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  async remove(@Param('id') id: string) {
    await this.subscriptionsService.remove(id);
    return { message: 'Subscription deleted successfully' };
  }
}
