import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Length } from "class-validator";



export class CreateAuthDto {

    @Length(5,50)
    name: string

    @IsEmail()
    email: string

    @IsString()
    @Length(6,72)
    password: string
 
    @IsOptional()
    @IsString()
    phone?: string


    @IsOptional()
    @IsUrl()
    linkedinUrl?: string

    @IsOptional()
    @IsString()
    @Length(0,500)
    bio?: string
    
    @IsOptional()
    @IsString()
    @Length(2,80)
    location?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[]    


}

export class LoginDto {
    @IsEmail()
    email: string

    @IsNotEmpty()
    password: string
}
export class EmailDto {
    @IsEmail()
    email: string
}

export class PasswordDto {
    @IsString()
    @Length(6,72)
    password: string
}

export class ChangePasswordDto {
    @IsString()
    @Length(6,72)
    currentPassword: string

    @IsString()
    @Length(6,72)
    newPassword: string
}