import { Entity, ManyToOne, PrimaryKey, Property, type Rel, Index } from '@mikro-orm/core';
import { Posts } from './Posts';

@Entity()
@Index({ name: 'idx_post_tags_tag', properties: ['tag'] })
export class PostTags {
  @ManyToOne({ entity: () => Posts, primary: true })
  post!: Rel<Posts>;

  @Property({ columnType: 'varchar(80)', primary: true })
  tag!: string;

  constructor(tag?: string) {
    if (tag) {
      this.tag = tag;
    }
  }
}
