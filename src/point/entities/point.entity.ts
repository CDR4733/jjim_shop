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

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  point: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
