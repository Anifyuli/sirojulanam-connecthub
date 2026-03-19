import { Entity, Enum, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins.ts';
import { EventCategories } from './EventCategories.ts'
import { EventTags } from './EventTags.ts';

@Entity()
export class Events {

  @PrimaryKey()
  id!: bigint;

  @ManyToOne({ entity: () => EventCategories, deleteRule: 'set null', nullable: true, index: 'fk_event_category' })
  category?: Rel<EventCategories>;

  @ManyToOne({ entity: () => Admins, index: 'fk_event_admin' })
  admin!: Rel<Admins>;

  @OneToMany({ entity: () => EventTags, mappedBy: 'event' })
  tags = new Collection<EventTags>(this);

  @Property({ length: 300 })
  title!: string;

  @Property({ length: 350, unique: 'slug' })
  slug!: string;

  @Property({ columnType: 'longtext', nullable: true, ignoreSchemaChanges: ['type'] })
  descriptionMd?: unknown;

  @Property({ length: 200, nullable: true })
  locationName?: string;

  @Property({ type: 'text', length: 65535, nullable: true })
  locationDetail?: string;

  @Property()
  startDatetime!: Date;

  @Property({ nullable: true })
  endDatetime?: Date;

  @Property({ type: 'boolean' })
  isAllDay: boolean & Opt = false;

  @Enum({ items: () => EventsStatus })
  status: EventsStatus & Opt = EventsStatus.DRAFT;

  @Property({ length: 500, nullable: true })
  coverImageUrl?: string;

  @Property({ type: 'boolean' })
  isFree: boolean & Opt = true;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}

export enum EventsStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}
