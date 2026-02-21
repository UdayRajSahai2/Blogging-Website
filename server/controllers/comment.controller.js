import { Op } from "sequelize";
import sequelize from "../config/db.config.js";
import { nanoid } from "nanoid";
import {
  User,
  Profession,
  Blog,
  Comment,
  Like,
  Read,
  Notification,
  UserIPHistory,
  Donor,
  Donation,
  Expenditure,
  BalanceSnapshot,
  setupAssociations,
} from "../models/associations.js";
export const addComment = async (req, res) => {
  // Validate request body structure first
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { blog_id, comment, replying_to } = req.body;
  const user_id = req.user;

  // Validate input
  if (!blog_id || typeof blog_id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
      error: "blog_id must be a non-empty string",
    });
  }

  if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment",
      error: "comment must be a non-empty string",
    });
  }

  if (comment.trim().length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Comment too long",
      error: "Comment must be under 1000 characters",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const trimmedBlogId = blog_id.trim();
    const trimmedComment = comment.trim();

    // Debug logging
    console.log("Processing comment action:", {
      blog_id: trimmedBlogId,
      user_id,
      isReply: !!replying_to,
      replying_to,
    });

    // 1. Get the blog with author info
    const blog = await Blog.findOne({
      where: { blog_id: trimmedBlogId },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["user_id", "fullname", "username", "profile_img"],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!blog) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    }

    // 2. Get the user who is commenting
    const user = await User.findOne({
      where: { user_id },
      attributes: ["user_id", "fullname", "username", "profile_img"],
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. If this is a reply, validate parent comment exists
    let parentComment = null;
    if (replying_to) {
      // ✅ FIXED: Simplified query without problematic includes
      parentComment = await Comment.findOne({
        where: { comment_id: replying_to },
        attributes: ["comment_id", "commented_by", "children"], // Only get what we need
        transaction,
      });

      if (!parentComment) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: "Parent comment not found",
        });
      }
    }

    // 4. Generate unique comment ID
    const comment_id = `comment_${nanoid()}`;

    // 5. Create the comment
    const newComment = await Comment.create(
      {
        comment_id,
        blog_id: trimmedBlogId,
        blog_author: blog.author || blog?.blogAuthor?.user_id,
        comment: trimmedComment,
        commented_by: user_id,
        isReply: !!replying_to,
        parent_comment_id: replying_to || null,
        children: [], // Initialize as empty array
      },
      { transaction },
    );

    // 6. If this is a reply, update parent comment's children array
    if (replying_to && parentComment) {
      const currentChildren = parentComment.children || [];
      const updatedChildren = [...currentChildren, comment_id];

      await Comment.update(
        { children: updatedChildren },
        {
          where: { comment_id: replying_to },
          transaction,
        },
      );
    }

    // 7. Create notification for blog author (if commenter is not the blog author)
    const blogAuthorId = blog.author || blog?.blogAuthor?.user_id;

    if (blogAuthorId && blogAuthorId !== user_id) {
      await Notification.create(
        {
          type: replying_to ? "reply" : "comment",
          blog: trimmedBlogId,
          notification_for: blogAuthorId,
          user: user_id,
          comment_id: newComment.comment_id,
          reply: replying_to ? newComment.comment_id : null,
          replied_on_comment: replying_to ? parentComment.comment_id : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction },
      );
    }

    // 8. If this is a reply, also notify the parent comment author (if different from blog author and commenter)
    if (replying_to && parentComment) {
      const parentCommentAuthorId = parentComment.commented_by;

      if (
        parentCommentAuthorId &&
        parentCommentAuthorId !== user_id &&
        parentCommentAuthorId !== blogAuthorId
      ) {
        await Notification.create(
          {
            type: "reply",
            blog: trimmedBlogId,
            notification_for: parentCommentAuthorId,
            user: user_id,
            comment_id: newComment.comment_id,
            reply: newComment.comment_id,
            replied_on_comment: parentComment.comment_id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction },
        );
      }
    }

    // 9. Get updated total comments count
    const total_comments = await Comment.count({
      where: { blog_id: trimmedBlogId },
      transaction,
    });

    await transaction.commit();

    console.log("Comment created successfully:", {
      comment_id,
      blog_id: trimmedBlogId,
      isReply: !!replying_to,
      total_comments,
    });

    // 10. Return the created comment with user info
    return res.json({
      success: true,
      message: replying_to
        ? "Reply added successfully"
        : "Comment added successfully",
      comment: {
        comment_id: newComment.comment_id,
        blog_id: newComment.blog_id,
        comment: newComment.comment,
        commented_by: newComment.commented_by,
        isReply: newComment.isReply,
        parent_comment_id: newComment.parent_comment_id,
        children: newComment.children,
        createdAt: newComment.createdAt,
        commentAuthor: {
          user_id: user.user_id,
          fullname: user.fullname,
          username: user.username,
          profile_img: user.profile_img,
        },
      },
      total_comments,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Comment operation failed:", {
      errorName: err.name,
      errorMessage: err.message,
      validationErrors: err.errors?.map((e) => e.message),
      stack: err.stack,
    });

    const errorResponse = {
      success: false,
      message: "Error adding comment",
    };

    if (err.name === "SequelizeValidationError") {
      errorResponse.error = "Data validation failed";
      errorResponse.details = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
    } else if (err.name === "SequelizeForeignKeyConstraintError") {
      errorResponse.error = "Invalid reference (blog or user doesn't exist)";
    } else if (err.name === "SequelizeUniqueConstraintError") {
      errorResponse.error = "Duplicate comment ID generated";
    } else {
      errorResponse.error = "Database operation failed";
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.debug = {
        error: err.name,
        message: err.message,
      };
    }

    return res.status(500).json(errorResponse);
  }
};

