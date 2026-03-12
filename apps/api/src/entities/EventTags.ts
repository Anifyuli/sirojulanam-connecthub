import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, type Rel } from '@mikro-orm/core';
import { Events } from './Events.js';

@Entity()
export class EventTags {

  [PrimaryKeyProp]?: ['event', 'tag'];

  @ManyToOne({ entity: () => Events, deleteRule: 'cascade', primary: true })
  event!: Rel<Events>;

  @PrimaryKey({ length: 80 })
  tag!: string;

}
