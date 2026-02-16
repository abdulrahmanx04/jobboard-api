import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ReviewStatus, UserRole } from 'src/common/enums/all-enums';

export class AdminActiveUserDto  {
    @IsOptional()
    @IsBoolean()
    isActive: boolean

    @IsOptional()
    @IsBoolean()
    isVerified: boolean
}


export class AdminUserRoleDto  {
    @IsOptional()
    @IsEnum(UserRole)
    role: UserRole

}



export class ReviewJobDto {
    @IsNotEmpty()
    @MaxLength(500)
    reviewReason: string
}

