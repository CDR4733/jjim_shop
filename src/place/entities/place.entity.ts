import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';

@Entity({
  name: 'places',
})
export class Place {
  @PrimaryGeneratedColumn()
  placeId: number;

  @Column({ type: 'varchar', nullable: false })
  placeName: string;

  @Column({ type: 'varchar', nullable: true })
  placeImage: string;

  @Column({ type: 'varchar', nullable: false })
  placeAddress: string;

  @Column({ type: 'array', nullable: false })
  placeSeatSection: string[];

  @Column({ type: 'array', nullable: false })
  placeSeatNumber: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
