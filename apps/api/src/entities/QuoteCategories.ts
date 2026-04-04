import { Entity, ManyToOne, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins';

@Entity()
export class QuoteCategories {

  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string', length: 100 })
  name!: string;

  @Property({ type: 'string', length: 120, unique: true })
  slug!: string;

  @Property({ type: 'string', length: 7, nullable: true })
  colorHex?: string;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

}