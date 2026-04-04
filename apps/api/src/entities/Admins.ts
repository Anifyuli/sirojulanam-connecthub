import { Entity, ManyToOne, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Roles } from './Roles';

@Entity()
export class Admins {

  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne({ entity: () => Roles, index: 'fk_admin_role' })
  role!: Rel<Roles>;

  @Property({ type: 'string', length: 100 })
  name!: string;

  @Property({ type: 'string', length: 50, unique: 'username' })
  username!: string;

  @Property({ type: 'string', length: 150, unique: 'email' })
  email!: string;

  @Property({ type: 'string' })
  passwordHash!: string;

  @Property({ type: 'boolean' })
  isActive: boolean & Opt = true;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}
