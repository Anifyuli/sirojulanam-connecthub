import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class PrayerTimes {

  @PrimaryKey()
  id!: number;

  @Property({ type: 'date', unique: 'uq_prayer_date' })
  date!: string;

  @Property({ type: 'time' })
  imsak!: string;

  @Property({ type: 'time' })
  fajr!: string;

  @Property({ type: 'time' })
  sunrise!: string;

  @Property({ type: 'time' })
  dhuhr!: string;

  @Property({ type: 'time' })
  asr!: string;

  @Property({ type: 'time' })
  maghrib!: string;

  @Property({ type: 'time' })
  isha!: string;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

}
