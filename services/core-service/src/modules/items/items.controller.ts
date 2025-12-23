import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.itemsService.findAllItems(tenantId, paginationDto, {
      type,
      categoryId,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.itemsService.findOneItem(id, tenantId);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.itemsService.createItem(tenantId, userId, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.updateItem(id, tenantId, userId, dto);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.itemsService.deleteItem(id, tenantId, userId);
  }
}

@Controller('item-categories')
@UseGuards(JwtAuthGuard)
export class ItemCategoriesController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.itemsService.findAllCategories(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.itemsService.findOneCategory(id, tenantId);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateItemCategoryDto,
  ) {
    return this.itemsService.createCategory(tenantId, userId, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: UpdateItemCategoryDto,
  ) {
    return this.itemsService.updateCategory(id, tenantId, userId, dto);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.itemsService.deleteCategory(id, tenantId, userId);
  }
}

@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.itemsService.findAllUnits(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.itemsService.findOneUnit(id, tenantId);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateUnitDto,
  ) {
    return this.itemsService.createUnit(tenantId, userId, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.itemsService.updateUnit(id, tenantId, userId, dto);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.itemsService.deleteUnit(id, tenantId, userId);
  }
}
