import { Entity, ManyToOne, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins';

@Entity()
export class RefreshTokens {

  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne({ entity: () => Admins })
  admin!: Rel<Admins>;

  @Property({ type: 'string', length: 255, unique: 'token' })
  token!: string;

  @Property({ type: 'date', columnType: 'timestamp' })
  expiresAt!: Date;

  @Property({ type: 'date', columnType: 'timestamp', defaultRaw: `current_timestamp()` })
  createdAt!: Date;

  @Property({ type: 'boolean', default: true })
  isRevoked!: boolean;

}
