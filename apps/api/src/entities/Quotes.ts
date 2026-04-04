import { Entity, Index, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins';
import { QuoteCategories } from './QuoteCategories';

@Entity()
@Index({ name: 'idx_quote_content', properties: ['content'] })
export class Quotes {

  @PrimaryKey({ type: 'bigint' })
  id!: bigint;

  @ManyToOne({ entity: () => QuoteCategories, deleteRule: 'set null', nullable: true })
  category?: Rel<QuoteCategories>;

  @Property({ type: 'string', length: 200, nullable: true })
  title?: string;

  @ManyToOne({ entity: () => Admins, index: 'fk_quote_admin' })
  admin!: Rel<Admins>;

  @Property({ type: 'text', columnType: 'text' })
  content!: string;

  @Property({ type: 'string', length: 200, nullable: true })
  source?: string;

  @Property({ type: 'boolean' })
  isPublished: boolean & Opt = true;

  @Property({ type: 'boolean' })
  isFeatured: boolean & Opt = false;

  @OneToMany({ entity: () => QuoteTags, mappedBy: 'quote' })
  tags = new Collection<QuoteTags>(this);

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}

@Entity()
export class QuoteTags {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne({ entity: () => Quotes, deleteRule: 'cascade' })
  quote!: Rel<Quotes>;

  @Property({ type: 'string', length: 80 })
  tag!: string;
}