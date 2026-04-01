import { Entity, Enum, Index, ManyToOne, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins';
import { Posts } from './Posts';

export enum ReactionType {
  Like = 'like',
  Love = 'love',
  Inspiring = 'inspiring',
  Pray = 'pray'
}

@Entity()
@Index({ name: 'idx_reaction_post', properties: ['post'] })
@Index({ name: 'idx_reaction_admin', properties: ['admin'] })
export class PostReactions {

  @PrimaryKey()
  id!: bigint;

  @ManyToOne({ entity: () => Posts, index: 'fk_reaction_post', deleteRule: 'cascade' })
  post!: Rel<Posts>;

  @ManyToOne({ entity: () => Admins, index: 'fk_reaction_admin' })
  admin!: Rel<Admins>;

  @Enum({ items: () => ReactionType })
  reactionType!: ReactionType;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

}