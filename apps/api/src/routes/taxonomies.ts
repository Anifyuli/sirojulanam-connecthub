import express from "express";
import { RequestContext } from "@mikro-orm/core";
import { TaxonomyService, TaxonomyType } from "../services/taxonomy.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = express.Router();
const getService = (req: express.Request) => new TaxonomyService(RequestContext.getEntityManager()!);

const validTypes: TaxonomyType[] = ["event", "blog", "video"];

function isValidType(type: string): type is TaxonomyType {
  return validTypes.includes(type as TaxonomyType);
}

function getTypeParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

router.get("/:type/categories", async (req, res) => {
  try {
    const type = getTypeParam(req.params.type);

    if (!isValidType(type)) {
      return res.status(400).json({ error: "Invalid type. Must be: event, blog, or video" });
    }

    const categories = await getService(req).getCategories(type);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:type/categories/:id", async (req, res) => {
  try {
    const type = getTypeParam(req.params.type);
    const id = getTypeParam(req.params.id);

    if (!isValidType(type)) {
      return res.status(400).json({ error: "Invalid type. Must be: event, blog, or video" });
    }

    const category = await getService(req).getCategoryById(type, Number(id));

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:type/categories", authMiddleware, async (req, res) => {
  try {
    const type = getTypeParam(req.params.type);
    const { name, slug, colorHex } = req.body;

    if (!isValidType(type)) {
      return res.status(400).json({ error: "Invalid type. Must be: event, blog, or video" });
    }

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    const category = await getService(req).createCategory(type, { name, slug, colorHex });
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:type/categories/:id", authMiddleware, async (req, res) => {
  try {
    const type = getTypeParam(req.params.type);
    const id = getTypeParam(req.params.id);
    const { name, slug, colorHex } = req.body;

    if (!isValidType(type)) {
      return res.status(400).json({ error: "Invalid type. Must be: event, blog, or video" });
    }

    const category = await getService(req).updateCategory(type, Number(id), { name, slug, colorHex });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:type/categories/:id", authMiddleware, async (req, res) => {
  try {
    const type = getTypeParam(req.params.type);
    const id = getTypeParam(req.params.id);

    if (!isValidType(type)) {
      return res.status(400).json({ error: "Invalid type. Must be: event, blog, or video" });
    }

    const deleted = await getService(req).deleteCategory(type, Number(id));

    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:type/tags", async (req, res) => {
  try {
    const type = getTypeParam(req.params.type);

    if (!isValidType(type)) {
      return res.status(400).json({ error: "Invalid type. Must be: event, blog, or video" });
    }

    const tags = await getService(req).getTags(type);
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:type/tags", authMiddleware, async (req, res) => {
  try {
    const type = getTypeParam(req.params.type);
    const { tag } = req.body;

    if (!isValidType(type)) {
      return res.status(400).json({ error: "Invalid type. Must be: event, blog, or video" });
    }

    if (!tag || typeof tag !== "string") {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag) {
      return res.status(400).json({ error: "Tag name cannot be empty" });
    }

    const existingTag = await getService(req).getTagByName(type, trimmedTag);
    if (existingTag) {
      return res.status(409).json({ error: "Tag already exists", tag: existingTag });
    }

    const newTag = await getService(req).createTag(type, trimmedTag);
    res.status(201).json(newTag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:type/tags/:tag", authMiddleware, async (req, res) => {
  try {
    const type = getTypeParam(req.params.type);
    const tag = getTypeParam(req.params.tag);

    if (!isValidType(type)) {
      return res.status(400).json({ error: "Invalid type. Must be: event, blog, or video" });
    }

    const deleted = await getService(req).deleteTag(type, decodeURIComponent(tag));

    if (!deleted) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
