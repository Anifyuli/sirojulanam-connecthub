import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
@Unique({ properties: ['date', 'city'] })
export class PrayerTimes {

  @PrimaryKey()
  id!: number;

  @Property({ type: 'string' })
  date!: string;

  @Property({ type: 'string' })
  shortDate!: string;

  @Property({ type: 'date' })
  longDate!: Date;

  @Property({ type: 'string' })
  day!: string;

  @Property({ type: 'string' })
  city!: string;

  @Property({ type: 'string' })
  province!: string;

  @Property({ type: 'time' })
  imsak!: string;

  @Property({ type: 'time' })
  fajr!: string;

  @Property({ type: 'time' })
  sunrise!: string;

  @Property({ type: 'time' })
  dhuha!: string;

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

  @Property({ columnType: 'timestamp', nullable: true })
  updatedAt?: Date;

}
