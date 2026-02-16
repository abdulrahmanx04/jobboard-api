import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ChangePasswordDto, CreateAuthDto, EmailDto, LoginDto,  PasswordDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { UserRole } from 'src/common/enums/all-enums';
import { MoreThan, Repository } from 'typeorm';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { emailType, sendEmail } from 'src/common/utils/email';
import { JwtService } from '@nestjs/jwt';
import {  UserData  } from 'src/common/interfaces/all.interfaces';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>) {}
    
  async create(dto: CreateAuthDto) {
    const userExists=await this.userRegistered(dto.email)

    if(userExists){
      throw new ConflictException('Email already used')
    }
    
    const {hashedToken,url}= this. generateVerificationData('verify-email')

    const user= this.registerUser(dto,hashedToken)
   
    await this.userRepo.save(user)
    //await this.sendEmailVerification('verification',user.email,url)
   
    return {message: 'Email created successfully, please verify your email'}
  }

  async verifyEmail(token: string) {
      const  hashedToken= crypto.createHash('sha256').update(token).digest('hex')
      const userExists= await this.userRepo.findOneOrFail({where: {
        verificationToken: hashedToken,
        verificationExpiry: MoreThan(new Date())
      }})
      this.verifyPendingEmail(userExists)

      userExists.isVerified= true
      userExists.verificationToken= null
      userExists.verificationExpiry= null

      await this.userRepo.save(userExists);

      return { message: 'Email verified successfully' }

  }

  async resendVerification(dto: EmailDto) {
    const user= await this.userRepo.findOneOrFail({where: {email: dto.email,isVerified: false}})
    const {hashedToken,url}= this.generateVerificationData('verify-email')

    user.verificationToken=hashedToken
    user.verificationExpiry=new Date(Date.now() + 7 * 24 * 60 * 60 *1000)

    await this.userRepo.save(user!)
    await this.sendEmailVerification('verification',user!.email,url)
    return { message: 'Email verification sent successfully' }
  }

  async login(dto : LoginDto) {
    const user= await this.userRegistered(dto.email)
    if(!user) throw new BadRequestException('Email or password are incorrect')
    const validatedUser = await this.checkUserData(user,dto)
    const token= this.generateToken(validatedUser)
    return {token}
  }

  async changePassword(dto: ChangePasswordDto, userData:  UserData ) {
    const user= await this.userRepo.findOneOrFail({where: {id: userData.id}})
    await this.changePass(user,dto)
    return 
  }

  async forgotPassword(dto: EmailDto) {
    const user= await this.userRegistered(dto.email)
    if(!user) return { message: 'If the email exists, a reset password link has been sent.' }

    const {url,hashedToken} = this.generateVerificationData('reset-password')
    user.resetPasswordToken= hashedToken
    user.resetPasswordExpiry= new Date(Date.now() +15 * 60 * 1000)


    await this.userRepo.save(user)
    await this.sendEmailVerification('reset',user.email,url)
    return { message: 'If the email exists, a reset password link has been sent.' }

  }

  async resetPassword(token: string, dto:  PasswordDto) {
      const  hashedToken= crypto.createHash('sha256').update(token).digest('hex')
      const userExists= await this.userRepo.findOneOrFail({where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: MoreThan(new Date())
      }})
      userExists.resetPasswordToken= null
      userExists.resetPasswordExpiry= null
      userExists.password= dto.password

      await this.userRepo.save(userExists);

      return { message: 'Password reset successfully, please login with your new password' }
  }
 


  private async changePass(user: User, dto: ChangePasswordDto) {
     const comparePass= await bcrypt.compare(dto.currentPassword,user.password)

      if(!comparePass) {
            throw new BadRequestException('Current password is incorrect')
      }
      if(dto.currentPassword === dto.newPassword) {
        throw new BadRequestException('Current password and new password cannot be the same')
      }
      const hashedPassword= await bcrypt.hash(dto.newPassword,10)
      user.password= hashedPassword
      await this.userRepo.save(user)
      return 
  }
  generateVerificationData(type: string) {
      const token= crypto.randomBytes(32).toString('hex')
      const hashedToken= crypto.createHash('sha256').update(token).digest('hex')
      const url= `${process.env.FRONTEND_URL}/auth/${type}/${token}`
      return {token,hashedToken,url}
  }
  private registerUser(dto: CreateAuthDto, hashedToken: string) {
    return this.userRepo.create({
      ...dto,
      verificationToken: hashedToken,
      verificationExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      role: UserRole.EMPLOYER,
    })
  }
  private generateToken(user: User) {
      const token= this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role
      })
      return token
  }

  async sendEmailVerification(type: emailType,to: string,url: string) {
    try {
    await sendEmail(type,to,url)
    }catch(err){
      throw new InternalServerErrorException('Sending email verification failed')
    }
  }

  private async userRegistered(email: string) {
    const user= await this.userRepo.findOne({where: {email}})
    return user
  }

  private async checkUserData(user: User | null , dto: LoginDto) {
    if(!user) {
      throw new BadRequestException('Email or password are incorrect');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new BadRequestException('Email or password are incorrect');

    // if(!user.isVerified) {
    //   throw new ForbiddenException('Please verify your email first');
    // }
    return user
  }

  private verifyPendingEmail(user: User) {
    if(!user.pendingEmail) return 
    user.email= user.pendingEmail
    user.pendingEmail= null
  }
  
}
