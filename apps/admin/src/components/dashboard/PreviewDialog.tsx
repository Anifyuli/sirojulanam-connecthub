
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "./shared";
import { CalendarDays, MapPin, User, Clock, Tag, ExternalLink, Play, Eye, Heart, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TikTokEmbed } from "react-social-media-embed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewData = Record<string, any>;

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  type: "event" | "blog" | "video" | "post" | "quote" | "figure";
  data: PreviewData | null;
}

function EventPreview({ data }: { data: PreviewData }) {
  const dateTime = data.startDatetime ? new Date(data.startDatetime) : null;
  const formattedDate = dateTime ? dateTime.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : "-";
  const formattedTime = dateTime ? dateTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  }) : "-";

  const statusLabels: Record<string, string> = {
    draft: "Draf",
    published: "Dipublikasikan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-balance">{data.title as string}</h2>
          {data.categoryName && (
            <Badge className="mt-2">{data.categoryName as string}</Badge>
          )}
        </div>
        <Badge variant={data.status as "draft" | "published" | "completed" | "cancelled"}>
          {statusLabels[data.status as string] || data.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        {data.startDatetime && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{formattedTime}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{data.locationName || '-'}</span>
        </div>
      </div>

      {data.descriptionMd && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Deskripsi</h4>
          <div className="prose prose-sm max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: data.descriptionMd as string }} />
        </div>
      )}
    </div>
  );
}

