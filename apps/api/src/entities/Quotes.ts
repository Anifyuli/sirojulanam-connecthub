import { Entity, Index, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins.ts';
import { QuoteCategories } from './QuoteCategories.ts';

@Entity()
@Index({ name: 'idx_quote_content', properties: ['content'] })
export class Quotes {

  @PrimaryKey()
  id!: bigint;

  @ManyToOne({ entity: () => QuoteCategories, deleteRule: 'set null', nullable: true })
  category?: Rel<QuoteCategories>;

  @Property({ length: 200, nullable: true })
  title?: string;

  @ManyToOne({ entity: () => Admins, index: 'fk_quote_admin' })
  admin!: Rel<Admins>;

  @Property({ columnType: 'text' })
  content!: string;

  @Property({ length: 200, nullable: true })
  source?: string;

  @Property({ type: 'boolean' })
  isPublished: boolean & Opt = true;

  @Property({ type: 'boolean' })
  isFeatured: boolean & Opt = false;

  @OneToMany({ entity: () => QuoteTags, mappedBy: 'quote' })
  tags = new Collection<QuoteTags>(this);

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}

@Entity()
export class QuoteTags {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => Quotes, deleteRule: 'cascade' })
  quote!: Rel<Quotes>;

  @Property({ length: 80 })
  tag!: string;
}