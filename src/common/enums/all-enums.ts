
export enum UserRole {
    JOB_SEEKER= 'job_seeker',
    EMPLOYER= 'employer',
    ADMIN= 'admin'
}
export enum JobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERNSHIP = "internship",
  REMOTE = "remote",
}
export enum JobStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",
  ARCHIVED = "archived",
}
export enum WorkplaceType {
  ON_SITE = "on_site",
  REMOTE = "remote",
  HYBRID = "hybrid",
}
export enum JobLevel {
  ENTRY = "entry",
  MID = "mid",
  SENIOR = "senior",
  LEAD = "lead",
  EXECUTIVE = "executive",
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN= 'withdrawn'
}


export enum ReviewStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  TAKEN_DOWN= 'taken_down'
} 