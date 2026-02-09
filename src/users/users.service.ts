import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserData } from '../common/interfaces/all.interfaces';
import { ProfileResponseDto, UpdateProfileDto } from './dto/profile-user.dto';
import bcrypt from 'bcrypt'
import { PasswordDto } from './../auth/dto/create-auth.dto';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User }from '../auth/entities/auth.entity'
import { plainToInstance } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepo:  Repository<User>,
    private cloudinaryService: CloudinaryService,
    private authService: AuthService
) {}

    async findOne(userData: UserData): Promise<ProfileResponseDto> {
        const user= await this.userRepo.findOneOrFail({
            where: {
                id: userData.id
            },
        })
        return plainToInstance(ProfileResponseDto,user,{excludeExtraneousValues: true})
    }

    async updateOne(dto: UpdateProfileDto, userData: UserData, files?: {avatar?: Express.Multer.File[], resumeUrl?: Express.Multer.File[]})
    {
      const user= await this.userRepo.findOneOrFail({where: {id: userData.id}})
      await this.uploadProfileFiles(user,files)
      
      await this.updateEmail(user,dto)
      
      this.updateUser(user,dto)

      await this.userRepo.save(user)

      return {
        message: user.pendingEmail ? 'Email sent to your mail' : 'Profile updated successfully',
        ...plainToInstance(ProfileResponseDto,user,{excludeExtraneousValues: true})
      }
    }

    async deleteOne(dto: PasswordDto,userData: UserData) {

        const user= await this.userRepo.findOneOrFail({where: {id: userData.id}})
        const isValid= await bcrypt.compare(dto.password,user.password)
        if(!isValid) {
            throw new BadRequestException('Incrorrect password')
        }

        if(user.avatarPublicId) {
            await this.cloudinaryService.deleteFile(user.avatarPublicId)
        }
          if(user.resumePublicId) {
            await this.cloudinaryService.deleteFile(user.resumePublicId)
        }

        await this. userRepo.delete({ id: userData.id })
        
        return 

    }

    private async uploadProfileFiles(user: User, files?: {avatar?: Express.Multer.File[], resume?: Express.Multer.File[]}) {
        const avatarFile= files?.avatar?.[0]
        const resumeFile= files?.resume?.[0]
        if(avatarFile) {
          const upload= await this.cloudinaryService.uploadFile(avatarFile,'avatar') as UploadApiResponse
          user.avatar= upload.secure_url
          user.avatarPublicId= upload.public_id
        }
        if(resumeFile) {
          const upload= await this.cloudinaryService.uploadFile(resumeFile,'avatar') as UploadApiResponse
          user.resumeUrl= upload.secure_url
          user.resumePublicId= upload.public_id
        }
      }

    private async updateEmail(user: User, dto: UpdateProfileDto) {
        if(!dto.email) return 
        const exists= await this.userRepo.findOneBy({email: dto.email})
        if(exists && exists.id !== user.id) {
          throw new BadRequestException('Email already used')
        }
        const {hashedToken,url}= this.authService.generateVerificationData('verify-email')
        user.verificationToken= hashedToken
        user.verificationExpiry= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        user.pendingEmail= dto.email
        await this.authService.sendEmailVerification('verification',user.pendingEmail,url)
        return 
      }

     private updateUser(user: User, dto: UpdateProfileDto) {
      Object.keys(dto).forEach((key) => {
        if(key !== 'email' && dto[key] !== undefined) {
          user[key]= dto[key]
        }
      })
     } 
   
     
}