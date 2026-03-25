import { describe, it, expect, vi, beforeEach } from "vitest";
import { blogsService } from "./blogs";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from "./client";

const mockGet = apiClient.get as ReturnType<typeof vi.fn>;

describe("blogsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should fetch blogs without params", async () => {
      const mockResponse = {
        data: {
          data: [{ id: 1, title: "Test", slug: "test" }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await blogsService.getAll();

      expect(mockGet).toHaveBeenCalledWith("/blogs");
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("Test");
    });

    it("should fetch blogs with page param", async () => {
      mockGet.mockResolvedValue({ data: { data: [], pagination: {} } });

      await blogsService.getAll({ page: 2, limit: 5 });

      expect(mockGet).toHaveBeenCalledWith("/blogs?page=2&limit=5");
    });

    it("should fetch blogs with categoryId param", async () => {
      mockGet.mockResolvedValue({ data: { data: [], pagination: {} } });

      await blogsService.getAll({ categoryId: 3 });

      expect(mockGet).toHaveBeenCalledWith("/blogs?categoryId=3");
    });
  });

  describe("getById", () => {
    it("should fetch blog by id", async () => {
      const mockBlog = { id: 1, title: "Test", slug: "test" };
      mockGet.mockResolvedValue({ data: { success: true, data: mockBlog } });

      const result = await blogsService.getById(1);

      expect(mockGet).toHaveBeenCalledWith("/blogs/1");
      expect(result.title).toBe("Test");
    });
  });

  describe("getBySlug", () => {
    it("should fetch blog by slug", async () => {
      const mockBlog = { id: 1, title: "Test", slug: "my-post" };
      mockGet.mockResolvedValue({ data: { success: true, data: mockBlog } });

      const result = await blogsService.getBySlug("my-post");

      expect(mockGet).toHaveBeenCalledWith("/blogs/slug/my-post");
      expect(result.slug).toBe("my-post");
    });
  });

  describe("getByCategory", () => {
    it("should fetch blogs by category", async () => {
      mockGet.mockResolvedValue({
        data: {
          data: [{ id: 1, categoryId: 2 }],
          pagination: { total: 1 },
        },
      });

      const result = await blogsService.getByCategory(2);

      expect(mockGet).toHaveBeenCalledWith("/blogs/category/2");
      expect(result.data[0].categoryId).toBe(2);
    });
  });
});
