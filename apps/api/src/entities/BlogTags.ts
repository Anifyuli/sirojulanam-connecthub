import { Entity, ManyToOne, PrimaryKeyProp, Property, type Rel } from '@mikro-orm/core';
import { BlogPosts } from './BlogPosts';

@Entity()
export class BlogTags {

  [PrimaryKeyProp]?: ['post', 'tag'];

  @ManyToOne({ entity: () => BlogPosts, deleteRule: 'cascade', primary: true })
  post!: Rel<BlogPosts>;

  @Property({ type: 'string', length: 80, primary: true })
  tag!: string;

}
