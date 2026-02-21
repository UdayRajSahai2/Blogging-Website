import { User, Blog, Comment, Notification } from "../models/associations.js";
import { Op } from "sequelize";
import sequelize from "../config/db.config.js";

export const checkNewNotifications = async (req, res) => {
  try {
    const userId = req.user;

    const notifications = await Notification.findAll({
      where: { notification_for: userId },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    await Notification.update(
      { seen: true },
      { where: { notification_for: userId } },
    );

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  // Validate request body structure first
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { notification_id } = req.body;
  const user_id = req.user;

  // Validate input
  if (
    !notification_id ||
    (typeof notification_id !== "string" && typeof notification_id !== "number")
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification ID",
      error: "notification_id must be a non-empty string or number",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    console.log("Processing delete notification action:", {
      notification_id,
      user_id,
    });

    // 1. Find the notification
    const notification = await Notification.findOne({
      where: {
        id: notification_id,
        notification_for: user_id, // Ensure user can only delete their own notifications
      },
      attributes: ["id", "type", "notification_for"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!notification) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error:
          "Notification not found or you don't have permission to delete it",
      });
    }

    // 2. Check if user is authorized to delete this notification
    if (notification.notification_for !== user_id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "You can only delete your own notifications",
      });
    }

    // 3. Delete the notification
    await Notification.destroy({
      where: { id: notification_id },
      transaction,
    });

    await transaction.commit();

    console.log("Notification deleted successfully:", {
      notification_id,
      user_id,
      type: notification.type,
    });

    return res.json({
      success: true,
      message: "Notification deleted successfully",
      deleted_notification_id: notification_id,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Notification deletion failed:", {
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack,
    });

    const errorResponse = {
      success: false,
      message: "Error deleting notification",
    };

    if (err.name === "SequelizeForeignKeyConstraintError") {
      errorResponse.error =
        "Cannot delete notification due to database constraints";
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

// CORRECTED: Main notifications endpoint
export const getNotifications = async (req, res) => {
  const user_id = req.user;
  const { page = 1, filter = "all", deletedDocCount = 0 } = req.body;
  const maxLimit = 10;

  try {
    const offset = Math.max(0, (page - 1) * maxLimit - deletedDocCount);

    // CORRECTED: Base where clause to properly include own replies
    let whereClause = {
      [Op.or]: [
        // Case 1: All notifications FOR the user FROM others
        {
          notification_for: user_id,
          user: { [Op.ne]: user_id },
        },
        // Case 2: Own replies (notifications where user replied to someone else's comment)
        {
          notification_for: user_id,
          user: user_id,
          type: "reply",
        },
      ],
    };

    // CORRECTED: Apply filter logic
    if (filter !== "all") {
      if (filter === "reply") {
        // Show all replies: others' replies to user + user's own replies
        whereClause = {
          notification_for: user_id,
          type: "reply",
        };
      } else {
        // For like/comment filters: only show others' notifications
        whereClause = {
          notification_for: user_id,
          type: filter,
          user: { [Op.ne]: user_id },
        };
      }
    }

    console.log(
      "Notification whereClause:",
      JSON.stringify(whereClause, null, 2),
    );
    console.log("User ID:", user_id, "Filter:", filter);

    const { count: total, rows: notifications } =
      await Notification.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "notificationUser",
            attributes: ["user_id", "username", "fullname", "profile_img"],
            required: true,
          },
          {
            model: Blog,
            as: "notificationBlog",
            attributes: ["blog_id", "title"],
            required: false,
          },
          {
            model: Comment,
            as: "notificationComment",
            attributes: ["comment_id", "comment"],
            required: false,
          },
        ],
        attributes: [
          "id",
          "type",
          "seen",
          "reply",
          "replied_on_comment",
          "user",
          "comment_id",
          "blog",
          "createdAt",
        ],
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: maxLimit,
        distinct: true,
      });

    console.log(`Found ${notifications.length} notifications`);
    console.log(
      "Notifications with ownership:",
      notifications.slice(0, 3).map((n) => ({
        id: n.id,
        type: n.type,
        user: n.user,
        notification_for: n.notification_for,
        isOwn: n.user === user_id,
      })),
    );

    const validNotifications = notifications.filter(
      (n) => n.notificationBlog !== null,
    );

    const formattedNotifications = await Promise.all(
      validNotifications.map(async (notification) => {
        const plainNotif = notification.get({ plain: true });

        let originalComment = null;

        if (plainNotif.type === "reply" && plainNotif.replied_on_comment) {
          try {
            originalComment = await Comment.findOne({
              where: { comment_id: plainNotif.replied_on_comment },
              attributes: ["comment_id", "comment"],
            });

            if (originalComment) {
              originalComment = originalComment.get({ plain: true });
            }
          } catch (err) {
            console.error("Error fetching original comment:", err);
          }
        }

        // CORRECTED: Properly identify own replies
        const isOwnReply =
          plainNotif.user === user_id && plainNotif.type === "reply";

        return {
          _id: plainNotif.id,
          type: plainNotif.type,
          seen: plainNotif.seen,
          reply: plainNotif.reply,
          replied_on_comment: plainNotif.replied_on_comment,
          original_comment: originalComment,
          createdAt: plainNotif.createdAt,
          user: plainNotif.notificationUser,
          blog: plainNotif.notificationBlog,
          comment: plainNotif.notificationComment,
          comment_id: plainNotif.comment_id,
          isOwnReply: isOwnReply,
          // Add these flags for better frontend handling
          canDelete: isOwnReply, // Only own replies can be deleted
          isDeletable: isOwnReply,
        };
      }),
    );

    // CORRECTED: Only mark others' notifications as seen (not own replies)
    const unseenOthersNotifications = validNotifications
      .filter((n) => n.user !== user_id && !n.seen)
      .map((n) => n.id);

    if (unseenOthersNotifications.length > 0) {
      await Notification.update(
        { seen: true },
        { where: { id: { [Op.in]: unseenOthersNotifications } } },
      );
    }

    return res.status(200).json({
      notifications: formattedNotifications,
      totalDocs: validNotifications.length,
      currentPage: parseInt(page),
      perPage: maxLimit,
      totalPages: Math.ceil(validNotifications.length / maxLimit),
      debug:
        process.env.NODE_ENV === "development"
          ? {
              whereClause,
              offset,
              totalFound: notifications.length,
              validCount: validNotifications.length,
              ownRepliesCount: formattedNotifications.filter(
                (n) => n.isOwnReply,
              ).length,
              othersNotificationsCount: formattedNotifications.filter(
                (n) => !n.isOwnReply,
              ).length,
            }
          : undefined,
    });
  } catch (err) {
    console.error("Error fetching notifications:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
    return res.status(500).json({
      error: "Failed to fetch notifications",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

export const getAllNotificationsCount = async (req, res) => {
  const user_id = req.user;
  const { filter = "all" } = req.body;

  try {
    let whereClause = {
      notification_for: user_id,
      [Op.or]: [
        { user: { [Op.ne]: user_id } },
        { user: user_id, type: "reply" },
      ],
    };

    if (filter !== "all") {
      if (filter === "reply") {
        whereClause = {
          notification_for: user_id,
          type: "reply",
        };
      } else {
        whereClause = {
          notification_for: user_id,
          type: filter,
          user: { [Op.ne]: user_id },
        };
      }
    }

    const count = await Notification.count({
      where: whereClause,
    });

    console.log("Notification count:", count, "for filter:", filter);

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.error("Error counting notifications:", err);
    return res.status(500).json({
      error: "Failed to count notifications",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};
