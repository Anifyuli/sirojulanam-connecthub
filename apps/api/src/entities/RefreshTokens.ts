import { Entity, ManyToOne, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins.ts';

@Entity()
export class RefreshTokens {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => Admins })
  admin!: Rel<Admins>;

  @Property({ length: 255, unique: 'token' })
  token!: string;

  @Property({ columnType: 'timestamp' })
  expiresAt!: Date;

  @Property({ columnType: 'timestamp', defaultRaw: `current_timestamp()` })
  createdAt!: Date;

  @Property({ type: 'boolean', default: true })
  isRevoked!: boolean;

}
