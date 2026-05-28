// server\routes\blog.routes.js
import express from "express";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middleware.js";

import {
  getLatestBlogs,
  getAllLatestBlogsCount,
  getTrendingBlogs,
  getSearchBlogs,
  getSearchBlogsCount,
  createOrUpdateBlog,
  getBlogById,
  handleLike,
  checkLikeStatus,
  getUserBlogs,
  getBlogTaxonomy,
  // deleteBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/latest-blogs", getLatestBlogs);

router.post("/all-latest-blogs-count", getAllLatestBlogsCount);
router.get("/trending-blogs", getTrendingBlogs);
router.post("/search-blogs", getSearchBlogs);
router.post("/search-blogs-count", getSearchBlogsCount);
router.get("/taxonomy", getBlogTaxonomy);
router.get("/user-blogs", verifyJWT, getUserBlogs);
router.post("/create-blog", verifyJWT, createOrUpdateBlog);
router.post("/get-blog", optionalAuth, getBlogById);
router.post("/handle-like", verifyJWT, handleLike);
router.post("/check-like", verifyJWT, checkLikeStatus);

// router.delete("/delete-blog/:blog_id", verifyJWT, deleteBlog);
export default router;
