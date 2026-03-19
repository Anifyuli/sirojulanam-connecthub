
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "./shared";
import { CalendarDays, MapPin, User, Clock, Tag, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  type: "event" | "blog" | "video";
  data: any;
}

function EventPreview({ data }: { data: any }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-balance">{data.title as string}</h2>
          {data.category && (
            <Badge className="mt-2">{data.category as string}</Badge>
          )}
        </div>
        <Badge variant={data.status as "upcoming" | "active" | "cancelled"}>
          {data.status as string}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{data.date as string}</span>
        </div>
        {data.time && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{data.time as string}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{data.location as string}</span>
        </div>
      </div>

      {data.description && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Description</h4>
          <div className="text-sm text-muted-foreground leading-relaxed">
            <ReactMarkdown>{data.description}</ReactMarkdown>
          </div>
        </div>
      )}

      {data.registration_url && (
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={data.registration_url as string} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
            Registration Link
          </a>
        </Button>
      )}
    </div>
  );
}

function BlogPreview({ data }: { data: any }) {
  const status = data.isPublished ? "published" : "draft";
  const tags = Array.isArray(data.tags) ? data.tags : (typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []);
  
  return (
    <article className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          {data.category?.name && <Badge>{data.category.name}</Badge>}
          <Badge variant={data.isPublished ? "active" : "draft"}>
            {data.isPublished ? "Published" : "Draft"}
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
            <span>{new Date(data.publishedAt).toLocaleDateString("id-ID")}</span>
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
          <div className="prose prose-sm max-w-none text-sm leading-relaxed">
            <ReactMarkdown>{data.contentMd}</ReactMarkdown>
          </div>
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

function VideoPreview({ data }: { data: any }) {
  const getEmbedUrl = (type: string, url: string): string | null => {
    if (type === "youtube" || type === "youtube_shorts") {
      const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\s]+)/);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(data.type as string, data.url as string);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          {data.category && <Badge>{data.category as string}</Badge>}
          <Badge variant={data.type as "video" | "youtube" | "tiktok"}>
            {data.type as string}
          </Badge>
        </div>
        <h2 className="text-xl font-semibold text-balance">{data.title as string}</h2>
      </div>

      {embedUrl ? (
        <div className="aspect-video rounded-xl overflow-hidden bg-muted">
          <iframe 
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : data.url ? (
        <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
          <Button variant="outline" className="gap-2" asChild>
            <a href={data.url as string} target="_blank" rel="noopener noreferrer">
              <Play className="w-4 h-4" />
              Open Video
            </a>
          </Button>
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Play className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Local video file</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          <span>{data.date as string}</span>
        </div>
        {data.duration && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{data.duration as string}</span>
          </div>
        )}
      </div>

      {data.description && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description as string}</p>
        </div>
      )}
    </div>
  );
}

export function PreviewDialog({ open, onClose, type, data }: PreviewDialogProps) {
  if (!data) return null;

  const titles = {
    event: "Event Preview",
    blog: "Blog Post Preview",
    video: "Video Preview",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of {type} content
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          {type === "event" && <EventPreview data={data} />}
          {type === "blog" && <BlogPreview data={data} />}
          {type === "video" && <VideoPreview data={data} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
