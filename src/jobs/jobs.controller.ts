import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpCode } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto, UpdateJobDto, UpdateJobCloseDto } from './dto/update-job.dto';
import { JwtAuthGuard } from 'src/common/guards/authguard';
import { User } from 'src/common/decorators/current.user';
import type { UserData } from 'src/common/interfaces/all.interfaces';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { Throttle } from '@nestjs/throttler';


@Throttle({default: {limit: 25, ttl: 60000}})
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('employer','admin')
  @Post()
  create(@Body() createJobDto: CreateJobDto, @User() user : UserData) {
    return this.jobsService.create(createJobDto,user)
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.jobsService.findAll(query)
  }

  @Get('company/:companyId')
  findJobsByCompany(@Param('companyId') companyId: string,@Paginate() query: PaginateQuery){
    return this.jobsService.findJobsByCompany(companyId,query)
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('employer')
  @Get('/my-posting')
  findEmployeJobs(@Paginate() query: PaginateQuery, @User() userData: UserData){
    return this.jobsService.findEmployeJobs(query,userData)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('employer')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto,@User() userData: UserData) {
    return this.jobsService.update(id, updateJobDto,userData)
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('employer')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string,@User() userData: UserData) {
    return this.jobsService.remove(id,userData);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('employer')
  @Patch(':id/status')
  updateJobStatus(@Param('id') id: string, @Body() updateJobStatusDto: UpdateJobStatusDto, @User() userData: UserData) {
    return this.jobsService.updateJobStatus(id, updateJobStatusDto,userData)
  }

  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('employer')
  @Patch(':id/close')
  closeJob(@Param('id') id: string, @Body() updateJobCloseDto: UpdateJobCloseDto ,@User() userData: UserData) {
    return this.jobsService.updateCloseJob(id,updateJobCloseDto,userData)
  }

}