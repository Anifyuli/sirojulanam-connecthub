import type { PostResponse } from "../lib/api/posts.ts";

export interface PostCardProps {
  post: PostResponse;
  onReaction?: (postId: string, reactionType: string) => void;
  onClick?: () => void;
  className?: string;
}

const POST_TYPE_CONFIG = {
  opinion: {
    label: "Opini",
    pill: "bg-blue-100 text-blue-800",
    quoteBorder: "border-blue-300",
    quoteBg: "bg-blue-50",
    quoteText: "text-blue-900",
    quoteSource: "text-blue-600",
  },
  quote_of_day: {
    label: "Quote Hari Ini",
    pill: "bg-amber-100 text-amber-800",
    quoteBorder: "border-amber-300",
    quoteBg: "bg-amber-50",
    quoteText: "text-amber-900",
    quoteSource: "text-amber-600",
  },
  figure_spotlight: {
    label: "Tokoh Inspiratif",
    pill: "bg-violet-100 text-violet-800",
    quoteBorder: "border-violet-300",
    quoteBg: "bg-violet-50",
    quoteText: "text-violet-900",
    quoteSource: "text-violet-600",
  },
} as const;

const AVATAR_COLORS = [
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
];

const REACTION_ICONS: Record<string, string> = {
  like: "👍",
  love: "❤️",
  inspiring: "✨",
  pray: "🤲",
};

function getAvatarColor(name?: string) {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name?: string) {
  if (!name) return "A";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function formatRelativeDate(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} mnt baca`;
}

export function PostCard({ post, onReaction, onClick, className = "" }: PostCardProps) {
  const config = POST_TYPE_CONFIG[post.type] ?? {
    label: post.type,
    pill: "bg-gray-100 text-gray-700",
    quoteBorder: "border-gray-300",
    quoteBg: "bg-gray-50",
    quoteText: "text-gray-900",
    quoteSource: "text-gray-600",
  };

  const avatarColor = getAvatarColor(post.admin?.name);
  const adminInitials = getInitials(post.admin?.name);
  const relativeDate = formatRelativeDate(post.createdAt);
  const readTime = estimateReadingTime(post.content);

  const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div
      className={`
        rounded-2xl bg-white border border-gray-100 overflow-hidden
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md hover:border-gray-200" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="p-5">
        {/* Judul opini */}
        {post.title && (
          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight cursor-pointer hover:text-cyan-600">
            {post.title}
          </h3>
        )}

        {/* Embed kutipan */}
        {post.quote && (
          <div
            className={`
              mb-4 px-4 py-3 rounded-xl border-l-4
              ${config.quoteBorder} ${config.quoteBg}
            `}
          >
            <div className={`italic text-sm leading-relaxed ${config.quoteText}`} dangerouslySetInnerHTML={{ __html: `&ldquo;${post.quote.content}&rdquo;` }} />
            {post.quote.source && (
              <p className={`text-xs mt-2 font-medium ${config.quoteSource}`}>
                — {post.quote.source}
              </p>
            )}
          </div>
        )}

        {/* Embed tokoh */}
        {post.figure && (
          <div className={`mb-4 flex gap-3 p-3 rounded-xl ${config.quoteBg}`}>
            {post.figure.imageUrl ? (
              <img
                src={post.figure.imageUrl}
                alt={post.figure.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  font-semibold text-sm flex-shrink-0 select-none
                  ${avatarColor.bg} ${avatarColor.text}
                `}
              >
                {getInitials(post.figure.name)}
              </div>
            )}
            <div>
              <p className={`font-semibold text-sm ${config.quoteText}`}>
                {post.figure.name}
              </p>
              {post.figure.title && (
                <p className={`text-xs mt-0.5 ${config.quoteSource}`}>
                  {post.figure.title}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info penulis dan Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`
                w-7 h-7 rounded-full flex items-center justify-center
                text-xs font-semibold flex-shrink-0 select-none
                ${avatarColor.bg} ${avatarColor.text}
              `}
            >
              {adminInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-none truncate">
                {post.admin?.name ?? "Admin"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {relativeDate} · {readTime}
              </p>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reaction bar */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-1">
          {post.reactions.map((reaction) => (
            <button
              key={reaction.reactionType}
              onClick={(e) => {
                e.stopPropagation();
                onReaction?.(post.id, reaction.reactionType);
              }}
              className="
                flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                text-gray-600 hover:bg-gray-100 transition-colors
              "
            >
              <span>{REACTION_ICONS[reaction.reactionType] ?? "👍"}</span>
              <span>{reaction.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          {totalReactions > 0 && (
            <span>{totalReactions} reaksi</span>
          )}
          <span>{post.viewCount} dilihat</span>
        </div>
      </div>
    </div>
  );
}
