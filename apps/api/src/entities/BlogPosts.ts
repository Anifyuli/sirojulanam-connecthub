import { Entity, Index, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins';
import { BlogCategories } from './BlogCategories';
import { BlogTags } from './BlogTags';

@Entity()
@Index({ name: 'idx_post_title', properties: ['title'] })
@Index({ name: 'idx_post_slug', properties: ['slug'] })
export class BlogPosts {

  @PrimaryKey()
  id!: bigint;

  @ManyToOne({ entity: () => BlogCategories, deleteRule: 'set null', nullable: true, index: 'fk_post_category' })
  category?: Rel<BlogCategories>;

  @ManyToOne({ entity: () => Admins, index: 'fk_post_admin' })
  admin!: Rel<Admins>;

  @OneToMany({ entity: () => BlogTags, mappedBy: 'post' })
  tags = new Collection<BlogTags>(this);

  @Property({ length: 300 })
  title!: string;

  @Property({ length: 350, unique: 'slug' })
  slug!: string;

  @Property({ length: 500, nullable: true })
  excerpt?: string;

  @Property({ columnType: 'longtext', ignoreSchemaChanges: ['type'] })
  contentMd!: unknown;

  @Property({ length: 500, nullable: true })
  coverImageUrl?: string;

  @Property({ type: 'boolean' })
  isPublished: boolean & Opt = false;

  @Property({ type: 'boolean' })
  isFeatured: boolean & Opt = false;

  @Property({ columnType: 'timestamp', nullable: true })
  publishedAt?: Date | null;

  @Property({ type: 'integer', unsigned: true })
  viewCount: number & Opt = 0;

  @Property({ length: 300, nullable: true })
  metaTitle?: string;

  @Property({ length: 500, nullable: true })
  metaDescription?: string;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}
