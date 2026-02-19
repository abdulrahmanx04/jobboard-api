import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from "@nestjs/common";
import { Paginate } from "nestjs-paginate";
import { Roles } from "src/common/decorators/roles";
import { JwtAuthGuard } from "src/common/guards/authguard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AdminCompaniesService } from "../services/admin.companies.service";
import { BanCompanyDto, VerifyCompanyDto } from "../dto/update-admin.dto";
import { Throttle } from "@nestjs/throttler";










@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
@Controller('admin/companies')
@Throttle({default: {limit: 25, ttl: 60000}})
export class AdminCompaniesController {
    constructor(private adminCompaniesService: AdminCompaniesService){}

    @Get('')
    findAll(@Paginate() query){
        return this.adminCompaniesService.findAll(query)
    }


    @Get(':id')
    findOne(@Param('id') id: string){
        return this.adminCompaniesService.findOne(id)
    }

     @Patch(':id/verify')
    verify(@Param('id') id: string, @Body() dto: VerifyCompanyDto) {
        return this.adminCompaniesService.verifyCompany(id, dto)
    }

    @Patch(':id/ban')
    ban(@Param('id') id: string, @Body() dto: BanCompanyDto) {
        return this.adminCompaniesService.banCompany(id, dto)
    }

    @Delete(':id')
    @HttpCode(204)
    delete(@Param('id') id: string) {
        return this.adminCompaniesService.delete(id)
    }

}