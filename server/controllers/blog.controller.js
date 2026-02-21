import { Op } from "sequelize";
import sequelize from "../config/db.config.js";
import Sequelize from "sequelize";
import { nanoid } from "nanoid";
import {
  User,
  Blog,
  Comment,
  Like,
  Read,
  Notification,
} from "../models/associations.js";

export const getUserBlogs = async (req, res) => {
  try {
    const userId = req.user;

    const blogs = await Blog.findAll({
      where: { author: userId },
      attributes: ["blog_id", "title", "des", "banner", "draft"],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ blogs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getLatestBlogs = async (req, res) => {
  let maxLimit = 5;
  let { page } = req.body;

  try {
    // Calculate offset for pagination
    let offset = (page - 1) * maxLimit;
    if (req.body.fetchAll) {
      maxLimit = null;
      offset = null;
    }

    // Fetch all published blogs with author information
    const blogs = await Blog.findAll({
      where: { draft: false },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["profile_img", "username", "fullname"],
        },
      ],
      order: [["publishedAt", "DESC"]],
      attributes: [
        "blog_id",
        "title",
        "des",
        "banner",
        "tags",
        "publishedAt",
        "createdAt",
        "updatedAt",
      ],
      offset: offset,
      limit: maxLimit,
    });

    if (!blogs.length) {
      return res.status(200).json({
        status: "success",
        results: 0,
        blogs: [],
      });
    }

    const blogIds = blogs.map((blog) => blog.blog_id);

    // Count likes, comments, reads, and parent comments
    const [likesCounts, commentsCounts, readsCounts, parentCommentsCounts] =
      await Promise.all([
        Like.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Comment.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Read.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Comment.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: {
            blog_id: blogIds,
            parent_comment_id: null,
          },
          group: ["blog_id"],
          raw: true,
        }),
      ]);

    const createCountMap = (items) => {
      return items.reduce((acc, item) => {
        acc[item.blog_id] = item.count;
        return acc;
      }, {});
    };

    const likesMap = createCountMap(likesCounts);
    const commentsMap = createCountMap(commentsCounts);
    const readsMap = createCountMap(readsCounts);
    const parentCommentsMap = createCountMap(parentCommentsCounts);

    const blogsWithActivity = blogs.map((blog) => ({
      ...blog.get({ plain: true }),
      total_likes: likesMap[blog.blog_id] || 0,
      total_comments: commentsMap[blog.blog_id] || 0,
      total_reads: readsMap[blog.blog_id] || 0,
      total_parent_comments: parentCommentsMap[blog.blog_id] || 0,
    }));

    return res.status(200).json({
      status: "success",
      results: blogsWithActivity.length,
      blogs: blogsWithActivity,
      pagination: {
        currentPage: parseInt(page),
        perPage: maxLimit,
        totalPages: Math.ceil(blogsWithActivity.length / maxLimit),
      },
    });
  } catch (err) {
    console.error("Error fetching latest blogs:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch latest blogs",
      error: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

export const getAllLatestBlogsCount = async (req, res) => {
  try {
    const count = await Blog.count({
      where: { draft: false },
    });

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.error("Error fetching latest blogs count:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const getTrendingBlogs = async (req, res) => {
  let maxLimit = 5;

  try {
    // Fetch all published blogs with author information
    const blogs = await Blog.findAll({
      where: { draft: false },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["profile_img", "username", "fullname", "user_id"],
        },
      ],
      attributes: ["blog_id", "title", "publishedAt", "author"],
      limit: maxLimit,
    });

    if (!blogs.length) {
      return res.status(200).json({
        status: "success",
        results: 0,
        blogs: [],
      });
    }

    const blogIds = blogs.map((blog) => blog.blog_id);

    // Count likes, comments, reads, and parent comments
    const [likesCounts, commentsCounts, readsCounts, parentCommentsCounts] =
      await Promise.all([
        Like.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Comment.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Read.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Comment.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: {
            blog_id: blogIds,
            parent_comment_id: null,
          },
          group: ["blog_id"],
          raw: true,
        }),
      ]);

    const createCountMap = (items) => {
      return items.reduce((acc, item) => {
        acc[item.blog_id] = item.count;
        return acc;
      }, {});
    };

    const likesMap = createCountMap(likesCounts);
    const commentsMap = createCountMap(commentsCounts);
    const readsMap = createCountMap(readsCounts);
    const parentCommentsMap = createCountMap(parentCommentsCounts);

    const blogsWithActivity = blogs.map((blog) => ({
      ...blog.get({ plain: true }),
      total_likes: likesMap[blog.blog_id] || 0,
      total_comments: commentsMap[blog.blog_id] || 0,
      total_reads: readsMap[blog.blog_id] || 0,
      total_parent_comments: parentCommentsMap[blog.blog_id] || 0,
    }));

    // Sort by trending criteria
    const trendingBlogs = blogsWithActivity.sort((a, b) => {
      if (b.total_reads !== a.total_reads) return b.total_reads - a.total_reads;
      if (b.total_likes !== a.total_likes) return b.total_likes - a.total_likes;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    return res.status(200).json({
      status: "success",
      results: trendingBlogs.length,
      blogs: trendingBlogs,
    });
  } catch (err) {
    console.error("Error fetching trending blogs:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch trending blogs",
      error: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

export const getSearchBlogs = async (req, res) => {
  let { tag, query, author, page = 1, limit, eliminate_blog } = req.body;
  let maxLimit = limit ? parseInt(limit) : 2; // Use provided limit or default to 2

  if (!tag && !query && !author) {
    return res.status(400).json({
      status: "error",
      message: "Either tag, query or author parameter is required",
    });
  }

  try {
    let offset = (page - 1) * maxLimit;
    let whereClause = { draft: false };

    // Add eliminate_blog condition if provided
    if (eliminate_blog) {
      whereClause.blog_id = { [Op.ne]: eliminate_blog };
    }

    if (tag) {
      // For tag search (clicking on tags)
      const normalizedTag = tag.toLowerCase().trim();
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []), // Preserve existing conditions
        {
          [Op.or]: [
            sequelize.where(
              sequelize.fn(
                "JSON_SEARCH",
                sequelize.col("tags"),
                "one",
                `%${normalizedTag}%`,
              ),
              { [Op.ne]: null },
            ),
            { tags: { [Op.like]: `%${normalizedTag}%` } },
          ],
        },
      ];
    } else if (query) {
      // For query search (search box) - search in both title AND tags
      const normalizedQuery = query.toLowerCase().trim();
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []), // Preserve existing conditions
        {
          [Op.or]: [
            { title: { [Op.like]: `%${normalizedQuery}%` } },
            sequelize.where(
              sequelize.fn(
                "JSON_SEARCH",
                sequelize.col("tags"),
                "one",
                `%${normalizedQuery}%`,
              ),
              { [Op.ne]: null },
            ),
            { tags: { [Op.like]: `%${normalizedQuery}%` } },
          ],
        },
      ];
    } else if (author) {
      // For author search
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []), // Preserve existing conditions
        { author: author },
      ];
    }
    if (req.body.fetchAll) {
      maxLimit = null;
      offset = null;
    }

    const { count: totalBlogs, rows: blogs } = await Blog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["profile_img", "username", "fullname"],
        },
      ],
      attributes: ["blog_id", "title", "des", "banner", "tags", "publishedAt"],
      order: [["publishedAt", "DESC"]],
      limit: maxLimit,
      offset: offset,
    });

    if (!blogs.length) {
      return res.status(200).json({
        status: "success",
        results: totalBlogs,
        blogs: [],
      });
    }

    const blogIds = blogs.map((blog) => blog.blog_id);

    const [likesCounts, commentsCounts, readsCounts] = await Promise.all([
      Like.findAll({
        attributes: [
          "blog_id",
          [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
        ],
        where: { blog_id: blogIds },
        group: ["blog_id"],
        raw: true,
      }),

      Comment.findAll({
        attributes: [
          "blog_id",
          [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
        ],
        where: { blog_id: blogIds },
        group: ["blog_id"],
        raw: true,
      }),

      Read.findAll({
        attributes: [
          "blog_id",
          [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
        ],
        where: { blog_id: blogIds },
        group: ["blog_id"],
        raw: true,
      }),
    ]);

    const createCountMap = (items) => {
      return items.reduce((acc, item) => {
        acc[item.blog_id] = item.count;
        return acc;
      }, {});
    };

    const likesMap = createCountMap(likesCounts);
    const commentsMap = createCountMap(commentsCounts);
    const readsMap = createCountMap(readsCounts);

    const blogsWithActivity = blogs.map((blog) => {
      return {
        ...blog.get({ plain: true }),
        total_likes: likesMap[blog.blog_id] || 0,
        total_comments: commentsMap[blog.blog_id] || 0,
        total_reads: readsMap[blog.blog_id] || 0,
      };
    });

    return res.status(200).json({
      status: "success",
      results: totalBlogs,
      blogs: blogsWithActivity,
      pagination: {
        currentPage: parseInt(page),
        perPage: maxLimit,
        totalPages: Math.ceil(totalBlogs / maxLimit),
      },
    });
  } catch (err) {
    console.error("Error searching blogs:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to search blogs",
      error: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

export const getSearchBlogsCount = async (req, res) => {
  let { tag, author, query } = req.body;

  try {
    let whereClause = { draft: false };

    if (tag) {
      const normalizedTag = tag.toLowerCase().trim();
      whereClause[Op.or] = [
        sequelize.where(
          sequelize.fn(
            "JSON_SEARCH",
            sequelize.col("tags"),
            "one",
            `%${normalizedTag}%`,
          ),
          { [Op.ne]: null },
        ),
        { tags: { [Op.like]: `%${normalizedTag}%` } },
      ];
    } else if (query) {
      const normalizedQuery = query.toLowerCase().trim();
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${normalizedQuery}%` } },
        sequelize.where(
          sequelize.fn(
            "JSON_SEARCH",
            sequelize.col("tags"),
            "one",
            `%${normalizedQuery}%`,
          ),
          { [Op.ne]: null },
        ),
        { tags: { [Op.like]: `%${normalizedQuery}%` } },
      ];
    } else if (author) {
      whereClause.author = author;
    }

    const count = await Blog.count({
      where: whereClause,
    });

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.error("Error counting search blogs:", err);
    return res.status(500).json({
      error: "Failed to count search blogs",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

export const createOrUpdateBlog = async (req, res) => {
  const authorId = req.user;
  let { title, des, banner, tags, content, draft, id } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  // Validation (only for non-draft)
  if (!draft) {
    if (typeof des !== "string" || !des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }
    if (!banner.length) {
      return res.status(403).json({
        error: "You must provide blog banner to publish it",
      });
    }
    if (!content.blocks || !content.blocks.length) {
      return res.status(403).json({
        error: "There must be some blog content to publish it",
      });
    }
    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, Maximum 10",
      });
    }
  }

  try {
    tags = tags.map((tag) => tag.toLowerCase());
    const blog_id =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();

    if (id) {
      // UPDATE EXISTING BLOG
      const [updatedCount] = await Blog.update(
        {
          title,
          des,
          banner,
          content: JSON.stringify(content),
          tags: JSON.stringify(tags),
          draft: draft ? draft : false,
          publishedAt: draft ? null : new Date(),
        },
        { where: { blog_id, author: authorId } },
      );

      if (updatedCount === 0) {
        return res
          .status(404)
          .json({ error: "Blog not found or not authorized" });
      }

      return res.status(200).json({ id: blog_id });
    } else {
      // CREATE NEW BLOG
      const blog = await Blog.create({
        title,
        des,
        banner,
        content: JSON.stringify(content),
        tags: JSON.stringify(tags),
        author: authorId,
        blog_id,
        draft: Boolean(draft),
        publishedAt: draft ? null : new Date(),
      });

      // Update user's post count
      const incrementVal = draft ? 0 : 1;
      await User.update(
        {
          total_posts: Sequelize.literal(`total_posts + ${incrementVal}`),
          blogs: Sequelize.fn(
            "JSON_ARRAY_APPEND",
            Sequelize.col("blogs"),
            "$",
            blog_id,
          ),
        },
        { where: { user_id: authorId } },
      );

      return res.status(200).json({ id: blog.blog_id });
    }
  } catch (err) {
    console.error("Error in create-blog:", err);
    return res.status(500).json({
      error: err.message || "Failed to create/update blog",
    });
  }
};

export const getBlogById = async (req, res) => {
  const { blog_id, draft, mode } = req.body;
  const incrementVal = mode !== "edit" ? 1 : 0; // Only increment reads if not in edit mode

  try {
    // 1. Find the blog with author info
    const blog = await Blog.findOne({
      where: { blog_id },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["fullname", "username", "profile_img"],
        },
      ],
      attributes: [
        "blog_id",
        "title",
        "des",
        "content",
        "banner",
        "tags",
        "publishedAt",
        "draft",
        "author",
      ],
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // 2. Reject if trying to access a draft without permission
    if (blog.draft && !draft) {
      return res.status(403).json({ error: "You cannot access draft blogs" });
    }

    // 3. Track a read (if not in edit mode)
    if (mode !== "edit") {
      const userId = req.user?.user_id;

      if (!userId) {
        console.warn("User not authenticated, skipping read tracking.");
      } else {
        await Read.create({ blog_id, user_id: userId });
      }
    }

    // 4. Get activity counts (likes, comments, reads)
    const [total_likes, total_comments, total_reads] = await Promise.all([
      Like.count({ where: { blog_id } }),
      Comment.count({ where: { blog_id } }),
      Read.count({ where: { blog_id } }),
    ]);

    // 5. Increment author's read count (if not edit mode)
    if (incrementVal && blog.author) {
      await User.increment("total_reads", { where: { user_id: blog.author } });
    }

    // 6. Return the blog data
    return res.status(200).json({
      blog: {
        ...blog.get({ plain: true }),
        total_likes,
        total_comments,
        total_reads,
      },
    });
  } catch (err) {
    console.error("Error in /get-blog:", err);
    return res.status(500).json({ error: "Failed to fetch blog" });
  }
};

export const handleLike = async (req, res) => {
  // Validate request body structure first
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { blog_id, isLiked } = req.body;
  const user_id = req.user;

  // Validate input types
  if (typeof isLiked !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Invalid isLiked value",
      error: "isLiked must be true or false",
    });
  }

  if (!blog_id || typeof blog_id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
      error: "blog_id must be a non-empty string",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const trimmedBlogId = blog_id.trim();

    // Get the blog with author info
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
      return res.status(404).json({ error: "Blog not found" });
    }

    // Get the user performing the action
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

    let result;
    let total_likes;

    if (isLiked) {
      try {
        await Like.create({ blog_id: trimmedBlogId, user_id }, { transaction });
        result = { status: "created" };

        // Create notification if user is not liking their own blog
        const blogAuthorId = blog.author || blog?.blogAuthor?.user_id;
        if (blogAuthorId && blogAuthorId !== user_id) {
          await Notification.create(
            {
              type: "like",
              blog: trimmedBlogId,
              notification_for: blogAuthorId,
              user: user_id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { transaction },
          );
        }
      } catch (createErr) {
        if (createErr.name === "SequelizeUniqueConstraintError") {
          result = { status: "already_exists" };
        } else {
          throw createErr;
        }
      }
    } else {
      // UNLIKE ACTION
      const deletedLikeCount = await Like.destroy({
        where: { blog_id: trimmedBlogId, user_id },
        transaction,
      });

      const deletedNotificationCount = await Notification.destroy({
        where: { blog: trimmedBlogId, user: user_id, type: "like" },
        transaction,
      });

      result = {
        status: deletedLikeCount > 0 ? "deleted" : "not_found",
        deletedLikes: deletedLikeCount,
        deletedNotifications: deletedNotificationCount,
      };
    }

    // Get updated total likes
    total_likes = await Like.count({
      where: { blog_id: trimmedBlogId },
      transaction,
    });
    await transaction.commit();

    // Determine final like status
    const finalLikeStatus = isLiked
      ? result.status === "created"
        ? true
        : false
      : result.status === "deleted"
        ? false
        : true;

    return res.json({
      success: true,
      total_likes,
      isLiked: finalLikeStatus,
      user: {
        user_id: user.user_id,
        fullname: user.fullname,
        username: user.username,
        profile_img: user.profile_img,
      },
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Like operation failed:", err);

    const errorResponse = {
      success: false,
      message: "Error processing like action",
    };

    if (err.name === "SequelizeValidationError") {
      errorResponse.error = "Data validation failed";
      errorResponse.details = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
    } else if (err.name === "SequelizeForeignKeyConstraintError") {
      errorResponse.error = "Invalid reference (blog or user doesn't exist)";
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

export const checkLikeStatus = async (req, res) => {
  try {
    const { blog_id } = req.body;
    const user_id = req.user;

    // Check if the user has liked this blog
    const like = await Like.findOne({
      where: { blog_id, user_id },
    });

    // Optional: Check if a notification exists for this like
    const notificationExists = await Notification.findOne({
      where: {
        user: user_id,
        type: "like",
        blog: blog_id,
      },
    });

    return res.json({
      isLiked: !!like,
      hasNotification: !!notificationExists, // Include if needed
    });
  } catch (err) {
    console.error("Check like error:", err);
    return res.status(500).json({ error: "Error checking like status" });
  }
};

// export const deleteBlog = async (req, res) => {
//   const { blog_id } = req.params;
//   const userId = req.user;
//   console.log("JWT user_id:", userId);
//   const t = await sequelize.transaction();

//   try {
//     const blog = await Blog.findOne({
//       where: { blog_id },
//       transaction: t,
//     });

//     if (!blog) {
//       await t.rollback();
//       return res.status(404).json({ message: "Blog not found" });
//     }

//     // ownership check (safe + transactional)
//     if (Number(blog.author) !== Number(userId)) {
//       console.log("Blog author:", blog.author);
//       await t.rollback();
//       return res.status(403).json({ message: "Unauthorized action" });
//     }

//     await Promise.all([
//       Comment.destroy({ where: { blog_id }, transaction: t }),
//       Like.destroy({ where: { blog_id }, transaction: t }),
//       Read.destroy({ where: { blog_id }, transaction: t }),

//       // FIXED COLUMN NAME
//       Notification.destroy({
//         where: { blog: blog_id },
//         transaction: t,
//       }),
//     ]);

//     await Blog.destroy({
//       where: { blog_id },
//       transaction: t,
//     });

//     await t.commit();

//     return res.status(200).json({ success: true });
//   } catch (err) {
//     await t.rollback();
//     console.error("Delete blog error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
