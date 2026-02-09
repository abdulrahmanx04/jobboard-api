import { Expose, Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";
import { ApplicationStatus } from "src/common/enums/all-enums";

export class CreateApplicationDto {
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    coverLetter?: string   
    
    @IsOptional()
    @IsString()
    @MaxLength(50)
    source?: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    expectedSalary?: number
}
export class ApplicationJobDto {
    @Expose()
    id: string  
    
    @Expose()
    title: string

    @Expose()
    description: string

    @Expose()
    category: string

    @Expose()
    jobLevel: string


}
export class ApplicationUserDto {
    @Expose()
    name: string

    @Expose()
    email: string

    @Expose()
    avatar: string

    
}
export class ApplicationResponseDto {
    @Expose()
    id: string

    @Expose()
    jobId: string

    @Expose()
    status: ApplicationStatus
    
    @Expose()
    employerNote?: string
    
    @Expose()
    appliedAt: Date

    @Expose()
    @Type(() => ApplicationJobDto)
    job?: ApplicationJobDto


    @Expose()
    @Type(() => ApplicationUserDto)
    user: ApplicationUserDto
}



