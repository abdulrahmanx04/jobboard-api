import { Body, Controller, Get, Injectable, Param, Patch, UseGuards } from "@nestjs/common";
import { AdminJobsService } from "../services/admin.jobs.service";
import { Paginate } from "nestjs-paginate";
import { JwtAuthGuard } from "src/common/guards/authguard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles";
import { ReviewJobDto } from "../dto/update-admin.dto";


@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@Controller('admin/jobs')
export class AdminJobController {
    constructor(private adminJobService: AdminJobsService){}

    @Get('')
    findAll(@Paginate() query){
        return this.adminJobService.findAll(query)
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.adminJobService.findOne(id)
    }

    @Patch(':id/approve')
    approveJob(@Param('id') id: string) {
        return this.adminJobService.approveJob(id)
    }

    @Patch(':id/reject')
    rejectJob(@Param('id') id: string, @Body() dto: ReviewJobDto) {
        return this.adminJobService.rejectJob(id,dto)
    }

     @Patch(':id/takedown')
    takeDownJob(@Param('id') id: string, @Body() dto: ReviewJobDto) {
            return this.adminJobService.takeDowmJob(id,dto)
    }

    @Patch(':id/restore')
    restoreJob(@Param('id') id: string) {
        return this.adminJobService.restoreJob(id)
    }
    
}