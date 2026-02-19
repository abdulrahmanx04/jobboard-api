import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Put, HttpCode } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from 'src/common/decorators/current.user';
import type { UserData } from 'src/common/interfaces/all.interfaces';
import { JwtAuthGuard } from 'src/common/guards/authguard';
import {  FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles';
import { UserRole } from 'src/common/enums/all-enums';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { Throttle } from '@nestjs/throttler';


@Throttle({default: {limit: 25, ttl: 60000}})
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @UseInterceptors(FileInterceptor('logo'))
  @Post()
  create(@Body() dto: CreateCompanyDto, @User() userData: UserData, @UploadedFile() file?: Express.Multer.File) {
    return this.companiesService.create(dto,userData,file)
  }

  @Get('')
  findAll(@Paginate() query: PaginateQuery) {
    return this.companiesService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id)
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('/me/owned')
  findOwnedCompanies(@Paginate() query: PaginateQuery, @User() userData: UserData){
    return this.companiesService.findOwnedCompanies(query,userData)
  }

  @Get('/slug/:slug')
  findBySlut(@Param('slug') slug: string) {
    return this.companiesService.findBySlug(slug)
  }  

  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @UseInterceptors(FileInterceptor('logo'))
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @User() userData: UserData, @UploadedFile() file?: Express.Multer.File) {
    return this.companiesService.update(id, dto,userData,file);
  }
  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: string, @User() userData: UserData) {
    return this.companiesService.remove(id,userData)
  }
}
