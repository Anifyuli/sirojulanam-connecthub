import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Roles {

  @PrimaryKey({ type: 'tinyint' })
  id!: number;

  @Property({ type: 'string', length: 30, unique: 'name' })
  name!: string;

}
