import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Common
import { DatabaseModule } from './common/database/database.module';
import { RedisModule } from './common/cache/redis.module';
// import { RabbitMQModule } from './common/messaging/rabbitmq.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtStrategy } from './common/strategies/jwt.strategy';

// Entities
import { AccountingObject } from './modules/accounting-objects/entities/accounting-object.entity';
import { SubjectGroup } from './modules/accounting-objects/entities/subject-group.entity';
import { BankAccount } from './modules/bank-accounts/entities/bank-account.entity';
import { BusinessProfile } from './modules/business-profile/entities/business-profile.entity';
import { EInvoiceProvider } from './modules/business-profile/entities/einvoice-provider.entity';
import { ChartOfAccountsGeneral } from './modules/chart-of-accounts/entities/chart-of-accounts-general.entity';
import { ChartOfAccountsCustom } from './modules/chart-of-accounts/entities/chart-of-accounts-custom.entity';
import { InventoryTransaction } from './modules/inventory/entities/inventory-transaction.entity';
import { Invoice } from './modules/invoices/entities/invoice.entity';
import { InvoiceDetail } from './modules/invoices/entities/invoice-detail.entity';
import { Item } from './modules/items/entities/item.entity';
import { ItemCategory } from './modules/items/entities/item-category.entity';
import { Unit } from './modules/items/entities/unit.entity';
import { SaleVoucher } from './modules/sales/entities/sale-voucher.entity';
import { SaleVoucherDetail } from './modules/sales/entities/sale-voucher-detail.entity';
import { OutwardVoucher } from './modules/sales/entities/outward-voucher.entity';
import { OutwardVoucherDetail } from './modules/sales/entities/outward-voucher-detail.entity';
import { ReceiptVoucher } from './modules/sales/entities/receipt-voucher.entity';
import { ReceiptVoucherDetail } from './modules/sales/entities/receipt-voucher-detail.entity';
import { Warehouse } from './modules/warehouses/entities/warehouse.entity';

// Modules
import { BusinessProfileModule } from './modules/business-profile/business-profile.module';
import { ChartOfAccountsModule } from './modules/chart-of-accounts/chart-of-accounts.module';
import { AccountingObjectsModule } from './modules/accounting-objects/accounting-objects.module';
import { ItemsModule } from './modules/items/items.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { SalesModule } from './modules/sales/sales.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { DeclarationModule } from './modules/declaration/declaration.module';
// import { ReportsModule } from './modules/reports/reports.module';

// All entities array
const entities = [
  AccountingObject,
  SubjectGroup,
  BankAccount,
  BusinessProfile,
  EInvoiceProvider,
  ChartOfAccountsGeneral,
  ChartOfAccountsCustom,
  InventoryTransaction,
  Invoice,
  InvoiceDetail,
  Item,
  ItemCategory,
  Unit,
  SaleVoucher,
  SaleVoucherDetail,
  OutwardVoucher,
  OutwardVoucherDetail,
  ReceiptVoucher,
  ReceiptVoucherDetail,
  Warehouse,
];

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: entities,
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),

    // Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Passport & JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '1d'),
        },
      }),
      inject: [ConfigService],
    }),

    // Common modules
    DatabaseModule,
    RedisModule,
    // RabbitMQModule,

    // Feature modules
    BusinessProfileModule,
    ChartOfAccountsModule,
    AccountingObjectsModule,
    ItemsModule,
    WarehousesModule,
    SalesModule,
    InvoicesModule,
    InventoryModule,
    BankAccountsModule,
    DeclarationModule,
    // ReportsModule,
  ],
  providers: [
    JwtStrategy,
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // Global Filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
