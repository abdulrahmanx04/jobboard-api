import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from "@nestjs/common";
import{ Paginate, type PaginateQuery } from "nestjs-paginate";
import { AdminAppService } from "../services/admin.applications.service";
import { JwtAuthGuard } from "src/common/guards/authguard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles";
import { AppStatus } from "../dto/update-admin.dto";
import { Throttle } from "@nestjs/throttler";







@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@Controller('admin/applications')
@Throttle({default: {limit: 25, ttl: 60000}})
export class AdminAppController {
    constructor(private adminAppService: AdminAppService){}
    @Get('')
    findAll(@Paginate() query) {
        return this.adminAppService.findAll(query)
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminAppService.findOne(id)
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: AppStatus) {
        return this.adminAppService.updateStatus(id,dto)
    }

    @Patch(':id/restore')
    restoreApp(@Param('id') id: string) {
        return this.adminAppService.restoreApp(id)
    }

    @HttpCode(204)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.adminAppService.deleteApp(id)
    }
}