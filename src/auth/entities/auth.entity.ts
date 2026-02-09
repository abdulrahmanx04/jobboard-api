import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import bcrypt from 'bcrypt'
import { Application } from "../../applications/entities/application.entity";
import { Job } from "../../jobs/entities/job.entity";
import { UserRole } from "src/common/enums/all-enums";
import { Company } from "src/companies/entities/company.entity";


@Entity('users')
@Index(['verificationToken','verificationExpiry'])
@Index(['isVerified'])
@Index(['companyId'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string
    
    @Column({length: 50})
    name: string
    
    @Column({unique: true})
    email: string

    @Column({type: 'varchar',unique: true, nullable: true})
    pendingEmail: string | null
    
    @Column()
    password: string
    @BeforeInsert()
    async hashPass() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    @Column({type :'varchar',nullable: true})
    verificationToken: string | null

    @Column({type :'timestamptz',nullable: true})
    verificationExpiry: Date | null

    @Column({type :'varchar',nullable: true})
    resetPasswordToken: string | null

    @Column({type :'timestamptz',nullable: true})
    resetPasswordExpiry: Date | null

    @Column({type: 'enum', enum: UserRole, default: UserRole.JOB_SEEKER})
    role: UserRole

    @Column({default: false})
    isVerified: boolean

    @Column({ default: true })
    isActive: boolean

    @Column({ type: 'varchar',nullable: true })
    phone: string  | null

    @Column({type: 'varchar', nullable: true })
    avatar: string | null

    @Column({type: 'varchar', nullable: true })
    avatarPublicId: string | null


    @Column({type: 'varchar',nullable : true})
    resumeUrl: string | null

    @Column({type: 'varchar',nullable : true})
    resumePublicId: string | null


    @Column({ type: 'varchar',nullable: true })
    linkedinUrl: string;

    @Column({ default: 0 })
    profileCompletion: number

    @Column({ type: 'varchar',nullable: true })
    location: string | null

    @Column({type: 'varchar', nullable: true })
    bio: string | null

    @Column('text',{array: true, nullable: true })
    skills: string[] | null
    

    @OneToMany(() => Application, app => app.user)
    applications: Application[]

    @OneToMany(() => Job, job => job.employer)
    jobs: Job[]

    @Column({nullable: true})
    companyId: string | null

    @ManyToOne(() => Company, c => c.employees, {nullable: true})
    @JoinColumn({name: 'companyId'})
    company: Company

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

}
