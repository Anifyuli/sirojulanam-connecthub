import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

export enum JumatSchedulesPasaran {
  PON = 'pon',
  WAGE = 'wage',
  KLIWON = 'kliwon',
  LEGI = 'legi',
  PAHING = 'pahing',
}

@Entity()
export class JumatSchedules {

  @PrimaryKey({ type: 'enum' })
  pasaran!: JumatSchedulesPasaran;

  @Property({ length: 150 })
  imam!: string;

  @Property({ length: 150 })
  khotib!: string;

  @Property({ length: 150 })
  bilal!: string;
}
