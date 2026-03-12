import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class VideoCategories {

  @PrimaryKey({ type: 'smallint' })
  id!: number;

  @Property({ length: 100 })
  name!: string;

  @Property({ length: 120, unique: 'slug' })
  slug!: string;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

}
