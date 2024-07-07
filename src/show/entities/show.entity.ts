import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';
import { ShowCategory } from '../types/show.type';

@Entity({
  name: 'shows',
})
export class Show {
  @PrimaryGeneratedColumn()
  showId: number;

  @Column({ type: 'varchar', nullable: false })
  showName: string;

  @Column({ type: 'enum', enum: ShowCategory, nullable: false })
  showCategory: ShowCategory;

  @Column({ type: 'number', nullable: false })
  showPlace: number;

  @Column({ type: 'text', nullable: true })
  showDetail: string;

  @Column({ type: 'varchar', nullable: true })
  showImage: string;

  @Column({ type: 'array', nullable: false })
  showFee: number[];

  @Column({ type: 'array', nullable: false })
  showDate: string[];

  @Column({ type: 'varchar', nullable: false })
  startDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
