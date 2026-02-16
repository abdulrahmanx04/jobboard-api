import { Module } from '@nestjs/common';
import { AdminUserController } from './controllers/admin.users.controller';
import { AdminUserService } from './services/admin.users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/auth.entity';
import { Job } from 'src/jobs/entities/job.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Application } from 'src/applications/entities/application.entity';
import { JobsModule } from 'src/jobs/jobs.module';
import { AdminJobsService } from './services/admin.jobs.service';
import { AdminJobController } from './controllers/admin.jobs.controller';
@Module({
  imports: [TypeOrmModule.forFeature([User,Job,Company,Application]),JobsModule],
  controllers: [AdminUserController,AdminJobController],
  providers: [AdminUserService,AdminJobsService],
})
export class AdminModule {}
