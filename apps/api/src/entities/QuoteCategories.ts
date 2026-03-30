import { Entity, ManyToOne, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins.ts';

@Entity()
export class QuoteCategories {

  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  name!: string;

  @Property({ length: 120, unique: true })
  slug!: string;

  @Property({ length: 7, nullable: true })
  colorHex?: string;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

}