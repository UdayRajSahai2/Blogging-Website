import express from "express";
import dotenv from "dotenv";
import Sequelize from "sequelize";
import sequelize from "./config/db.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./reactjs-blogging-website-ac6e9-firebase-adminsdk-fbsvc-9c580bec3f.json" assert { type: "json" };

import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";
import { Op } from 'sequelize';

// import User from "./Schema/User.js";
// import Profession from "./Schema/Professions.js";
// import Blog from "./Schema/Blog.js";

// Import models and setupAssociations from associations.js
import {
  User,
  Profession,
  Blog,
  Comment,
  Like,
  Read,
  Notification,
  setupAssociations,
} from "./Schema/associations.js";

// Set up associations
setupAssociations({ User, Blog, Comment, Notification, Profession });

// Log associations to verify they are correctly imported
console.log("User associations in server.js:", User.associations);
console.log("Blog associations in server.js:", Blog.associations);

dotenv.config();

const server = express();

// Middleware
server.use(express.json());

server.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

//setting up s3 bucket
const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "blogging-website-co",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) {
    return res.status(401).json({ error: "No access token" });
  }
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.user_id;
    console.log("Decoded User Object: ", user);
    console.log("req.user: ", req.user);
    next();
  });
};

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { user_id: user.user_id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.profile_img,
    username: user.username,
    fullname: user.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let usernameExists = await User.findOne({ where: { username } });

  if (usernameExists) {
    username += nanoid(3); // Append a 3-character random string
  }

  return username;
};

// Database Connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected!");
     // Disable alter and force for all sync operations
     const syncOptions = { 
      alter: false,  // Disable automatic table changes
      force: false   // Make sure this is false (or you'll lose data)
    };
    await User.sync(syncOptions);
    await Profession.sync(syncOptions);
    await Blog.sync(syncOptions);
    await Like.sync(syncOptions);
    await Comment.sync(syncOptions);
    await Read.sync(syncOptions);
    // await Comment.sync({ alter: true });
    // await Notification.sync({ alter: true });
    console.log("✅ All tables are ready!");
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    process.exit(1);
  }
};

connectDB();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

server.post("/signup", async (req, res) => {
  let { fullname, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "❌ Fullname must be at least 3 letters long" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "❌ Enter email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "❌ Email is invalid" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "❌ Password must be at least 12 characters long and include at least one numeric digit, one lowercase letter, one uppercase letter, and one special character.",
    });
  }

  try {
    // Hash the password
    const hashed_password = await bcrypt.hash(password, 10);
    let username = await generateUsername(email);

    // Save user to database
    let user = await User.create({
      fullname,
      email,
      password: hashed_password,
      username,
    });

    return res.status(200).json(formatDatatoSend(user));
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "❌ Email already exists" });
    }
    return res.status(500).json({ error: error.message });
  }
});
server.post("/signin", async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(403).json({ error: "❌ Email not found" });
    }
    if (!user.google_auth) {
      // Compare the entered password with the hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(403).json({ error: "❌ Incorrect password" });
      }

      return res.json(formatDatatoSend(user));
    } else {
      return res.status(403).json({
        error: "Account was created using google. Try logging in with google",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "❌ Server error" });
  }
});

server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "❌ Access token is missing" });
  }

  try {
    console.log("Received Access Token:", access_token);

    const decodedUser = await getAuth().verifyIdToken(access_token);

    if (!decodedUser) {
      throw new Error("Failed to verify token");
    }

    console.log("Decoded User:", decodedUser);

    let { email, name, picture } = decodedUser;
    picture = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ where: { email } });

    if (user && !user.google_auth) {
      return res.status(403).json({
        error:
          "This email was signed up without Google. Please log in with a password.",
      });
    }

    if (!user) {
      let username = await generateUsername(email);
      user = await User.create({
        fullname: name,
        email,
        profile_img: picture,
        username,
        google_auth: true,
        password: null,
      });
    }

    return res.status(200).json(formatDatatoSend(user));
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    return res.status(500).json({
      error:
        "❌ Failed to authenticate with Google. Try with another Google account.",
    });
  }
});

