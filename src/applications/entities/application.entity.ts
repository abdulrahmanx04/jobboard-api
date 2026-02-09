import { User } from "../../auth/entities/auth.entity";
import { Job } from "../../jobs/entities/job.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { JoinColumn } from "typeorm";
import { ApplicationStatus } from "src/common/enums/all-enums";


@Entity('applications')
@Unique(['userId','jobId'])
@Index(['jobId'])
@Index(['userId'])
export class Application {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type: 'enum',enum: ApplicationStatus,default: ApplicationStatus.PENDING})
    status: ApplicationStatus

    @Column()
    userId: string

    @ManyToOne(() => User, user => user.applications,{onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user: User
    
    @Column()
    jobId: string

    @ManyToOne(() => Job, job => job.applications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'jobId' })
    job: Job

    @Column({ type: 'text', nullable: true })
    coverLetter: string

    @Column({ type: 'varchar', length: 50,nullable: true })
    source: string

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    expectedSalary: number

    @Column({ nullable: true })
    resumeUrl: string

    @Column({ nullable: true })
    resumePublicId: string

    @Column({ type: 'timestamp', nullable: true })
    reviewedAt: Date

    @Column({ type: 'text', nullable: true })
    rejectionReason: string

    @Column({type: 'varchar', length: 50, nullable: true})
    employerNote: string

    @Column({ type: 'timestamp', nullable: true })
    withdrawnAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @CreateDateColumn()
    appliedAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
