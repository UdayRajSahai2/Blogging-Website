// controllers/admin/admin.controller.js

import Blog from "../../models/blog/Blog.js";
import Comment from "../../models/blog/Comment.js";
import Donation from "../../models/Donation.js";
import Donor from "../../models/Donor.js";
import User from "../../models/user/User.js";
import Role from "../../models/roles/Role.js";
import UserRole from "../../models/roles/UserRole.js";
import { Op } from "sequelize";

/* =========================
   HELPERS
========================= */

// safer ID validation
const isValidId = (id) => /^\d+$/.test(id);

/* =========================
   ADMIN STATS
========================= */

export const getAdminStats = async (req, res) => {
  try {
    const [
      users,
      blogs,
      comments,
      donations,
      totalRoles,
      pendingRoleRequests,
      assignedRoles,
    ] = await Promise.all([
      User.count(),
      Blog.count(),
      Comment.count(),
      Donation.count(),

      // 🔥 ADD THESE
      Role.count(),
      UserRole.count({ where: { status: "pending" } }),
      UserRole.count({ where: { status: "approved" } }),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers: users,
        totalBlogs: blogs,
        totalComments: comments,
        totalDonations: donations,

        // 🔥 NEW
        totalRoles,
        pendingRoleRequests,
        assignedRoles,
      },
    });
  } catch (err) {
    console.error("ADMIN stats error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch admin stats",
    });
  }
};

/* =========================
   GET USERS (PAGINATED)
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", deleted } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const whereClause = {};

    // ✅ filter logic
    if (deleted === "true") {
      whereClause.is_deleted = true;
    } else if (deleted === "false") {
      whereClause.is_deleted = false;
    }
    // else → BOTH

    // ✅ search
    if (search?.trim()) {
      whereClause[Op.or] = [
        { fullname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        "user_id",
        "fullname",
        "email",
        "system_role",
        "createdAt",
        "is_deleted", // IMPORTANT
      ],
      order: [["createdAt", "DESC"]],
      limit: parsedLimit,
      offset,
    });

    return res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (err) {
    console.error("ADMIN get users error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

export const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.is_deleted = false;
    await user.save();

    return res.json({
      success: true,
      message: "User restored successfully",
    });
  } catch (err) {
    console.error("Restore user error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =========================
   DELETE USER
========================= */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // prevent self delete
    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.is_deleted = true;
    await user.save();

    console.log("ADMIN ACTION:", {
      adminId: req.user.id,
      action: "delete_user",
      targetUserId: id,
      timestamp: new Date(),
    });

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("ADMIN delete user error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const deleteUserPermanent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete yourself",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  Safety: only allow permanent delete after soft delete
    if (!user.is_deleted) {
      return res.status(400).json({
        success: false,
        message: "User must be soft deleted first",
      });
    }

    /* ============================================================
       IMPORTANT: FINANCIAL DATA SAFETY HANDLING

       Users may be linked to donation records via Donor.

       We CANNOT delete donation records because:
       - Financial history must be preserved (audit/compliance)
       - Foreign key constraint (Donor → Donation is RESTRICT)
       - Direct deletion will FAIL and break the system

       Solution:
       - Remove donor_id reference from donations
       - Delete donor profile
       - Then safely delete user

       This ensures:
       ✔ No data loss (donations remain)
       ✔ No DB constraint errors
       ✔ Clean user removal
    ============================================================ */

    const donor = await Donor.findOne({ where: { user_id: id } });

    if (donor) {
      // Detach financial records (preserve donation history)
      await Donation.update(
        { donor_id: null },
        { where: { donor_id: donor.id } },
      );

      //  Remove donor profile
      await donor.destroy();
    }

    //  Finally delete user (CASCADE handles rest)
    await user.destroy();

    console.log("ADMIN ACTION:", {
      adminId: req.user.id,
      action: "permanent_delete_user",
      targetUserId: id,
      timestamp: new Date(),
    });

    return res.json({
      success: true,
      message: "User permanently deleted",
    });
  } catch (err) {
    console.error("Permanent delete error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =========================
   UPDATE USER ROLE
========================= */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { system_role } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!["admin", "user"].includes(system_role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // prevent self role change
    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // prevent removing last admin
    if (user.system_role === "admin" && system_role === "user") {
      const adminCount = await User.count({
        where: { system_role: "admin" },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last admin",
        });
      }
    }

    user.system_role = system_role;
    await user.save();

    console.log("ADMIN ACTION:", {
      adminId: req.user.id,
      action: "update_user_role",
      targetUserId: id,
      newRole: system_role,
      timestamp: new Date(),
    });

    return res.json({
      success: true,
      message: "User role updated",
      data: {
        user_id: user.user_id,
        system_role: user.system_role,
      },
    });
  } catch (err) {
    console.error("ADMIN update role error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =========================
   GET BLOGS (ADMIN)
========================= */
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", deleted } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const whereClause = {};

    if (deleted === "true") whereClause.is_deleted = true;
    if (deleted === "false") whereClause.is_deleted = false;

    if (search) {
      whereClause.title = {
        [Op.like]: `%${search}%`,
      };
    }

    const { rows: blogs, count: total } = await Blog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["user_id", "fullname", "email", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parsedLimit,
      offset,
    });

    return res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (err) {
    console.error("ADMIN get blogs error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =========================
   DELETE BLOG (SOFT)
========================= */
// SOFT DELETE
export const deleteBlogAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (blog.is_deleted) {
      return res.status(400).json({
        success: false,
        message: "Blog already deleted",
      });
    }

    blog.is_deleted = true;
    await blog.save();

    return res.json({
      success: true,
      message: "Blog soft deleted",
    });
  } catch (err) {
    console.error("Soft delete error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// HARD DELETE (PERMANENT)
export const deleteBlogPermanent = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Safety check (BEST PRACTICE)
    if (!blog.is_deleted) {
      return res.status(400).json({
        success: false,
        message: "Soft delete first before permanent delete",
      });
    }

    await Blog.destroy({
      where: { blog_id: id }, // IMPORTANT: your PK
    });

    return res.json({
      success: true,
      message: "Blog permanently deleted",
    });
  } catch (err) {
    console.error("Hard delete error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =========================
   UPDATE BLOG STATUS
========================= */
export const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_note } = req.body;

    if (!["draft", "pending", "published", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (blog.is_deleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot moderate deleted blog",
      });
    }

    if (status === "rejected" && !review_note?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason required",
      });
    }

    blog.status = status;

    if (status === "published") {
      blog.publishedAt = blog.publishedAt || new Date();
      blog.review_note = null;
    }

    if (status === "rejected") {
      blog.review_note = review_note.trim();
    }

    blog.reviewed_at = new Date();
    blog.reviewed_by = req.user.id || null;

    await blog.save();

    return res.json({
      success: true,
      message: "Blog status updated",
      data: blog,
    });
  } catch (err) {
    console.error("ADMIN update blog status error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =========================
   RESTORE BLOG (ADMIN)
========================= */
export const restoreBlogAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    //  Prevent restoring active blogs
    if (!blog.is_deleted) {
      return res.status(400).json({
        success: false,
        message: "Blog is already active",
      });
    }

    blog.is_deleted = false;
    await blog.save();

    return res.json({
      success: true,
      message: "Blog restored successfully",
    });
  } catch (err) {
    console.error("ADMIN restore blog error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
