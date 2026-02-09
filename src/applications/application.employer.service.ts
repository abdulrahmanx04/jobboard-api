import { InjectRepository } from "@nestjs/typeorm";
import { Application } from "./entities/application.entity";
import { Repository } from "typeorm";
import { ApplicationResponseDto } from "./dto/create-application.dto";
import { plainToInstance } from "class-transformer";
import { FilterOperator, PaginateQuery, paginate } from "nestjs-paginate";
import { UserData } from "src/common/interfaces/all.interfaces";
import { Job } from "src/jobs/entities/job.entity";
import { UpdateAppStatusDto,UpdateAppEmpNote } from "./dto/update-application.dto";



export class ApplicationEmployerService {
    constructor(@InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,){}
    async findByJob(jobId: string,query: PaginateQuery, userData: UserData) {
        const applications= await this.getJobApp(query,jobId,userData)
        const data= plainToInstance(ApplicationResponseDto, applications.data, {excludeExtraneousValues: true})
        return {
          ...applications,
          data
        }
      }
      
      async findOneByJob(jobId: string,applicationId: string,userData: UserData) {
        const applications= await this.appRepo.findOneOrFail({where: {
          id: applicationId,
          job: {
          id: jobId,
          employerId: userData.id
        }},relations: ['job','user']})
       return plainToInstance(ApplicationResponseDto, applications, {excludeExtraneousValues: true})
        
      }
    
      async getJobStats(jobId: string, userData: UserData) {
       
          await this.jobRepo.findOneOrFail({
            where: { id: jobId, employerId: userData.id },
          })
    
          const rows= await this.appRepo
            .createQueryBuilder('application')
            .select('application.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('application.jobId= :jobId', {jobId})
            .groupBy('status')
            .getRawMany()
    
             const stats: Record<string, number> = {
                total: 0
              }
            for (const row of rows) {
              const count = Number(row.count)
              stats[row.status] = count
              stats.total += count
            }
          return stats
      }
      async updateAppStatus(jobId: string,applicationId: string, dto: UpdateAppStatusDto,userData: UserData){
        const application= await this.appRepo.findOneOrFail({where: {
          id: applicationId,
          job: {
            id: jobId,
            employerId: userData.id
          }
        },relations: ['job','user']})
        application.status= dto.status
        await this.appRepo.save(application)
        return plainToInstance(ApplicationResponseDto, application, {excludeExtraneousValues: true})
      }
      
      async updateAppNote(jobId: string,applicationId: string, dto: UpdateAppEmpNote,userData: UserData) {
        const application= await this.appRepo.findOneOrFail({where: {
          id: applicationId,
          job: {
            id: jobId,
            employerId: userData.id
          }
        },relations: ['job','user']})
        application.employerNote= dto.note
        await this.appRepo.save(application)
        return plainToInstance(ApplicationResponseDto, application, {excludeExtraneousValues: true})
      }

      async getJobApp(query: PaginateQuery, jobId: string,userData: UserData){
        return await paginate(query,this.appRepo,{
            sortableColumns: ['appliedAt','status','reviewedAt'],
            searchableColumns: ['source', 'status', 'user.name', 'user.email','job.title','job.description'],
            filterableColumns: {
                status: [FilterOperator.IN],
                appliedAt: [FilterOperator.GTE, FilterOperator.LTE],
                reviewedAt: [FilterOperator.GTE, FilterOperator.LTE],
            },
            defaultSortBy: [['appliedAt','DESC']],
            defaultLimit: 10,
            maxLimit: 100,
            where: {
                job: {
                id: jobId,
                employerId: userData.id
            }},
            relations: ['job', 'user','job.company']
            })
        }
    
}   