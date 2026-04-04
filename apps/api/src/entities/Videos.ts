import { Entity, Enum, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins';
import { VideoCategories } from './VideoCategories';
import { VideoTags } from './VideoTags';

@Entity()
export class Videos {

  @PrimaryKey({ type: 'bigint' })
  id!: bigint;

  @ManyToOne({ entity: () => VideoCategories, deleteRule: 'set null', nullable: true, index: 'fk_video_category' })
  category?: Rel<VideoCategories>;

  @ManyToOne({ entity: () => Admins, index: 'fk_video_admin' })
  admin!: Rel<Admins>;

  @OneToMany({ entity: () => VideoTags, mappedBy: 'video' })
  tags = new Collection<VideoTags>(this);

  @Property({ type: 'string', length: 300 })
  title!: string;

  @Property({ type: 'string', length: 350, unique: 'slug' })
  slug!: string;

  @Property({ type: 'text', length: 65535, nullable: true })
  description?: string;

  @Enum({ items: () => VideosSourceType })
  sourceType!: VideosSourceType;

  @Property({ type: 'string', length: 500, nullable: true })
  sourceUrl?: string;

  @Property({ type: 'string', length: 50, nullable: true })
  platformVideoId?: string;

  @Property({ type: 'string', length: 500, nullable: true })
  localFileUrl?: string;

  @Property({ type: 'string', length: 500, nullable: true })
  thumbnailUrl?: string;

  @Property({ type: 'integer', unsigned: true, nullable: true })
  durationSeconds?: number;

  @Property({ type: 'boolean' })
  isPublished: boolean & Opt = false;

  @Property({ type: 'boolean' })
  isFeatured: boolean & Opt = false;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Property({ type: 'integer', unsigned: true })
  viewCount: number & Opt = 0;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}

export enum VideosSourceType {
  YOUTUBE = 'youtube',
  YOUTUBE_SHORTS = 'youtube_shorts',
  TIKTOK = 'tiktok',
  LOCAL = 'local',
}
