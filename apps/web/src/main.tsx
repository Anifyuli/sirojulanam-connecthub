import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePageLayout } from "./pages/_layout";
import { HomePage } from "./pages/HomePage";
import { NewsPage } from "./pages/NewsPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { AgendaPage } from "./pages/AgendaPage";
import { VideoPage } from "./pages/VideoPage";
import { AboutPage } from "./pages/AboutPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { FeedPage } from "./pages/FeedPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { QuotesPage } from "./pages/QuotesPage";
import { QuoteDetailPage } from "./pages/QuoteDetailPage";
import { FiguresPage } from "./pages/FiguresPage";
import { FigureDetailPage } from "./pages/FigureDetailPage";
import "./main.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePageLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "news", element: <NewsPage /> },
      { path: "news/:slug", element: <BlogPostPage /> },
      { path: "agenda", element: <AgendaPage /> },
      { path: "video", element: <VideoPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "opini", element: <FeedPage /> },
      { path: "opini/:id", element: <PostDetailPage /> },
      { path: "quotes", element: <QuotesPage /> },
      { path: "quotes/:id", element: <QuoteDetailPage /> },
      { path: "figures", element: <FiguresPage /> },
      { path: "figures/:id", element: <FigureDetailPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