// IMPROVED: Get replies for a specific comment with better pagination
export const getCommentReplies = async (req, res) => {
  const { comment_id, skip = 0 } = req.body;
  const maxLimit = 5;

  if (!comment_id || typeof comment_id !== "string") {
    return res.status(400).json({
      success: false,
      error: "comment_id is required and must be a string",
    });
  }

  try {
    // Get direct replies to the comment
    const replies = await Comment.findAll({
      where: {
        parent_comment_id: comment_id,
        isReply: true,
      },
      include: [
        {
          model: User,
          as: "commentedBy",
          attributes: ["user_id", "username", "fullname", "profile_img"],
          required: true,
        },
      ],
      attributes: [
        "comment_id",
        "blog_id",
        "comment",
        "commented_by",
        "isReply",
        "parent_comment_id",
        "children",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "ASC"]], // Oldest replies first
      offset: parseInt(skip),
      limit: maxLimit,
    });

    // Get total count of replies for this comment
    const totalReplies = await Comment.count({
      where: {
        parent_comment_id: comment_id,
        isReply: true,
      },
    });

    // Process replies to ensure children array is properly formatted
    const processedReplies = await Promise.all(
      replies.map(async (reply) => {
        const replyData = reply.get({ plain: true });

        // Get the actual count of replies to this reply
        const nestedRepliesCount = await Comment.count({
          where: {
            parent_comment_id: reply.comment_id,
            isReply: true,
          },
        });

        return {
          ...replyData,
          children: replyData.children || [],
          total_replies: nestedRepliesCount, // Add nested reply count
        };
      }),
    );

    const currentPage = Math.floor(skip / maxLimit) + 1;
    const hasMore = skip + maxLimit < totalReplies;

    console.log(`Found ${replies.length} replies for comment ${comment_id}`, {
      skip,
      total: totalReplies,
      hasMore,
      currentPage,
    });

    return res.status(200).json({
      success: true,
      replies: processedReplies,
      pagination: {
        total: totalReplies,
        currentPage,
        hasMore,
        perPage: maxLimit,
        loaded: skip + replies.length,
        remaining: Math.max(0, totalReplies - (skip + replies.length)),
      },
    });
  } catch (err) {
    console.error("Error fetching comment replies:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch replies",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// IMPROVED: Get blog comments with better reply counting
export const getBlogComments = async (req, res) => {
  const { blog_id, skip = 0 } = req.body;
  const maxLimit = 5;

  // Validate input
  if (!blog_id || typeof blog_id !== "string") {
    return res.status(400).json({
      success: false,
      error: "blog_id is required and must be a string",
    });
  }

  try {
    const trimmedBlogId = blog_id.trim();

    // Get parent comments (not replies) with author info
    const comments = await Comment.findAll({
      where: {
        blog_id: trimmedBlogId,
        isReply: false, // Only get parent comments, not replies
      },
      include: [
        {
          model: User,
          as: "commentedBy",
          attributes: ["user_id", "username", "fullname", "profile_img"],
          required: true,
        },
      ],
      attributes: [
        "comment_id",
        "blog_id",
        "comment",
        "commented_by",
        "children",
        "isReply",
        "parent_comment_id",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]], // Latest comments first
      offset: parseInt(skip),
      limit: maxLimit,
    });

    // Get total count of parent comments for pagination
    const totalComments = await Comment.count({
      where: {
        blog_id: trimmedBlogId,
        isReply: false,
      },
    });

    // Process comments to ensure proper data structure and get accurate reply counts
    const processedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentData = comment.get({ plain: true });

        // Get actual reply count for this comment (direct replies only)
        const totalRepliesCount = await Comment.count({
          where: {
            parent_comment_id: comment.comment_id,
            isReply: true,
          },
        });

        return {
          ...commentData,
          children: commentData.children || [],
          total_replies: totalRepliesCount, // Add accurate reply count
        };
      }),
    );

    const currentPage = Math.floor(skip / maxLimit) + 1;
    const hasMore = skip + maxLimit < totalComments;

    console.log(`Found ${comments.length} comments for blog ${trimmedBlogId}`, {
      skip,
      total: totalComments,
      hasMore,
      currentPage,
    });

    return res.status(200).json({
      success: true,
      comments: processedComments,
      pagination: {
        total: totalComments,
        currentPage,
        hasMore,
        perPage: maxLimit,
        loaded: skip + comments.length,
        remaining: Math.max(0, totalComments - (skip + comments.length)),
      },
    });
  } catch (err) {
    console.error("Error fetching blog comments:", {
      errorName: err.name,
      errorMessage: err.message,
      blog_id,
      skip,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch comments",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// ENHANCED: Get nested replies with better pagination and depth control
export const getNestedReplies = async (req, res) => {
  const { comment_id, max_depth = 2, skip = 0, limit = 5 } = req.body;

  if (!comment_id || typeof comment_id !== "string") {
    return res.status(400).json({
      success: false,
      error: "comment_id is required and must be a string",
    });
  }

  try {
    // Recursive function to get nested replies with pagination
    const getNestedReplies = async (
      parentId,
      currentDepth = 0,
      skipCount = 0,
      limitCount = limit,
    ) => {
      if (currentDepth >= max_depth) {
        return { replies: [], hasMore: false, total: 0 };
      }

      const replies = await Comment.findAll({
        where: {
          parent_comment_id: parentId,
          isReply: true,
        },
        include: [
          {
            model: User,
            as: "commentedBy",
            attributes: ["user_id", "username", "fullname", "profile_img"],
            required: true,
          },
        ],
        attributes: [
          "comment_id",
          "blog_id",
          "comment",
          "commented_by",
          "isReply",
          "parent_comment_id",
          "children",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "ASC"]],
        offset: skipCount,
        limit: limitCount,
      });

      const totalReplies = await Comment.count({
        where: {
          parent_comment_id: parentId,
          isReply: true,
        },
      });

      // For each reply, get its nested replies (if within depth limit)
      const nestedReplies = [];
      for (const reply of replies) {
        const replyData = reply.get({ plain: true });

        let childReplies = [];
        let childrenMeta = { hasMore: false, total: 0 };

        if (currentDepth + 1 < max_depth) {
          const childResult = await getNestedReplies(
            reply.comment_id,
            currentDepth + 1,
            0,
            3,
          ); // Load fewer nested replies
          childReplies = childResult.replies;
          childrenMeta = {
            hasMore: childResult.hasMore,
            total: childResult.total,
          };
        }

        nestedReplies.push({
          ...replyData,
          children: replyData.children || [],
          nested_replies: childReplies,
          children_meta: childrenMeta,
          reply_depth: currentDepth + 1,
        });
      }

      return {
        replies: nestedReplies,
        hasMore: skipCount + limitCount < totalReplies,
        total: totalReplies,
      };
    };

    const result = await getNestedReplies(comment_id, 0, skip, limit);

    return res.status(200).json({
      success: true,
      nested_replies: result.replies,
      pagination: {
        hasMore: result.hasMore,
        total: result.total,
        loaded: skip + result.replies.length,
        remaining: Math.max(0, result.total - (skip + result.replies.length)),
      },
      max_depth_used: max_depth,
    });
  } catch (err) {
    console.error("Error fetching nested replies:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch nested replies",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// 4. ADD NEW DELETE COMMENT ENDPOINT

export const deleteComment = async (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { comment_id } = req.body;
  const user_id = req.user;

  if (!comment_id || typeof comment_id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID",
      error: "comment_id must be a non-empty string",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    console.log("Processing delete comment action:", {
      comment_id,
      user_id,
    });

    // 1. Find and verify ownership
    const comment = await Comment.findOne({
      where: {
        comment_id,
        commented_by: user_id, // Ensure user can only delete their own comments
      },
      attributes: [
        "comment_id",
        "commented_by",
        "parent_comment_id",
        "children",
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!comment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Comment not found or you don't have permission to delete it",
      });
    }

    // 2. If this comment has a parent, remove it from parent's children array
    if (comment.parent_comment_id) {
      const parentComment = await Comment.findOne({
        where: { comment_id: comment.parent_comment_id },
        attributes: ["comment_id", "children"],
        transaction,
      });

      if (parentComment && parentComment.children) {
        const updatedChildren = parentComment.children.filter(
          (child) => child !== comment_id,
        );

        await Comment.update(
          { children: updatedChildren },
          {
            where: { comment_id: comment.parent_comment_id },
            transaction,
          },
        );
      }
    }

    // 3. Delete any child comments (if this comment has replies)
    if (comment.children && comment.children.length > 0) {
      await Comment.destroy({
        where: { comment_id: { [Op.in]: comment.children } },
        transaction,
      });

      // Delete notifications for child comments
      await Notification.destroy({
        where: { comment_id: { [Op.in]: comment.children } },
        transaction,
      });
    }

    // 4. Delete the comment itself
    await Comment.destroy({
      where: { comment_id },
      transaction,
    });

    // 5. Delete associated notifications
    await Notification.destroy({
      where: { comment_id },
      transaction,
    });

    await transaction.commit();

    console.log("Comment deleted successfully:", {
      comment_id,
      user_id,
    });

    return res.json({
      success: true,
      message: "Comment deleted successfully",
      deleted_comment_id: comment_id,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Comment deletion failed:", {
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack,
    });

    const errorResponse = {
      success: false,
      message: "Error deleting comment",
    };

    if (err.name === "SequelizeForeignKeyConstraintError") {
      errorResponse.error = "Cannot delete comment due to database constraints";
    } else {
      errorResponse.error = "Database operation failed";
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.debug = {
        error: err.name,
        message: err.message,
      };
    }

    return res.status(500).json(errorResponse);
  }
};
