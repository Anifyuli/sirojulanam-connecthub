import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, type Rel } from '@mikro-orm/core';
import { Videos } from './Videos.ts';

@Entity()
export class VideoTags {

  [PrimaryKeyProp]?: ['video', 'tag'];

  @ManyToOne({ entity: () => Videos, deleteRule: 'cascade', primary: true })
  video!: Rel<Videos>;

  @PrimaryKey({ length: 80 })
  tag!: string;

}
