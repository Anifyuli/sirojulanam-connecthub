import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class BlogCategories {

  @PrimaryKey({ type: 'smallint' })
  id!: number;

  @Property({ type: 'string', length: 100 })
  name!: string;

  @Property({ type: 'string', length: 120, unique: 'slug' })
  slug!: string;

  @Property({ type: 'character', length: 7, nullable: true })
  colorHex?: string;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

}
