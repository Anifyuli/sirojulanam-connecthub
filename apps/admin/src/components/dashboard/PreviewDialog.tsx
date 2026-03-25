
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "./shared";
import { CalendarDays, MapPin, User, Clock, Tag, ExternalLink, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TikTokEmbed } from "react-social-media-embed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewData = Record<string, any>;

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  type: "event" | "blog" | "video";
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

export function PreviewDialog({ open, onClose, type, data }: PreviewDialogProps) {
  if (!data) return null;

  const titles = {
    event: "Pratinjau Acara",
    blog: "Pratinjau Blog",
    video: "Pratinjau Video",
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
