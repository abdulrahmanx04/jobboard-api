import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { ApplicationResponseDto, CreateApplicationDto } from './dto/create-application.dto';
import {UpdateAppEmpNote, UpdateAppStatusDto } from './dto/update-application.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { Job } from 'src/jobs/entities/job.entity';
import { plainToInstance } from 'class-transformer';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';
import { ApplicationStatus } from 'src/common/enums/all-enums';

@Injectable()
export class ApplicationsService {
  constructor(@InjectRepository(Application) private appRepo: Repository<Application>,
  @InjectRepository(Job) private jobRepo: Repository<Job>,
  private cloudainaryService: CloudinaryService
){}

  async create(jobId: string, dto: CreateApplicationDto, userData: UserData, file?: Express.Multer.File): Promise<ApplicationResponseDto> {
      const application= await this.createApplicantion(jobId,dto,userData,file)
      return plainToInstance(ApplicationResponseDto,application,{excludeExtraneousValues: true})
  }

  async findAll(query: PaginateQuery, userData: UserData) {
    const applications= await this.getMyApp(query,userData)
    const data= plainToInstance(ApplicationResponseDto, applications.data, {excludeExtraneousValues: true})
    return {
      ...applications,
      data
    }
  }
  async findOne(id: string, userData: UserData) {
      const application =await this.appRepo.findOneOrFail({where: {id,userId: userData.id},relations: ['job']})
      return plainToInstance(ApplicationResponseDto,application,{excludeExtraneousValues: true})
  }
  async withdraw(id: string,userData: UserData) {
     const application = await this.appRepo.findOneOrFail({where : {id,userId: userData.id}})
     const withdraw= await this.withdrawApp(application)  
    return plainToInstance(ApplicationResponseDto,withdraw, {excludeExtraneousValues: true})
  }
  

  async createApplicantion(jobId: string,dto: CreateApplicationDto, userData: UserData, file?: Express.Multer.File) {
      const [jobExists,applicationExists]= await Promise.all( [this.jobRepo.findOneOrFail({where :{id: jobId, isClosed: false}}),
        this.appRepo.findOne({where: {userId: userData.id}})
      ])
      if(applicationExists){
        throw new ConflictException('Already applied')
      }
      let upload: UploadApiResponse | null = null
      if(file) {
        upload = await this.cloudainaryService.uploadFile(file,'resume')
      }
      const application= this.appRepo.create({
        ...dto,
        jobId,
        userId: userData.id,
        resumeUrl: upload?.secure_url,
        resumePublicId: upload?.public_id
      })
      await this.appRepo.save(application)
      return application
  }

  async getMyApp(query: PaginateQuery, userData: UserData){
    return await paginate(query,this.appRepo, {
      sortableColumns: ['appliedAt','status','reviewedAt'],
      searchableColumns: ['source','status','job.title', 'job.company.name','job.location'],
      filterableColumns: {
        status: [FilterOperator.IN],
        appliedAt: [FilterOperator.GTE, FilterOperator.LTE],
        reviewedAt: [FilterOperator.GTE, FilterOperator.LTE],
        'job.jobType': [FilterOperator.IN],
        'job.company.name': [FilterOperator.ILIKE]
      },
      defaultSortBy: [['appliedAt','DESC']],
      defaultLimit: 10,
      maxLimit: 100,
      where: {userId: userData.id},
      relations: ['job' , 'job.company']
    })
  }


  async withdrawApp(application: Application) {
    if(application.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException('Application already withdrawn')
    }
    if (application.status === ApplicationStatus.ACCEPTED || application.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException('Cannot withdraw finalized application')
    }
      application.status= ApplicationStatus.WITHDRAWN
      return await this.appRepo.save(application)
  }
}


