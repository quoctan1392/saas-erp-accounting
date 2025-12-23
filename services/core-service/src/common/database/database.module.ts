import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
