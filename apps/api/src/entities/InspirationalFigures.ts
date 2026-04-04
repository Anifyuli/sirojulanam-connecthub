import { Entity, Index, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins';

@Entity()
@Index({ name: 'idx_figure_name', properties: ['name'] })
export class InspirationalFigures {

  @PrimaryKey({ type: 'bigint' })
  id!: bigint;

  @ManyToOne({ entity: () => Admins, index: 'fk_figure_admin' })
  admin!: Rel<Admins>;

  @Property({ type: 'string', length: 150 })
  name!: string;

  @Property({ type: 'string', length: 100, nullable: true })
  title?: string;

  @Property({ type: 'text', columnType: 'text', nullable: true })
  bio?: string;

  @Property({ type: 'string', length: 500, nullable: true })
  imageUrl?: string;

  @Property({ type: 'string', length: 10, nullable: true })
  birthYear?: string;

  @Property({ type: 'string', length: 10, nullable: true })
  deathYear?: string;

  @Property({ type: 'boolean' })
  isPublished: boolean & Opt = true;

  @Property({ type: 'boolean' })
  isFeatured: boolean & Opt = false;

  @OneToMany({ entity: () => FigureTags, mappedBy: 'figure' })
  tags = new Collection<FigureTags>(this);

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ type: 'date', columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}

@Entity()
export class FigureTags {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne({ entity: () => InspirationalFigures, deleteRule: 'cascade' })
  figure!: Rel<InspirationalFigures>;

  @Property({ type: 'string', length: 80 })
  tag!: string;
}