//upload image URL
server.get("/get-upload-url", (req, res) => {
  generateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post('/latest-blogs', async (req, res) => {
  let maxLimit = 5;
  let {page} = req.body;

  try {
    // Calculate offset for pagination
    const offset = (page - 1) * maxLimit;

    // Fetch all published blogs with author information
    const blogs = await Blog.findAll({
      where: { draft: false },
      include: [
        {
          model: User,
          as: 'blogAuthor',
          attributes: ['profile_img', 'username', 'fullname'],
        },
      ],
      order: [['publishedAt', 'DESC']],
      attributes: [
        'blog_id', 
        'title', 
        'des', 
        'banner', 
        'tags', 
        'publishedAt',
        'createdAt',
        'updatedAt'
      ],
       offset: offset, // Use offset instead of skip
      limit: maxLimit,
    });

    if (!blogs.length) {
      return res.status(200).json({ 
        status: 'success',
        results: 0,
        blogs: [] 
      });
    }

    const blogIds = blogs.map(blog => blog.blog_id);

    // Count likes, comments, reads, and parent comments
    const [likesCounts, commentsCounts, readsCounts, parentCommentsCounts] = await Promise.all([
      Like.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      }),
      
      Comment.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      }),
      
      Read.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      }),

      // Count only parent comments (where parent is null)
      Comment.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { 
          blog_id: blogIds,
          parent: null 
        },
        group: ['blog_id'],
        raw: true
      })
    ]);

    // Create lookup maps
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

    // Combine blog data with activity counts
    const blogsWithActivity = blogs.map(blog => {
      return {
        ...blog.get({ plain: true }),
        activity: {
          total_likes: likesMap[blog.blog_id] || 0,
          total_comments: commentsMap[blog.blog_id] || 0,
          total_reads: readsMap[blog.blog_id] || 0,
          total_parent_comments: parentCommentsMap[blog.blog_id] || 0
        }
      };
    });

    return res.status(200).json({ 
      status: 'success',
      results: blogsWithActivity.length,
      blogs: blogsWithActivity,
      pagination: {
        currentPage: parseInt(page),
        perPage: maxLimit,
        totalPages: Math.ceil(blogsWithActivity.length / maxLimit)
      }
    });

  } catch (err) {
    console.error("Error fetching latest blogs:", err);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch latest blogs',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

server.post("/all-latest-blogs-count", async (req, res) => {
  try {
    const count = await Blog.count({
      where: { draft: false }
    });
    
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});

server.get("/trending-blogs", async (req, res) => {
  let maxLimit = 5;

  try {
    // Fetch all published blogs with author information
    const blogs = await Blog.findAll({
      where: { draft: false },
      include: [
        {
          model: User,
          as: 'blogAuthor',
          attributes: ['profile_img', 'username', 'fullname', 'user_id'],
        },
      ],
      attributes: [
        'blog_id', 
        'title',  
        'publishedAt',
        'author'
      ],
      limit: maxLimit,
    });

    if (!blogs.length) {
      return res.status(200).json({ 
        status: 'success',
        results: 0,
        blogs: [] 
      });
    }

    const blogIds = blogs.map(blog => blog.blog_id);

    // Count likes, comments, reads, and parent comments
    const [likesCounts, commentsCounts, readsCounts, parentCommentsCounts] = await Promise.all([
      Like.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      }),
      
      Comment.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      }),
      
      Read.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      }),

      // Count only parent comments (where parent is null)
      Comment.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { 
          blog_id: blogIds,
          parent: null 
        },
        group: ['blog_id'],
        raw: true
      })
    ]);

    // Create lookup maps
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

    // Combine blog data with activity counts
    const blogsWithActivity = blogs.map(blog => {
      return {
        ...blog.get({ plain: true }),
        activity: {
          total_likes: likesMap[blog.blog_id] || 0,
          total_comments: commentsMap[blog.blog_id] || 0,
          total_reads: readsMap[blog.blog_id] || 0,
          total_parent_comments: parentCommentsMap[blog.blog_id] || 0
        }
      };
    });

    // Sort the blogs by trending criteria
    const trendingBlogs = blogsWithActivity.sort((a, b) => {
      // First sort by total reads (descending)
      if (b.activity.total_reads !== a.activity.total_reads) {
        return b.activity.total_reads - a.activity.total_reads;
      }
      // Then sort by total likes (descending)
      if (b.activity.total_likes !== a.activity.total_likes) {
        return b.activity.total_likes - a.activity.total_likes;
      }
      // Finally sort by published date (newest first)
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    return res.status(200).json({ 
      status: 'success',
      results: trendingBlogs.length,
      blogs: trendingBlogs 
    });

  } catch (err) {
    console.error("Error fetching trending blogs:", err);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch trending blogs',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});
server.post("/search-blogs", async (req, res) => {
  let { tag, query,author, page = 1 } = req.body;
  let maxLimit = 2;

  if (!tag && !query && !author) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Either tag,query or author parameter is required'
    });
  }

  try {
    const offset = (page - 1) * maxLimit;
    let whereClause = { draft: false };

    if (tag) {
      // For tag search (clicking on tags)
      const normalizedTag = tag.toLowerCase().trim();
      whereClause[Op.or] = [
        sequelize.where(
          sequelize.fn('JSON_SEARCH', sequelize.col('tags'), 'one', `%${normalizedTag}%`),
          { [Op.ne]: null }
        ),
        { tags: { [Op.like]: `%${normalizedTag}%` } }
      ];
    } else if (query) {
      // For query search (search box) - search in both title AND tags
      const normalizedQuery = query.toLowerCase().trim();
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${normalizedQuery}%` } },
        sequelize.where(
          sequelize.fn('JSON_SEARCH', sequelize.col('tags'), 'one', `%${normalizedQuery}%`),
          { [Op.ne]: null }
        ),
        { tags: { [Op.like]: `%${normalizedQuery}%` } }
      ];
    }
    else if (author) {
      // For author search
      whereClause.author = author;
    }

    // Rest of your existing code remains the same...
    const { count: totalBlogs, rows: blogs } = await Blog.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'blogAuthor',
        attributes: ['profile_img', 'username', 'fullname']
      }],
      attributes: ['blog_id', 'title', 'des', 'banner', 'tags', 'publishedAt'],
      order: [['publishedAt', 'DESC']],
      limit: maxLimit,
      offset: offset
    });

    if (!blogs.length) {
      return res.status(200).json({ 
        status: 'success',
        results: totalBlogs,
        blogs: [] 
      });
    }

    const blogIds = blogs.map(blog => blog.blog_id);
    
    const [likesCounts, commentsCounts, readsCounts] = await Promise.all([
      Like.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      }),
      
      Comment.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      }),
      
      Read.findAll({
        attributes: [
          'blog_id', 
          [sequelize.fn('COUNT', sequelize.col('blog_id')), 'count']
        ],
        where: { blog_id: blogIds },
        group: ['blog_id'],
        raw: true
      })
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

    const blogsWithActivity = blogs.map(blog => {
      return {
        ...blog.get({ plain: true }),
        activity: {
          total_likes: likesMap[blog.blog_id] || 0,
          total_comments: commentsMap[blog.blog_id] || 0,
          total_reads: readsMap[blog.blog_id] || 0
        }
      };
    });

    return res.status(200).json({ 
      status: 'success',
      results: totalBlogs,
      blogs: blogsWithActivity,
      pagination: {
        currentPage: parseInt(page),
        perPage: maxLimit,
        totalPages: Math.ceil(totalBlogs / maxLimit)
      }
    });

  } catch (err) {
    console.error("Error searching blogs:", err);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to search blogs',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

server.post("/search-blogs-count", async (req, res) => {
  let { tag,author, query } = req.body;

  try {
    let whereClause = { draft: false };

    if (tag) {
      const normalizedTag = tag.toLowerCase().trim();
      whereClause[Op.or] = [
        sequelize.where(
          sequelize.fn('JSON_SEARCH', sequelize.col('tags'), 'one', `%${normalizedTag}%`),
          { [Op.ne]: null }
        ),
        { tags: { [Op.like]: `%${normalizedTag}%` } }
      ];
    } else if (query) {
      const normalizedQuery = query.toLowerCase().trim();
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${normalizedQuery}%` } },
        sequelize.where(
          sequelize.fn('JSON_SEARCH', sequelize.col('tags'), 'one', `%${normalizedQuery}%`),
          { [Op.ne]: null }
        ),
        { tags: { [Op.like]: `%${normalizedQuery}%` } }
      ];
    }
    else if (author) {
      // For author search
      whereClause.author = author;
    }
    const count = await Blog.count({
      where: whereClause
    });

    return res.status(200).json({ 
      totalDocs: count 
    });

  } catch (err) {
    console.error("Error counting search blogs:", err);
    return res.status(500).json({ 
      error: "Failed to count search blogs",
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

server.post("/search-users", async (req, res) => {
  let { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const users = await User.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('username')),
        'LIKE',
        `%${query.toLowerCase()}%`
      ),
      limit: 50,
      attributes: ['fullname', 'username', 'profile_img'],
      order: [['username', 'ASC']]
    });

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ error: err.message });
  }
});

