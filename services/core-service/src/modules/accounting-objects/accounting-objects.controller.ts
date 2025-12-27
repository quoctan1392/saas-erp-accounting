import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AccountingObjectsService } from './accounting-objects.service';
import { CreateAccountingObjectDto } from './dto/create-accounting-object.dto';
import { UpdateAccountingObjectDto } from './dto/update-accounting-object.dto';
import { CreateSubjectGroupDto } from './dto/create-subject-group.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';

@Controller('objects')
@UseGuards(JwtAuthGuard)
export class AccountingObjectsController {
  constructor(private readonly accountingObjectsService: AccountingObjectsService) {}

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
    @Query('type') type?: 'customer' | 'vendor' | 'employee',
    @Query('isActive') isActive?: string,
  ) {
    return this.accountingObjectsService.findAll(tenantId, paginationDto, {
      type,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get('next-code')
  async getNextCode(
    @TenantId() tenantId: string,
    @Query('type') type: 'customer' | 'vendor' | 'employee' = 'customer',
  ) {
    const code = await this.accountingObjectsService.getNextObjectCode(tenantId, type);
    return { code };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.accountingObjectsService.findOne(id, tenantId);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateAccountingObjectDto,
  ) {
    return this.accountingObjectsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: UpdateAccountingObjectDto,
  ) {
    return this.accountingObjectsService.update(id, tenantId, userId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @TenantId() tenantId: string, @UserId() userId: string) {
    return this.accountingObjectsService.delete(id, tenantId, userId);
  }
}

@Controller('subject-groups')
@UseGuards(JwtAuthGuard)
export class SubjectGroupsController {
  constructor(private readonly accountingObjectsService: AccountingObjectsService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.accountingObjectsService.findAllGroups(tenantId);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateSubjectGroupDto,
  ) {
    return this.accountingObjectsService.createGroup(tenantId, userId, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: Partial<CreateSubjectGroupDto>,
  ) {
    return this.accountingObjectsService.updateGroup(id, tenantId, userId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @TenantId() tenantId: string, @UserId() userId: string) {
    return this.accountingObjectsService.deleteGroup(id, tenantId, userId);
  }
}
