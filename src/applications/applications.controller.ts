import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto} from './dto/create-application.dto';
import { UpdateAppEmpNote, UpdateAppStatusDto } from './dto/update-application.dto';
import { User } from 'src/common/decorators/current.user';
import type { UserData } from 'src/common/interfaces/all.interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/authguard';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles';
import { UserRole } from 'src/common/enums/all-enums';
import { ApplicationEmployerService } from './application.employer.service';

@UseGuards(JwtAuthGuard)
@Controller('jobs/:jobId/applications')
export class ApplicationsJobsController {
  constructor(private readonly applicationsService: ApplicationsService,
    private readonly applicationEmpService: ApplicationEmployerService
  ) {}
  
  @Post()
  @UseInterceptors(FileInterceptor('resume'))
  create(
    @Param('jobId') jobId: string,
    @Body() createApplicationDto: CreateApplicationDto, 
    @User() userData: UserData,
    @UploadedFile() file?: Express.Multer.File
) {
    return this.applicationsService.create(jobId,createApplicationDto,userData,file);
  }
  
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get()
  findByJob(@Param('jobId') jobId: string, @Paginate() query: PaginateQuery, @User() userData: UserData) {
      return this.applicationEmpService.findByJob(jobId,query,userData)
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('stats')
  getJobStats(@Param('jobId') jobId: string, @User() userData: UserData) {
    console.log('yooyoyoyoy')
    return this.applicationEmpService.getJobStats(jobId,userData)
  }
  
  
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get(':applicationId')
  findOneByJob(@Param('jobId') jobId: string, @Param('applicationId') applicationId: string, @User() userData: UserData) {
      return this.applicationEmpService.findOneByJob(jobId,applicationId,userData)
  }

  

  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Patch(':applicationId/status')
  updateAppStatus(@Param('jobId') jobId: string, @Param('applicationId') applicationId: string, @Body() updateAppStatusDto: UpdateAppStatusDto, @User() userData: UserData){
    return this.applicationEmpService.updateAppStatus(jobId,applicationId,updateAppStatusDto,userData)
  }

  
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Patch(':applicationId/note')
  updateAppNote(@Param('jobId') jobId: string, @Param('applicationId') applicationId: string, @Body() updateAppEmpNote: UpdateAppEmpNote, @User() userData: UserData){
    return this.applicationEmpService.updateAppNote(jobId,applicationId,updateAppEmpNote,userData)
  }

}

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  findAll(@Paginate() query: PaginateQuery, @User() userData: UserData) {
    return this.applicationsService.findAll(query, userData);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() userData: UserData) {
    return this.applicationsService.findOne(id, userData)
  }

  @Patch(':id/withdraw')
  withdraw(@Param('id') id: string, @User() userData: UserData) {
    return this.applicationsService.withdraw(id, userData);
  }

  
}