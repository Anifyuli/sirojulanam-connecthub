import { Entity, Enum, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins.ts';
import { VideoCategories } from './VideoCategories.ts';
import { VideoTags } from './VideoTags.ts';

@Entity()
export class Videos {

  @PrimaryKey()
  id!: bigint;

  @ManyToOne({ entity: () => VideoCategories, deleteRule: 'set null', nullable: true, index: 'fk_video_category' })
  category?: Rel<VideoCategories>;

  @ManyToOne({ entity: () => Admins, index: 'fk_video_admin' })
  admin!: Rel<Admins>;

  @OneToMany({ entity: () => VideoTags, mappedBy: 'video' })
  tags = new Collection<VideoTags>(this);

  @Property({ length: 300 })
  title!: string;

  @Property({ length: 350, unique: 'slug' })
  slug!: string;

  @Property({ type: 'text', length: 65535, nullable: true })
  description?: string;

  @Enum({ items: () => VideosSourceType })
  sourceType!: VideosSourceType;

  @Property({ length: 500, nullable: true })
  sourceUrl?: string;

  @Property({ length: 50, nullable: true })
  platformVideoId?: string;

  @Property({ length: 500, nullable: true })
  localFileUrl?: string;

  @Property({ length: 500, nullable: true })
  thumbnailUrl?: string;

  @Property({ unsigned: true, nullable: true })
  durationSeconds?: number;

  @Property({ type: 'boolean' })
  isPublished: boolean & Opt = false;

  @Property({ type: 'boolean' })
  isFeatured: boolean & Opt = false;

  @Property({ columnType: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Property({ type: 'integer', unsigned: true })
  viewCount: number & Opt = 0;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}

export enum VideosSourceType {
  YOUTUBE = 'youtube',
  YOUTUBE_SHORTS = 'youtube_shorts',
  TIKTOK = 'tiktok',
  LOCAL = 'local',
}
