import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, type Rel } from '@mikro-orm/core';
import { BlogPosts } from './BlogPosts.js';

@Entity()
export class BlogTags {

  [PrimaryKeyProp]?: ['post', 'tag'];

  @ManyToOne({ entity: () => BlogPosts, deleteRule: 'cascade', primary: true })
  post!: Rel<BlogPosts>;

  @PrimaryKey({ length: 80 })
  tag!: string;

}
