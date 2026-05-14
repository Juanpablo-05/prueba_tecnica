import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';

@Module({
  imports: [PrescriptionsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
