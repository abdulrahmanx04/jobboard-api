import { Application } from "src/applications/entities/application.entity";
import { User } from "src/auth/entities/auth.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JobLevel, JobStatus,JobType,ReviewStatus,WorkplaceType } from "src/common/enums/all-enums";
import { Company } from "src/companies/entities/company.entity";


@Entity('jobs')
@Index(['isActive','createdAt'])
@Index(['jobType'])
@Index(['location'])
@Index(['category'])
@Index(['jobLevel'])
@Index(['workplaceType'])
@Index(['status', 'reviewStatus'])
@Index(['status'])
@Index(['featured'])
@Index(['slug'])
@Index(['department'])
@Index(['companyId'])
export class Job {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    employerId: string

    @ManyToOne(() => User, user => user.jobs, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'employerId'})
    employer: User

    @Column({ length: 100 })
    title: string

    @Column({ type: "text" })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    currency: string

    @Column('text',{array: true, nullable: true })
    benefits: string[]

    @Column({ type: 'varchar',nullable: true })
    location: string

    @Column({
        type: 'enum',
         enum: JobStatus,
         default : JobStatus.DRAFT
        })
    status: JobStatus

    @Column({
        type: 'enum',
        enum: ReviewStatus,
        default: ReviewStatus.PENDING
    })
    reviewStatus: ReviewStatus

    @Column({type :'varchar', nullable: true})
    reviewReason: string | null


    @Column({
        type: "enum",
        enum: JobType,
        default: JobType.FULL_TIME,
    })
    jobType: JobType

    @Column({
        type: 'enum',
        enum: JobLevel,
    })
    jobLevel: JobLevel

    @Column({
         type: 'enum',
         enum: WorkplaceType, 
         default: WorkplaceType.HYBRID })
    workplaceType: WorkplaceType;

    @Column({ type: 'int',nullable: true })
    salaryMin: number

    @Column({ type: 'int',nullable: true })
    salaryMax: number

    @Column({ nullable: true })
    experienceLevel: string

    @Column('text', {array: true,nullable: true })
    skillsRequired: string[]

    @Column({ nullable: true })
    department: string

    @Column({ nullable: true })
    applicationDeadline: Date

    @Column({ type: 'int', default: 1 })
    numberOfPositions: number

    @Column({ nullable: true })
    slug: string

    @Column({ default: false })
    featured: boolean

    @Column({ default: 0 })
    viewCount: number

    @Column({ default: 0 })
    applicationCount: number

    @Column({ nullable: true })
    relocationAssistance: boolean
   
    @Column({ default: true })
    isActive: boolean

    @Column({ default: false })
    isClosed: boolean

    @OneToMany(() => Application, app => app.job)
    applications: Application[]

    @Column({nullable: true})
    companyId: string

    @ManyToOne(() => Company, c => c.jobs,{nullable: true})
    @JoinColumn({name: 'companyId'})
    company: Company

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}   
