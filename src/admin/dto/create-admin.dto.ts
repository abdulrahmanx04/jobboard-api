import { Expose, Type } from "class-transformer";
import { JobLevel, JobStatus, JobType, ReviewStatus } from "src/common/enums/all-enums";

export class AdminUserResponseDto  {
    @Expose() id :string
    @Expose() name :string
    @Expose() email :string
    @Expose() role:string
    @Expose() isVerified:string
    @Expose() isActive:string
}

export class AdminEmployerDto {
    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    avatar: string;
}
export class AdminCompanyDto {
  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  website: string;
}

export class AdminJobResponseDto {
  @Expose()
  id: string;

  @Expose()
  employerId: string;

  @Expose()
  companyId: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  category?: string;

  @Expose()
  location?: string;

  @Expose()
  jobType: JobType;

  @Expose()
  jobLevel: JobLevel;

  @Expose()
  workplaceType: JobType;

  @Expose()
  status: JobStatus;

  @Expose()
  reviewStatus: ReviewStatus
  
  @Expose()
  reviewReason: string

  @Expose()
  department?: string;

  @Expose()
  salaryMin?: number;

  @Expose()
  salaryMax?: number;

  @Expose()
  currency?: string;

  @Expose()
  benefits?: string[];

  @Expose()
  experienceLevel?: string;

  @Expose()
  skillsRequired?: string[];

  @Expose()
  numberOfPositions: number;

  @Expose()
  slug: string;

  @Expose()
  featured: boolean;

  @Expose()
  applicationDeadline?: Date;

  @Expose()
  isActive: boolean;

  @Expose()
  isClosed: boolean;

  @Expose()
  viewCount: number;

  @Expose()
  applicationCount: number;

  @Expose()
  relocationAssistance?: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => AdminEmployerDto)
  employer: AdminEmployerDto;

  @Expose()
  @Type(() => AdminCompanyDto)
  company: AdminCompanyDto;
}