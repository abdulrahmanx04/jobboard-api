import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController, ApplicationsJobsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { User } from 'src/auth/entities/auth.entity';
import { Job } from 'src/jobs/entities/job.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ApplicationEmployerService } from './application.employer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Application,User,Job]), CloudinaryModule],
  controllers: [ApplicationsController,ApplicationsJobsController],
  providers: [ApplicationsService,ApplicationEmployerService],
})
export class ApplicationsModule {}
