import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';

@Entity({
  name: 'points',
})
export class Point {
  @PrimaryGeneratedColumn()
  pointId: number;

  @Column({ type: 'number', nullable: false })
  userId: number;

  @Column({ type: 'number', nullable: false })
  point: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
