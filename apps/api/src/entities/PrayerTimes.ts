import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
@Unique({ properties: ['date', 'city'] })
export class PrayerTimes {

  @PrimaryKey({ type: 'number' })
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

  @Property({ type: 'string', length: 8 })
  imsak!: string;

  @Property({ type: 'string', length: 8 })
  fajr!: string;

  @Property({ type: 'string', length: 8 })
  sunrise!: string;

  @Property({ type: 'string', length: 8 })
  dhuha!: string;

  @Property({ type: 'string', length: 8 })
  dhuhr!: string;

  @Property({ type: 'string', length: 8 })
  asr!: string;

  @Property({ type: 'string', length: 8 })
  maghrib!: string;

  @Property({ type: 'string', length: 8 })
  isha!: string;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true })
  updatedAt?: Date;

}
