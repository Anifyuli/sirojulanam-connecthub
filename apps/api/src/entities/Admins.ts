import { Entity, ManyToOne, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Roles } from './Roles';

@Entity()
export class Admins {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => Roles, index: 'fk_admin_role' })
  role!: Rel<Roles>;

  @Property({ length: 100 })
  name!: string;

  @Property({ length: 50, unique: 'username' })
  username!: string;

  @Property({ length: 150, unique: 'email' })
  email!: string;

  @Property()
  passwordHash!: string;

  @Property({ type: 'boolean' })
  isActive: boolean & Opt = true;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}