function BlogPreview({ data }: { data: PreviewData }) {
  const tags = Array.isArray(data.tags) ? data.tags : (typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []);

  return (
    <article className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          {data.category?.name && <Badge>{data.category.name}</Badge>}
          <Badge variant={data.isPublished ? "active" : "draft"}>
            {data.isPublished ? "Dipublikasikan" : "Draf"}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-balance">{data.title}</h1>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {data.admin?.name && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{data.admin.name}</span>
          </div>
        )}
        {data.publishedAt && (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date(data.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        )}
      </div>

      {data.excerpt && (
        <p className="text-muted-foreground italic border-l-4 border-primary/20 pl-4">
          {data.excerpt}
        </p>
      )}

      {data.contentMd && (
        <div className="pt-4 border-t border-border">
          <div className="prose prose-sm max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: data.contentMd }} />
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}

function VideoPreview({ data }: { data: PreviewData }) {
  const getEmbedUrl = (type: string, url: string): string | null => {
    if (type === "youtube" || type === "youtube_shorts") {
      const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\s]+)/);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    if (type === "tiktok" && url) {
      const videoId = url.split("/").pop()?.split("?")[0];
      if (videoId) return `https://www.tiktok.com/embed/v2/${videoId}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(data.sourceType as string, data.sourceUrl as string);
  const isTiktok = data.sourceType === "tiktok";
  
  // Format date from publishedAt
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  const formattedDate = publishedAt ? publishedAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

  // Get tags
  const tags = Array.isArray(data.tags) ? data.tags : [];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {data.category?.name && <Badge>{data.category.name}</Badge>}
          <Badge variant={data.isPublished ? "active" : "draft"}>
            {data.isPublished ? "Dipublikasikan" : "Draf"}
          </Badge>
          {data.isFeatured && <Badge variant="upcoming">Unggulan</Badge>}
          <Badge variant={data.sourceType as string}>
            {data.sourceType === "youtube" ? "YouTube" : 
             data.sourceType === "youtube_shorts" ? "YouTube Shorts" : 
             data.sourceType === "tiktok" ? "TikTok" : 
             data.sourceType === "local" ? "Lokal" : data.sourceType}
          </Badge>
        </div>
        <h2 className="text-xl font-semibold text-balance">{data.title as string}</h2>
      </div>

      {isTiktok && data.sourceUrl ? (
        <div className="flex justify-center">
          <div className="w-full max-w-[300px]">
            <TikTokEmbed
              url={data.sourceUrl as string}
              width={300}
            />
          </div>
        </div>
      ) : embedUrl ? (
        <div className="aspect-video rounded-xl overflow-hidden bg-muted">
          <iframe 
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : data.sourceUrl ? (
        <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
          <Button variant="outline" className="gap-2" asChild>
            <a href={data.sourceUrl as string} target="_blank" rel="noopener noreferrer">
              <Play className="w-4 h-4" />
              Buka Video
            </a>
          </Button>
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Play className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Video lokal</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        {data.durationSeconds && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(data.durationSeconds / 60)}:{data.durationSeconds % 60 < 10 ? '0' : ''}{data.durationSeconds % 60} menit</span>
          </div>
        )}
        {data.viewCount !== undefined && (
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{data.viewCount} views</span>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {data.description && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Deskripsi</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description as string}</p>
        </div>
      )}
    </div>
  );
}

function PostPreview({ data }: { data: PreviewData }) {
  const typeLabels: Record<string, string> = {
    opinion: "Opini",
    quote_of_day: "Kutipan Hari Ini",
    figure_spotlight: "Tokoh Unggulan",
  };

  const reactionIcons: Record<string, React.ReactNode> = {
    like: <span>👍</span>,
    love: <span>❤️</span>,
    inspiring: <span>✨</span>,
    pray: <span>🤲</span>,
  };

  const tags = Array.isArray(data.tags) ? data.tags : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge>{typeLabels[data.type as string] || data.type}</Badge>
        <Badge variant={data.isPublished ? "active" : "draft"}>
          {data.isPublished ? "Dipublikasikan" : "Draf"}
        </Badge>
      </div>

      {data.title && (
        <h2 className="text-xl font-semibold text-balance">{data.title as string}</h2>
      )}

      <div className="prose prose-sm max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: data.content as string }} />

      {data.quote && (
        <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
          <p className="text-sm italic text-muted-foreground mb-2">"{data.quote.content}"</p>
          {data.quote.source && (
            <p className="text-xs text-muted-foreground">— {data.quote.source}</p>
          )}
        </div>
      )}

      {data.figure && (
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
          {data.figure.imageUrl ? (
            <img src={data.figure.imageUrl} alt={data.figure.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {data.figure.name?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium">{data.figure.name}</p>
            {data.figure.title && <p className="text-xs text-muted-foreground">{data.figure.title}</p>}
          </div>
        </div>
      )}

      {data.reactions && data.reactions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
          {data.reactions.map((r: { reactionType: string; count: number }, i: number) => (
            <span key={i} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
              {reactionIcons[r.reactionType as string]}
              {r.count}
            </span>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>{data.viewCount || 0} views</span>
        </div>
        {data.admin?.name && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{data.admin.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function QuotePreview({ data }: { data: PreviewData }) {
  const tags = Array.isArray(data.tags) ? data.tags : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {data.category?.name && <Badge>{data.category.name}</Badge>}
        <Badge variant={data.isPublished ? "active" : "draft"}>
          {data.isPublished ? "Dipublikasikan" : "Draf"}
        </Badge>
        {data.isFeatured && <Badge variant="upcoming">Unggulan</Badge>}
      </div>

      <blockquote className="text-xl font-serif text-foreground leading-relaxed border-l-4 border-primary pl-4">
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      </blockquote>

      {data.source && (
        <p className="text-muted-foreground font-medium">— {data.source}</p>
      )}

      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {data.admin?.name && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
          <User className="w-4 h-4" />
          <span>Ditambahkan oleh {data.admin.name}</span>
        </div>
      )}
    </div>
  );
}

function FigurePreview({ data }: { data: PreviewData }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge variant={data.isPublished ? "active" : "draft"}>
          {data.isPublished ? "Dipublikasikan" : "Draf"}
        </Badge>
        {data.isFeatured && <Badge variant="upcoming">Unggulan</Badge>}
      </div>

      <div className="flex gap-4">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.name} className="w-24 h-24 rounded-lg object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-3xl font-semibold text-muted-foreground">{data.name?.charAt(0)}</span>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">{data.name}</h2>
          {data.title && <p className="text-muted-foreground">{data.title}</p>}
          {(data.birthYear || data.deathYear) && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.birthYear || "?"} - {data.deathYear || "Sekarang"}
            </p>
          )}
        </div>
      </div>

      {data.bio && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Biografi</h4>
          <div className="prose prose-sm max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: data.bio as string }} />
        </div>
      )}

      {data.admin?.name && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
          <User className="w-4 h-4" />
          <span>Ditambahkan oleh {data.admin.name}</span>
        </div>
      )}
    </div>
  );
}

export function PreviewDialog({ open, onClose, type, data }: PreviewDialogProps) {
  if (!data) return null;

  const titles = {
    event: "Pratinjau Acara",
    blog: "Pratinjau Blog",
    video: "Pratinjau Video",
    post: "Pratinjau Opini",
    quote: "Pratinjau Kutipan",
    figure: "Pratinjau Tokoh",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
          <DialogDescription className="sr-only">
            Pratinjau {type}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          {type === "event" && <EventPreview data={data!} />}
          {type === "blog" && <BlogPreview data={data!} />}
          {type === "video" && <VideoPreview data={data!} />}
          {type === "post" && <PostPreview data={data!} />}
          {type === "quote" && <QuotePreview data={data!} />}
          {type === "figure" && <FigurePreview data={data!} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
