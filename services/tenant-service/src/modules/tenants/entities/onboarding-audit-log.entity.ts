import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum OnboardingAction {
  STARTED = 'started',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  ABANDONED = 'abandoned',
}

@Entity('onboarding_audit_logs')
export class OnboardingAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ length: 50 })
  stepName: string;

  @Column({
    type: 'enum',
    enum: OnboardingAction,
  })
  action: OnboardingAction;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
