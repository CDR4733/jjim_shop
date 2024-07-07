import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';

@Entity({
  name: 'reservations',
})
export class Reservation {
  @PrimaryGeneratedColumn()
  reservationId: number;

  @Column({ type: 'number', nullable: false })
  userId: number;

  @Column({ type: 'number', nullable: false })
  placeId: number;

  @Column({ type: 'number', nullable: false })
  showId: number;

  @Column({ type: 'varchar', nullable: false })
  showName: string;

  @Column({ type: 'number', nullable: false })
  showFee: number;

  @Column({ type: 'varchar', nullable: false })
  showDate: string;

  @Column({ type: 'varchar', nullable: false })
  seatSection: string;

  @Column({ type: 'number', nullable: false })
  seatNumber: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
