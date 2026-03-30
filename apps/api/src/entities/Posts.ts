import { Entity, Index, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel, Enum, Cascade } from '@mikro-orm/core';
import { Admins } from './Admins.ts';
import { Quotes } from './Quotes.ts';
import { InspirationalFigures } from './InspirationalFigures.ts';
import { PostReactions } from './PostReactions.ts';
import { PostTags } from './PostTags.ts';

export enum PostType {
  Opinion = 'opinion',
  QuoteOfDay = 'quote_of_day',
  FigureSpotlight = 'figure_spotlight'
}

@Entity()
@Index({ name: 'idx_post_type', properties: ['type'] })
@Index({ name: 'idx_post_created', properties: ['createdAt'] })
export class Posts {

  @PrimaryKey()
  id!: bigint;

  @ManyToOne({ entity: () => Admins, index: 'fk_post_admin' })
  admin!: Rel<Admins>;

  @Enum({ items: () => PostType, default: PostType.Opinion })
  type: PostType & Opt = PostType.Opinion;

  @Property({ columnType: 'varchar(300)' })
  title!: string;

  @Property({ columnType: 'text' })
  content!: string;

  @ManyToOne({ entity: () => Quotes, deleteRule: 'set null', nullable: true })
  quote?: Rel<Quotes>;

  @ManyToOne({ entity: () => InspirationalFigures, deleteRule: 'set null', nullable: true })
  figure?: Rel<InspirationalFigures>;

  @Property({ type: 'boolean' })
  isPublished: boolean & Opt = true;

  @Property({ type: 'integer', unsigned: true })
  viewCount: number & Opt = 0;

  @OneToMany({ entity: () => PostReactions, mappedBy: 'post' })
  reactions = new Collection<PostReactions>(this);

  @OneToMany({ entity: () => PostTags, mappedBy: 'post', cascade: [Cascade.ALL] })
  tags = new Collection<PostTags>(this);

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}