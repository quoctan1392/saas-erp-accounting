import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';
import { SaveBusinessInfoDto } from './dto/save-business-info.dto';
import { SaveAccountingSetupDto } from './dto/save-accounting-setup.dto';
import { SaveBusinessSectorDto } from './dto/save-business-sector.dto';
import { SaveAdvancedSetupDto } from './dto/save-advanced-setup.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/user.decorator';

@Controller('tenants/:tenantId/onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  async getStatus(@Param('tenantId') tenantId: string) {
    const data = await this.onboardingService.getOnboardingStatus(tenantId);
    return {
      success: true,
      data,
    };
  }

  @Put('business-type')
  async updateBusinessType(
    @Param('tenantId') tenantId: string,
    @UserId() userId: string,
    @Body() dto: UpdateBusinessTypeDto,
  ) {
    const data = await this.onboardingService.updateBusinessType(
      tenantId,
      userId,
      dto.businessType,
    );
    return {
      success: true,
      data,
    };
  }

  @Post('business-info')
  async saveBusinessInfo(
    @Param('tenantId') tenantId: string,
    @UserId() userId: string,
    @Body() dto: SaveBusinessInfoDto,
  ) {
    const data = await this.onboardingService.saveBusinessInfo(
      tenantId,
      userId,
      dto,
    );
    return {
      success: true,
      data,
    };
  }

  @Post('business-sector')
  async saveBusinessSector(
    @Param('tenantId') tenantId: string,
    @UserId() userId: string,
    @Body() dto: SaveBusinessSectorDto,
  ) {
    const data = await this.onboardingService.saveBusinessSector(
      tenantId,
      userId,
      dto,
    );
    return {
      success: true,
      data,
    };
  }

  @Post('accounting-setup')
  async saveAccountingSetup(
    @Param('tenantId') tenantId: string,
    @UserId() userId: string,
    @Body() dto: SaveAccountingSetupDto,
  ) {
    const data = await this.onboardingService.saveAccountingSetup(
      tenantId,
      userId,
      dto,
    );
    return {
      success: true,
      data,
    };
  }

  @Post('advanced-setup')
  async saveAdvancedSetup(
    @Param('tenantId') tenantId: string,
    @UserId() userId: string,
    @Body() dto: SaveAdvancedSetupDto,
  ) {
    const data = await this.onboardingService.saveAdvancedSetup(
      tenantId,
      userId,
      dto,
    );
    return {
      success: true,
      data,
    };
  }

  @Post('complete')
  async completeOnboarding(
    @Param('tenantId') tenantId: string,
    @UserId() userId: string,
  ) {
    const data = await this.onboardingService.completeOnboarding(tenantId, userId);
    return {
      success: true,
      data,
    };
  }
}

@Controller('tax-info')
@UseGuards(JwtAuthGuard)
export class TaxInfoController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  async getTaxInfo(@Query('taxId') taxId: string) {
    try {
      const data = await this.onboardingService.getTaxInfo(taxId);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      if (error.status === 404) {
        return {
          success: false,
          error: {
            code: 'TAX_ID_NOT_FOUND',
            message: error.message,
          },
        };
      }
      if (error.status === 400) {
        return {
          success: false,
          error: {
            code: 'INVALID_TAX_ID_FORMAT',
            message: error.message,
          },
        };
      }
      throw error;
    }
  }
}
