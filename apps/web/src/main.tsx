import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePageLayout } from "./pages/_layout";
import { HomePage } from "./pages/HomePage";
import { NewsPage } from "./pages/NewsPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { AgendaPage } from "./pages/AgendaPage";
import { VideoPage } from "./pages/VideoPage";
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
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
