import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto, EmployerJobResponseDto, JobResponseDto } from './dto/create-job.dto';
import { UpdateJobCloseDto, UpdateJobDto, UpdateJobStatusDto } from './dto/update-job.dto';
import { UserData } from 'src/common/interfaces/all.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { FilterOperator, paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { JobStatus, ReviewStatus } from 'src/common/enums/all-enums';
import { Company } from 'src/companies/entities/company.entity';
@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private jobRepo: Repository<Job>,
  @InjectRepository(Company) private companyRepo: Repository<Company>
  ){}

  async create(dto: CreateJobDto, userData: UserData): Promise<EmployerJobResponseDto> {
      if (dto.companyId) await this.checkCompanyExists(dto.companyId,userData)
      const job = await this.jobRepo.save(this.jobRepo.create({
        ...dto,
        employerId: userData.id,
        companyId: dto.companyId
      }))
      const jobWithCompany = await this.jobRepo.findOne({where: {id: job.id}, relations: ['company','employer']})
      return plainToInstance(EmployerJobResponseDto, jobWithCompany, {excludeExtraneousValues: true})
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
      const job= await this.jobRepo.findOneOrFail({where: {id,status: JobStatus.PUBLISHED,reviewStatus: ReviewStatus.APPROVED}, relations: ['company','employer']})
      return plainToInstance(JobResponseDto,job,{excludeExtraneousValues: true})
  }

  async findEmployeJobs(query: PaginateQuery, userData: UserData): Promise<{data: EmployerJobResponseDto[], meta: any}> {
    const jobs= await this.getEmpJobs(query,userData)
    const data= plainToInstance(EmployerJobResponseDto,jobs.data,{excludeExtraneousValues: true})
    return {
      ...jobs,
      data
    }
  }
  async findJobsByCompany(companyId: string,query: PaginateQuery) {
      const jobs= await this.getJobsByCompany(companyId,query)
      const data= plainToInstance(JobResponseDto,jobs.data,{excludeExtraneousValues: true})
      return {
        ...jobs,
        data
      }
  }

  async update(id: string, dto: UpdateJobDto, userData: UserData): Promise<EmployerJobResponseDto> {

    const job= await this.jobRepo.findOneOrFail({where: {id,employerId: userData.id}})

    await this.jobRepo.save(this.jobRepo.merge(job,dto))

    const jobWithEmployer = await this.jobRepo.findOne({where: {id: job.id}, relations: ['employer','company']})

    return plainToInstance(EmployerJobResponseDto,jobWithEmployer,{excludeExtraneousValues: true})
  
  }
  
  async updateJobStatus(id: string, dto: UpdateJobStatusDto,userData: UserData): Promise<EmployerJobResponseDto> {
    const job = await this.jobRepo.findOneOrFail({where: {id, employerId: userData.id}, relations: ['employer']})
    job.status = dto.status as JobStatus

    await this.jobRepo.save(job)
    
    return plainToInstance(EmployerJobResponseDto, job, {excludeExtraneousValues: true})
  }

  async updateCloseJob(id: string, dto: UpdateJobCloseDto,userData: UserData): Promise<EmployerJobResponseDto> {
    const job = await this.jobRepo.findOneOrFail({where: {id, employerId: userData.id},relations: ['employer']})
    job.isClosed = dto.isClosed
    await this.jobRepo.save(job)
    
    return plainToInstance(EmployerJobResponseDto, job, {excludeExtraneousValues: true})
  }

  async remove(id: string, userData: UserData) {
    const job= await this.jobRepo.findOneOrFail({where: {id,employerId: userData.id}})
    await this.jobRepo.delete({id: job.id})
  }

  async getJobs(query: PaginateQuery){
    return  await paginate(query,this.jobRepo, {
        ...this.publicJobPaginateConfig,
        where: {
          status: JobStatus.PUBLISHED,
          reviewStatus: ReviewStatus.APPROVED, 
          isActive: true,
          isClosed: false
        },
      })
  }

  async getEmpJobs(query: PaginateQuery,userData: UserData) {
    return  await paginate(query,this.jobRepo, {
        ...this.empJobPaginateConfig,
        where: {employerId: userData.id},
      })
  }

  async getJobsByCompany(companyId: string,query: PaginateQuery) {
    return  await paginate(query,this.jobRepo, {
      sortableColumns: ['createdAt','updatedAt','salaryMin','salaryMax','status','category','jobLevel','jobType','company.slug'],
      searchableColumns: ['status','jobLevel','jobType','category','title','description','company.name','company.slug'],
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
          'company.name': [FilterOperator.ILIKE],
          'company.slug': [FilterOperator.ILIKE],
      },
      relations: ['company'],
      where: {companyId, status: JobStatus.PUBLISHED, reviewStatus: ReviewStatus.APPROVED},
      defaultSortBy: [['createdAt','DESC']],
      defaultLimit: 10,
      maxLimit: 100,
    })
  }
  async checkCompanyExists(companyId: string,userData: UserData) {
        const companyExists= await this.companyRepo.findOneOrFail({where: {
          id: companyId,
          ownerId: userData.id
        }})
  }
  empJobPaginateConfig: PaginateConfig<Job>= {
            sortableColumns: ['createdAt','updatedAt','salaryMin','salaryMax','status','category','jobLevel','jobType' ,'reviewStatus',],
            searchableColumns: ['status','jobLevel','jobType','reviewStatus','category','title','description'],
            filterableColumns: {
                status: [FilterOperator.IN],
                category: [FilterOperator.IN],
                jobLevel: [FilterOperator.IN],
                jobType: [FilterOperator.IN],
                reviewStatus: [FilterOperator.IN], 
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
            relations: ['employer','company'],
  }
  publicJobPaginateConfig: PaginateConfig<Job> = {
      sortableColumns: [
        'createdAt',
        'updatedAt',
        'salaryMin',
        'salaryMax',
        'featured',
      ],
      searchableColumns: [
        'title',
        'description',
        'category',
        'location',
      ],
      filterableColumns: {
        category: [FilterOperator.IN],
        jobLevel: [FilterOperator.IN],
        jobType: [FilterOperator.IN],
        workplaceType: [FilterOperator.IN],
        department: [FilterOperator.IN],
        location: [FilterOperator.ILIKE],

        salaryMin: [FilterOperator.GTE, FilterOperator.LTE],
        salaryMax: [FilterOperator.GTE, FilterOperator.LTE],

        applicationDeadline: [FilterOperator.GTE, FilterOperator.LTE],
        createdAt: [FilterOperator.GTE, FilterOperator.LTE],

        featured: [FilterOperator.EQ],
      },
      defaultSortBy: [['createdAt', 'DESC']],
      defaultLimit: 10,
      maxLimit: 100,
      relations: ['company','employer'],
  } ;
}
