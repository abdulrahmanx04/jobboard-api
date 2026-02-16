import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { FilterOperator, paginate, PaginateConfig, PaginateQuery } from "nestjs-paginate";
import { Job } from "src/jobs/entities/job.entity";
import { Repository } from "typeorm";
import {  ReviewJobDto  } from "../dto/update-admin.dto";
import { AdminJobResponseDto } from "../dto/create-admin.dto";
import { JobStatus, ReviewStatus } from "src/common/enums/all-enums";
@Injectable()
export class AdminJobsService {

    constructor(@InjectRepository(Job) private jobRepo: Repository<Job>,
){}
    async findAll(query: PaginateQuery): Promise<{data: AdminJobResponseDto[] ,meta: any}> {
        const jobs =await paginate(query,this.jobRepo,{
            ...this.adminJobPaginateConfig
        })
        const data= plainToInstance(AdminJobResponseDto, jobs.data,{excludeExtraneousValues: true})
        return {
            ...jobs,
            data
        }
    }

    async findOne(id: string): Promise<AdminJobResponseDto> {
        const job = await this.jobRepo.findOneOrFail({where: {id},relations: ['company','employer']})
        return plainToInstance(AdminJobResponseDto, job, {excludeExtraneousValues: true})
    }
    
    async approveJob(id: string){
        const job=  await this.jobRepo.findOneOrFail({where: {id},relations: ['company','employer']})
        this.checkStatus(job,JobStatus.PUBLISHED,ReviewStatus.PENDING,'Job must be published','Job must be pending')
        job.reviewStatus= ReviewStatus.APPROVED
        job.reviewReason = null
        const saved= await this.jobRepo.save(job)
        return plainToInstance(AdminJobResponseDto, saved, {excludeExtraneousValues: true})
    }

    async rejectJob(id: string,dto:  ReviewJobDto ){
        const job=  await this.jobRepo.findOneOrFail({where: {id},relations: ['company','employer']})

        this.checkStatus(job,JobStatus.PUBLISHED,ReviewStatus.PENDING,'Job must be published','Job must be pending')
        job.reviewStatus= ReviewStatus.REJECTED
        job.reviewReason= dto.reviewReason
        const saved= await this.jobRepo.save(job)
        return plainToInstance(AdminJobResponseDto,saved,{excludeExtraneousValues: true})
    }

    async takeDowmJob(id: string, dto: ReviewJobDto) {
          const job=  await this.jobRepo.findOneOrFail({where: {id},relations: ['company','employer']})

          this.checkStatus(job,JobStatus.PUBLISHED,ReviewStatus.APPROVED,'Job must be published','Job must be approved')

          job.reviewStatus= ReviewStatus.TAKEN_DOWN
          job.reviewReason= dto.reviewReason 

          const saved= await this.jobRepo.save(job)
          return plainToInstance(AdminJobResponseDto,saved,{excludeExtraneousValues: true})
    }

    async restoreJob(id: string) {
        const job=  await this.jobRepo.findOneOrFail({where: {id},relations: ['company','employer']})

        this.checkStatus(job,JobStatus.PUBLISHED,ReviewStatus.TAKEN_DOWN,'Job must be published','Job was not taken down to restore it')
       

        job.reviewStatus= ReviewStatus.APPROVED 
        job.reviewReason = null   
        const saved= await this.jobRepo.save(job)
        return plainToInstance(AdminJobResponseDto,saved,{excludeExtraneousValues: true})
    }
    checkStatus(job: Job, statusCondition: JobStatus, reviewConditon: ReviewStatus,statusError: string,reviewError: string) {
        if(job.status !== statusCondition) {
            throw new BadRequestException(statusError)
        }
        if(job.reviewStatus !==reviewConditon){
            throw new BadRequestException(reviewError)
        } 
    }
    private adminJobPaginateConfig: PaginateConfig<Job> = {
        sortableColumns: [
            'createdAt',
            'updatedAt',
            'salaryMin',
            'salaryMax',
            'status',
            'reviewStatus',
            'category',
            'jobLevel',
            'jobType',
            'companyId',   
            'employerId',  
        ],
        searchableColumns: [
            'status',
            'jobLevel',
            'jobType',
            'reviewStatus',
            'category',
            'title',
            'description',
        ],
        filterableColumns: {
            companyId: [FilterOperator.EQ, FilterOperator.IN],
            employerId: [FilterOperator.EQ, FilterOperator.IN],
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
        defaultSortBy: [['createdAt', 'DESC']],
        defaultLimit: 10,
        maxLimit: 100,
        relations: ['employer', 'company'], 
    }
}