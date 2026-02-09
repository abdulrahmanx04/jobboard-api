import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto, JobResponseDto } from './dto/create-job.dto';
import { UpdateJobCloseDto, UpdateJobDto, UpdateJobStatusDto } from './dto/update-job.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';
import { JobStatus } from 'src/common/enums/all-enums';
@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private jobRepo: Repository<Job>){}
  async create(dto: CreateJobDto, userData: UserData): Promise<JobResponseDto> {
      const job = await this.jobRepo.save(this.jobRepo.create({
        ...dto,
        employerId: userData.id
      }))
      const jobWithEmployer = await this.jobRepo.findOne({where: {id: job.id}, relations: ['employer']})
      return plainToInstance(JobResponseDto, jobWithEmployer, {excludeExtraneousValues: true})
  }

  async findAll(query: PaginateQuery): Promise<{data: JobResponseDto[], meta: any}> {
      const jobs= await this.getJobs(query)
      const data=plainToInstance(JobResponseDto, jobs.data, {excludeExtraneousValues: true})
      return {
        ...jobs,
        data
      }
  }

  async findOne(id: string): Promise<JobResponseDto> {
      const job= await this.jobRepo.findOneOrFail({where: {id}, relations: ['employer']})
      this.checkNotFoundJob(job)
      return plainToInstance(JobResponseDto,job,{excludeExtraneousValues: true})
  }

  async findEmployeJobs(query: PaginateQuery, userData: UserData): Promise<{data: JobResponseDto[], meta: any}> {
    const jobs= await this.getEmpJobs(query,userData)
    const data= plainToInstance(JobResponseDto,jobs.data,{excludeExtraneousValues: true})
    return {
      ...jobs,
      data
    }
  }
 
  async update(id: string, dto: UpdateJobDto, userData: UserData): Promise<JobResponseDto> {

    const job= await this.jobRepo.findOne({where: {id,employerId: userData.id}})
    this.checkNotFoundJob(job)

    await this.jobRepo.save(this.jobRepo.merge(job,dto))

    const jobWithEmployer = await this.jobRepo.findOne({where: {id: job.id}, relations: ['employer']})

    return plainToInstance(JobResponseDto,jobWithEmployer,{excludeExtraneousValues: true})
  
  }
  
  async updateJobStatus(id: string, dto: UpdateJobStatusDto,userData: UserData): Promise<JobResponseDto> {
    const job = await this.jobRepo.findOne({where: {id, employerId: userData.id}, relations: ['employer']})
    this.checkNotFoundJob(job) 
    job.status = dto.status as JobStatus

    await this.jobRepo.save(job)
    
    return plainToInstance(JobResponseDto, job, {excludeExtraneousValues: true})
  }

  async updateCloseJob(id: string, dto: UpdateJobCloseDto,userData: UserData): Promise<JobResponseDto> {
    const job = await this.jobRepo.findOne({where: {id, employerId: userData.id},relations: ['employer']})
    this.checkNotFoundJob(job)
    job.isClosed = dto.isClosed
    await this.jobRepo.save(job)
    
    return plainToInstance(JobResponseDto, job, {excludeExtraneousValues: true})
  }

  async remove(id: string, userData: UserData) {
    const job= await this.jobRepo.findOne({where: {id,employerId: userData.id}})
    this.checkNotFoundJob(job)
    await this.jobRepo.delete({id: job.id})
    return
  }

  async getJobs(query: PaginateQuery){
    return  await paginate(query,this.jobRepo, {
        sortableColumns: ['createdAt','updatedAt','salaryMin','salaryMax','status','category','jobLevel','jobType'],
        searchableColumns: ['status','jobLevel','jobType','category','title','description'],
        filterableColumns: {
          status: [FilterOperator.IN],
          category: [FilterOperator.IN],
          jobLevel: [FilterOperator.IN],
          jobType: [FilterOperator.IN],
          workplaceType: [FilterOperator.IN],
          department: [FilterOperator.IN],
          salaryMin: [FilterOperator.GTE, FilterOperator.LTE],
          salaryMax: [FilterOperator.GTE, FilterOperator.LTE],
          applicationDeadline: [FilterOperator.GTE, FilterOperator.LTE],
          createdAt: [FilterOperator.GTE, FilterOperator.LTE],
          title: [FilterOperator.ILIKE],
          description: [FilterOperator.ILIKE],
          isActive: [FilterOperator.EQ],
          featured: [FilterOperator.EQ],
          isClosed: [FilterOperator.EQ],
        },
        defaultSortBy: [['createdAt','DESC']],
        defaultLimit: 10,
        maxLimit: 100,
        where: {status: JobStatus.PUBLISHED,isActive: true,isClosed: false},
        relations: ['employer']
      })
  }

  async getEmpJobs(query: PaginateQuery,userData: UserData) {
    return  await paginate(query,this.jobRepo, {
        sortableColumns: ['createdAt','updatedAt','salaryMin','salaryMax','status','category','jobLevel','jobType'],
        searchableColumns: ['status','jobLevel','jobType','category','title','description'],
        filterableColumns: {
          status: [FilterOperator.IN],
          category: [FilterOperator.IN],
          jobLevel: [FilterOperator.IN],
          jobType: [FilterOperator.IN],
          workplaceType: [FilterOperator.IN],
          department: [FilterOperator.IN],
          salaryMin: [FilterOperator.GTE, FilterOperator.LTE],
          salaryMax: [FilterOperator.GTE, FilterOperator.LTE],
          applicationDeadline: [FilterOperator.GTE, FilterOperator.LTE],
          createdAt: [FilterOperator.GTE, FilterOperator.LTE],
          title: [FilterOperator.ILIKE],
          description: [FilterOperator.ILIKE],
          isActive: [FilterOperator.EQ],
          featured: [FilterOperator.EQ],
          isClosed: [FilterOperator.EQ],
        },
        defaultSortBy: [['createdAt','DESC']],
        defaultLimit: 10,
        maxLimit: 100,
        where: {employerId: userData.id,isClosed: false},
        relations: ['employer']
      })
  }
  private checkNotFoundJob(job: Job | null): asserts job is Job {
    if(!job){
      throw new NotFoundException('Job not found')
    }
  }
}
