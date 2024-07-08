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

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  placeId: number;

  @Column({ type: 'int', nullable: false })
  showId: number;

  @Column({ type: 'varchar', nullable: false })
  showName: string;

  @Column({ type: 'int', nullable: false })
  showFee: number;

  @Column({ type: 'varchar', nullable: false })
  showDate: string;

  @Column({ type: 'varchar', nullable: false })
  seatSection: string;

  @Column({ type: 'int', nullable: false })
  seatNumber: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
