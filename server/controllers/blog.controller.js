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
  UserDetails,
} from "../models/associations.js";
import BlogTaxonomy from "../models/blog/BlogTaxonomy.js";
export const getUserBlogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogs = await Blog.findAll({
      where: { author: userId },
      attributes: [
        "blog_id",
        "title",
        "des",
        "banner",
        "draft",
        "status", // ADD
        "is_deleted", // ADD
        "review_note",
        "createdAt", // ADD
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ blogs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getLatestBlogs = async (req, res) => {
  let maxLimit = 7; // Default limit
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
      where: {
        status: "published",
        is_deleted: false,
      },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["profile_img", "username", "fullname"],
          include: [
            {
              model: UserDetails,
              as: "details",
              attributes: ["salutation"],
            },
          ],
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
      where: {
        status: "published",
        is_deleted: false,
      },
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
      where: {
        status: "published",
        is_deleted: false,
      },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["profile_img", "username", "fullname", "user_id"],
          include: [
            {
              model: UserDetails,
              as: "details",
              attributes: ["salutation"],
            },
          ],
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
    let whereClause = {
      status: "published",
      is_deleted: false,
    };

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
          include: [
            {
              model: UserDetails,
              as: "details",
              attributes: ["salutation"],
            },
          ],
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
    let whereClause = {
      status: "published",
      is_deleted: false,
    };

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
  const authorId = req.user.id;
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
      //  Get existing blog
      const existingBlog = await Blog.findOne({
        where: { blog_id, author: authorId },
      });

      //  BLOCK ALL edits if blog is under review
      if (existingBlog && existingBlog.status === "pending") {
        return res.status(400).json({
          error: "Blog is under review and cannot be edited",
        });
      }
      // UPDATE EXISTING BLOG
      const updatePayload = {
        title,
        des,
        banner,
        content: JSON.stringify(content),
        tags: JSON.stringify(tags),
        draft: Boolean(draft),
        publishedAt: draft ? null : undefined,
        status: draft ? "draft" : "pending", // IMPORTANT
      };

      const [updatedCount] = await Blog.update(updatePayload, {
        where: { blog_id, author: authorId },
      });

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
        // ADD THIS
        status: draft ? "draft" : "pending",
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
  const incrementVal = mode !== "edit" ? 1 : 0;

  try {
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
        "status",
        "is_deleted",
        "review_note",
      ],
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    //  soft deleted
    if (blog.is_deleted) {
      return res.status(403).json({
        error: "Blog removed",
        blog: blog.get({ plain: true }),
      });
    }

    //  not published
    if (!blog.draft && blog.status !== "published" && mode !== "edit") {
      return res.status(403).json({
        error: "Blog not public",
        blog: blog.get({ plain: true }),
      });
    }

    //  draft protection
    if (blog.draft && !draft) {
      return res.status(403).json({
        error: "Draft blog",
        blog: blog.get({ plain: true }),
      });
    }

    //  track read
    if (mode !== "edit") {
      const userId = req.user?.id;

      // Logged-in users
      if (userId) {
        const existingRead = await Read.findOne({
          where: {
            blog_id,
            user_id: userId,
          },
        });

        if (!existingRead) {
          await Read.create({
            blog_id,
            user_id: userId,
          });
        }
      }

      // Guests
      else if (!req.body.alreadyViewed) {
        await Read.create({
          blog_id,
          user_id: null,
        });
      }
    }

    const [total_likes, total_comments, total_reads] = await Promise.all([
      Like.count({ where: { blog_id } }),
      Comment.count({ where: { blog_id } }),
      Read.count({ where: { blog_id } }),
    ]);

    if (incrementVal && blog.author) {
      await User.increment("total_reads", {
        where: { user_id: blog.author },
      });
    }
    const blogData = blog.get({ plain: true });

    blogData.total_likes = total_likes;
    blogData.total_comments = total_comments;
    blogData.total_reads = total_reads;

    return res.status(200).json({
      blog: blogData,
    });
  } catch (err) {
    console.error("Error in getBlog:", err);
    return res.status(500).json({ error: "Failed to fetch blog" });
  }
};

export const handleLike = async (req, res) => {
  //  Validate request body
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { blog_id, isLiked } = req.body;
  const userId = req.user.id;

  //  Auth safety
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  //  Validate inputs
  if (typeof isLiked !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isLiked must be true or false",
    });
  }

  if (!blog_id || typeof blog_id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }

  const trimmedBlogId = blog_id.trim();
  const transaction = await sequelize.transaction();

  try {
    // ==================================================
    //  Get blog with lock
    // ==================================================
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
        message: "Blog not found",
      });
    }

    // ==================================================
    //  Verify user exists
    // ==================================================
    const user = await User.findByPk(userId, {
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

    let finalLikeStatus;

    // ==================================================
    //  LIKE
    // ==================================================
    if (isLiked) {
      try {
        await Like.create(
          {
            blog_id: trimmedBlogId,
            user_id: userId,
          },
          { transaction },
        );

        finalLikeStatus = true;

        //  Create notification (no self-like)
        const blogAuthorId = blog.author || blog?.blogAuthor?.user_id;

        if (blogAuthorId && blogAuthorId !== userId) {
          await Notification.findOrCreate({
            where: {
              type: "like",
              blog: trimmedBlogId,
              user: userId,
            },
            defaults: {
              type: "like",
              blog: trimmedBlogId,
              notification_for: blogAuthorId,
              user: userId,
            },
            transaction,
          });
        }
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          // already liked
          finalLikeStatus = true;
        } else {
          throw err;
        }
      }
    }

    // ==================================================
    //  UNLIKE
    // ==================================================
    else {
      const deletedLikeCount = await Like.destroy({
        where: {
          blog_id: trimmedBlogId,
          user_id: userId,
        },
        transaction,
      });

      await Notification.destroy({
        where: {
          blog: trimmedBlogId,
          user: userId,
          type: "like",
        },
        transaction,
      });

      finalLikeStatus = deletedLikeCount === 0;
    }

    // ==================================================
    //  Get updated count
    // ==================================================
    const total_likes = await Like.count({
      where: { blog_id: trimmedBlogId },
      transaction,
    });

    await transaction.commit();

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
    const user_id = req.user.id;

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

export const getBlogTaxonomy = async (req, res) => {
  try {
    const taxonomy = await BlogTaxonomy.findAll({
      where: {
        is_active: true,
      },

      order: [
        ["category", "ASC"],
        ["subcategory", "ASC"],
        ["sub_subcategory", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: taxonomy,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch taxonomy",
    });
  }
};
