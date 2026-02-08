import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsBoolean, IsEnum,IsNotEmpty } from 'class-validator';
import { JobStatus } from 'src/common/enums/all-enums';
export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class UpdateJobStatusDto {
    @IsNotEmpty()
    @IsEnum(JobStatus)
    status?: JobStatus
}


export class UpdateJobCloseDto {
    @IsNotEmpty()
    @IsBoolean()
    isClosed: boolean
}