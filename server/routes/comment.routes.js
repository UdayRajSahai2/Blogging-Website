import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getCommentReplies,
  getBlogComments,
  getNestedReplies,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();
router.post("/add-comment", verifyJWT, addComment);
router.post("/get-comment-replies", getCommentReplies);
router.post("/get-blog-comments", getBlogComments);
router.post("/get-nested-replies", getNestedReplies);
router.delete("/delete-comment", verifyJWT, deleteComment);

export default router;
