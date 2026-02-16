import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { AdminActiveUserDto, AdminUserRoleDto } from '../dto/update-admin.dto';
import { AdminUserService } from '../services/admin.users.service';
import { Paginate} from 'nestjs-paginate';
import { JwtAuthGuard } from 'src/common/guards/authguard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles';
import { UserRole } from 'src/common/enums/all-enums';


@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  findAll(@Paginate() query) {
    return this.adminUserService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUserService.findOne(id)
  }
  
  @Patch(':id')
  updateActive(@Param('id') id: string, @Body() dto: AdminActiveUserDto) {
    return this.adminUserService.updateActive(id,dto)
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: AdminUserRoleDto) {
    return this.adminUserService.updateRole(id,dto)
  }
 
}