server.post("/get-profile", async (req, res) => {
  try {
      const { username } = req.body;

      // Find user and exclude sensitive fields
      const user = await User.findOne({
          where: { username },
          attributes: { 
              exclude: ['password', 'google_auth', 'updateAt'] 
          },
          include: [] // You can include associated models here if needed
      });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
  } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
  }
});


server.post("/create-blog", verifyJWT, async (req, res) => {
  let authorId = req.user;
  // console.log("Author Id is ", authorId);
  let { title, des, banner, tags, content, draft } = req.body;
  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title " });
  }

  // Validation
  if (!draft) {
    if (typeof des !== "string" || !des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }
    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it" });
    }
    if (!content.blocks || !content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }
    if (!tags.length || tags.length > 10) {
      return res
        .status(403)
        .json({
          error: "Provide tags in order to publish the blog, Maximum 10",
        });
    }
  }

  try {
    tags = tags.map((tag) => tag.toLowerCase());
    let blog_id =
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();

    // console.log("Before creating blog...");
    // Create blog with Sequelize
    const blog = await Blog.create({
      title,
      des,
      banner,
      content: JSON.stringify(content), // Store as JSON string
      tags: JSON.stringify(tags),
      author: authorId,
      blog_id,
      draft: Boolean(draft),
      publishedAt: draft ? null : new Date()
    });
    // console.log("Blog created successfully:", blog);
    // console.log("Checking author id 2nd time", authorId);
    // Increment total_posts and update blogs array for user
    const incrementVal = draft ? 0 : 1;
    await User.update(
      {
        total_posts: Sequelize.literal(`total_posts + ${incrementVal}`), // Increment total_posts
        blogs: Sequelize.fn(
          "JSON_ARRAY_APPEND",
          Sequelize.col("blogs"),
          "$",
          blog_id
        ), // Add blog_id to blogs array
      },
      { where: { user_id: authorId } }
    );
    // Return success
    return res.status(200).json({ id: blog.blog_id });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to create blog" });
  }
});

// Port Setup
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
