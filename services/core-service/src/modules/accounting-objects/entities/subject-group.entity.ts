import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('subject_group')
@Index(['tenantId', 'code'], { unique: true })
export class SubjectGroup extends BaseEntity {
  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'both' })
  type: 'customer' | 'vendor' | 'both';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;
}
