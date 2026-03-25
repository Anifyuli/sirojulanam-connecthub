import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

export enum PrayTime {
  FAJR = 'fajr',
  DHUHR = 'dhuhr',
  ASR = 'asr',
  MAGHRIB = 'maghrib',
  ISHA = 'isha',
}

@Entity()
export class DailyPrayerSchedule {

  @PrimaryKey({ type: 'enum' })
  prayTime!: PrayTime;

  @Property({ length: 150 })
  imam!: string;

}
