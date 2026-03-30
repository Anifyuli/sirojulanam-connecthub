import { EntityManager } from "@mikro-orm/core";
import { Events, EventsStatus } from "../entities/Events.ts";
import { EventTags } from "../entities/EventTags.ts";
import { EventCategories } from "../entities/EventCategories.ts";
import { Admins } from "../entities/Admins.ts";
import { CreateEventDto, UpdateEventDto, EventFilter, EventResponse } from "../types/Event.ts";
import { PaginationParams, PaginatedResponse } from "../types/pagination.ts";
import { processQuillContent, cleanupOldImages } from "../lib/contentStorage.ts";

export interface EventTagDto {
  tags: string[];
}

function parseDateTime(value: string | Date | undefined | null): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return new Date(value.replace('T', ' ') + ':00');
}

export class EventService {
  constructor(private readonly em: EntityManager) { }

  private async mapToResponse(event: Events, includeAdmin = false): Promise<EventResponse> {
    const tags = await this.getTags(Number(event.id));

    const response: EventResponse = {
      id: Number(event.id),
      categoryId: event.category?.id ? Number(event.category.id) : null,
      categoryName: event.category?.name ?? null,
      adminId: Number(event.admin.id),
      title: event.title,
      slug: event.slug,
      descriptionMd: event.descriptionMd,
      tags,
      locationName: event.locationName ?? undefined,
      locationDetail: event.locationDetail ?? undefined,
      startDatetime: event.startDatetime,
      endDatetime: event.endDatetime,
      isAllDay: event.isAllDay,
      status: event.status,
      isFree: event.isFree,
      createdAt: event.createdAt!,
      updatedAt: event.updatedAt!,
    };

    if (includeAdmin) {
      const admin = await this.em.findOne(Admins, { id: event.admin.id });
      if (admin) {
        response.admin = {
          id: Number(admin.id),
          name: admin.name,
          username: admin.username,
        };
      }
    }

    return response;
  }

   async find(filter: EventFilter = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<EventResponse>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;
 
    const where: any = {};
 
    if (filter.title) {
      where.title = { $contains: filter.title };
    }
    if (filter.categoryId) {
      where.category = { id: filter.categoryId };
    }
    if (filter.adminId) {
      where.admin = { id: filter.adminId };
    }
    if (filter.slug) {
      where.slug = filter.slug;
    }
 
    const [events, total] = await Promise.all([
      this.em.find(Events, where, {
        populate: ['category'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      }),
      this.em.count(Events, where),
    ]);
 
    const data = await Promise.all(events.map((event) => this.mapToResponse(event)));
 
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findAll(): Promise<EventResponse[]> {
    return (await this.find({}, { page: 1, limit: 100 })).data;
  }

  async findByTitle(title: string): Promise<EventResponse | null> {
    const event = await this.em.findOne(Events, { title }, { populate: ['admin'] });

    if (!event) {
      return null;
    }

    return this.mapToResponse(event, true);
  }

   async findById(id: number): Promise<EventResponse | null> {
    const event = await this.em.findOne(Events, { id }, { populate: ['admin', 'category'] });

    if (!event) {
      return null;
    }

    return this.mapToResponse(event, true);
  }

  async findByCategory(categoryId: number): Promise<EventResponse[]> {
    return (await this.find({ categoryId }, { page: 1, limit: 100 })).data;
  }

  async create(data: CreateEventDto): Promise<EventResponse> {
    const admin = await this.em.findOneOrFail(Admins, { id: data.adminId }, { populate: ['role'] });

    const { html: processedDescription } = await processQuillContent(String(data.descriptionMd ?? ""));

    const event = new Events();
    event.admin = admin;
    event.category = data.categoryId ? this.em.getReference(EventCategories, data.categoryId) : undefined;
    event.title = data.title;
    event.slug = data.slug;
    event.descriptionMd = processedDescription;
    event.locationName = data.locationName;
    event.locationDetail = data.locationDetail;
    event.startDatetime = parseDateTime(data.startDatetime);
    event.endDatetime = data.endDatetime ? parseDateTime(data.endDatetime) : undefined;
    event.isAllDay = data.isAllDay ?? false;
    event.status = data.status as EventsStatus;
    event.isFree = data.isFree;

    this.em.persist(event);
    await this.em.flush();

    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        const eventTag = new EventTags();
        eventTag.event = event;
        eventTag.tag = tag.trim();
        event.tags.add(eventTag);
      }
      await this.em.flush();
    }

    return this.mapToResponse(event);
  }

  async update(id: number, data: UpdateEventDto): Promise<EventResponse> {
    const event = await this.em.findOneOrFail(Events, { id });

    if (data.descriptionMd) {
      const newDescriptionMd = String(data.descriptionMd);
      await cleanupOldImages(String(event.descriptionMd ?? ""), newDescriptionMd);
      const { html: processedDescription } = await processQuillContent(newDescriptionMd);
      data.descriptionMd = processedDescription;
    }

    event.title = data.title;
    event.slug = data.slug;
    event.descriptionMd = data.descriptionMd ?? event.descriptionMd;
    event.locationName = data.locationName;
    event.locationDetail = data.locationDetail;
    event.startDatetime = parseDateTime(data.startDatetime);
    event.endDatetime = data.endDatetime ? parseDateTime(data.endDatetime) : undefined;
    event.isAllDay = data.isAllDay ?? event.isAllDay;
    event.status = data.status as EventsStatus;
    event.isFree = data.isFree;

    if (data.categoryId !== undefined) {
      event.category = data.categoryId ? this.em.getReference(EventCategories, data.categoryId) : undefined;
    }

    if (data.tags !== undefined) {
      const existingTags = await this.em.find(EventTags, { event });
      this.em.remove(existingTags);

      for (const tag of data.tags) {
        const eventTag = new EventTags();
        eventTag.event = event;
        eventTag.tag = tag.trim();
        this.em.persist(eventTag);
      }
    }

    event.updatedAt = new Date();

    await this.em.flush();

    return this.mapToResponse(event);
  }

  async delete(id: number): Promise<boolean> {
    const event = await this.em.findOne(Events, { id });

    if (!event) {
      return false;
    }

    await cleanupOldImages(String(event.descriptionMd ?? ""), "");

    this.em.remove(event);
    await this.em.flush();
    return true;
  }

  async getTags(eventId: number): Promise<string[]> {
    const eventTags = await this.em.find(EventTags, { event: { id: eventId } });
    return eventTags.map((et) => et.tag);
  }

  async addTags(eventId: number, tags: string[]): Promise<void> {
    const event = await this.em.findOneOrFail(Events, { id: eventId });

    for (const tag of tags) {
      const existingTag = await this.em.findOne(EventTags, { event, tag });
      if (!existingTag) {
        const eventTag = new EventTags();
        eventTag.event = event;
        eventTag.tag = tag.trim();
        this.em.persist(eventTag);
      }
    }

    await this.em.flush();
  }

  async removeTags(eventId: number, tags: string[]): Promise<void> {
    const eventTags = await this.em.find(EventTags, {
      event: { id: eventId },
      tag: { $in: tags },
    });

    for (const eventTag of eventTags) {
      this.em.remove(eventTag);
    }

    await this.em.flush();
  }

  async clearTags(eventId: number): Promise<void> {
    const eventTags = await this.em.find(EventTags, { event: { id: eventId } });

    for (const eventTag of eventTags) {
      this.em.remove(eventTag);
    }

    await this.em.flush();
  }

  async setTags(eventId: number, tags: string[]): Promise<void> {
    await this.clearTags(eventId);
    await this.addTags(eventId, tags);
  }
}
