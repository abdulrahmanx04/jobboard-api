import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { FilterOperator, paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { User } from 'src/auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { AdminUserResponseDto } from '../dto/create-admin.dto';
import { AdminActiveUserDto, AdminUserRoleDto } from '../dto/update-admin.dto';
import { UserRole } from 'src/common/enums/all-enums';


@Injectable()
export class AdminUserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>){}

  async findAll(query: PaginateQuery) {
      const users= await paginate(query,this.userRepo, {
        ...this.usersConfig
      })
      let data= plainToInstance(AdminUserResponseDto,users.data, {excludeExtraneousValues: true})
      return {
        ...users,
        data
      }
  }

  async findOne(id: string) {
    const user= await this.userRepo.findOneOrFail({where: {id}})
    return plainToInstance(AdminUserResponseDto,user, {excludeExtraneousValues: true})
  }

   async updateActive(id: string, dto: AdminActiveUserDto) {
    if (dto.isActive === undefined && dto.isVerified === undefined) {
         throw new BadRequestException('Nothing to update')
    }
    const user= await this.userRepo.findOneOrFail({where: {id}})

    await this.userRepo.save(this.userRepo.merge(user,dto))
    
    return plainToInstance(AdminUserResponseDto,user, {excludeExtraneousValues: true})
  }

  async updateRole(id: string, dto: AdminUserRoleDto) {
    
    const user= await this.userRepo.findOneOrFail({where: {id}})

    this.checkRole(user,dto)
    

    await this.userRepo.save(this.userRepo.merge(user,dto))
    return plainToInstance(AdminUserResponseDto,user, {excludeExtraneousValues: true})
  }


  checkRole(user: User,dto: AdminUserRoleDto) {
    if (dto.role === undefined)  {
      throw new BadRequestException('Nothing to update');
    }
    if(user.role == UserRole.ADMIN) {
      throw new BadRequestException('You cannot change another admin role')
    }
    if(dto.role == UserRole.ADMIN) {
      throw new BadRequestException('You cannot make the user')
    }
  }

  private usersConfig: PaginateConfig<User>= {
        sortableColumns: ['createdAt','updatedAt','isActive','isVerified','role'],
        searchableColumns: ['name','email','role'],
        filterableColumns: {
          role: [FilterOperator.EQ],
          isVerified: [FilterOperator.EQ],
          isActive: [FilterOperator.EQ],
          name: [FilterOperator.ILIKE],
          email: [FilterOperator.ILIKE],
        },
        defaultSortBy: [['createdAt','DESC']],
        defaultLimit: 10,
        maxLimit: 100,
    }
}
