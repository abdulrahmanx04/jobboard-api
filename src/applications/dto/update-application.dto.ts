import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { IsNotEmpty,IsEnum, IsString } from 'class-validator';
import { ApplicationStatus } from 'src/common/enums/all-enums';
export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}

export class UpdateAppStatusDto {
    @IsNotEmpty()
    @IsEnum(ApplicationStatus)
    status: ApplicationStatus
}


export class UpdateAppEmpNote {
    @IsNotEmpty()
    @IsString()
    note: string
}

