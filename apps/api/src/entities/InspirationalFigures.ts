import { Entity, Index, ManyToOne, OneToMany, Collection, type Opt, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import { Admins } from './Admins.ts';

@Entity()
@Index({ name: 'idx_figure_name', properties: ['name'] })
export class InspirationalFigures {

  @PrimaryKey()
  id!: bigint;

  @ManyToOne({ entity: () => Admins, index: 'fk_figure_admin' })
  admin!: Rel<Admins>;

  @Property({ length: 150 })
  name!: string;

  @Property({ length: 100, nullable: true })
  title?: string;

  @Property({ columnType: 'text', nullable: true })
  bio?: string;

  @Property({ length: 500, nullable: true })
  imageUrl?: string;

  @Property({ length: 10, nullable: true })
  birthYear?: string;

  @Property({ length: 10, nullable: true })
  deathYear?: string;

  @Property({ type: 'boolean' })
  isPublished: boolean & Opt = true;

  @Property({ type: 'boolean' })
  isFeatured: boolean & Opt = false;

  @OneToMany({ entity: () => FigureTags, mappedBy: 'figure' })
  tags = new Collection<FigureTags>(this);

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()` })
  createdAt?: Date;

  @Property({ columnType: 'timestamp', nullable: true, defaultRaw: `current_timestamp()`, extra: 'on update current_timestamp()' })
  updatedAt?: Date;

}

@Entity()
export class FigureTags {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => InspirationalFigures, deleteRule: 'cascade' })
  figure!: Rel<InspirationalFigures>;

  @Property({ length: 80 })
  tag!: string;
}