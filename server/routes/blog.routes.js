import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
  // deleteBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/latest-blogs", getLatestBlogs);
router.get("/user-blogs", verifyJWT, getUserBlogs);
router.post("/all-latest-blogs-count", getAllLatestBlogsCount);
router.get("/trending-blogs", getTrendingBlogs);
router.post("/search-blogs", getSearchBlogs);
router.post("/search-blogs-count", getSearchBlogsCount);
router.post("/create-blog", verifyJWT, createOrUpdateBlog);
router.post("/get-blog", getBlogById);
router.post("/handle-like", verifyJWT, handleLike);
router.post("/check-like", verifyJWT, checkLikeStatus);

// router.delete("/delete-blog/:blog_id", verifyJWT, deleteBlog);
export default router;
