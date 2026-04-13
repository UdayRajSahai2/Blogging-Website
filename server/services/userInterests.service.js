import Interest from "../models/user/Interest.js";
import UserInterest from "../models/user/UserInterest.js";
import User from "../models/user/User.js";
import sequelize from "../config/db.config.js";
import { fn, col } from "sequelize";
let treeCache = null;
let treeCacheTime = 0;
// ✅ CREATE INTEREST (WITH HIERARCHY)
export const createInterest = async ({ name, parent_id = null }) => {
  const cleanName = name.trim();

  let parent = null;

  if (parent_id) {
    parent = await Interest.findByPk(parent_id);

    if (!parent) {
      throw new Error("Parent interest not found");
    }
  }

  const level = parent ? parent.level + 1 : 0;

  const [interest] = await Interest.findOrCreate({
    where: {
      name: cleanName,
      parent_id,
    },
    defaults: { level },
  });

  return interest;
};

// ✅ GET TREE (RECURSIVE)
export const getInterestTree = async () => {
  const now = Date.now();

  // cache for 5 minutes
  if (treeCache && now - treeCacheTime < 5 * 60 * 1000) {
    return treeCache;
  }

  const all = await Interest.findAll({
    where: { is_deleted: false },
    order: [["name", "ASC"]],
  });

  const map = {};
  const tree = [];

  all.forEach((i) => {
    map[i.interest_id] = { ...i.toJSON(), children: [] };
  });

  all.forEach((i) => {
    if (i.parent_id) {
      map[i.parent_id]?.children.push(map[i.interest_id]);
    } else {
      tree.push(map[i.interest_id]);
    }
  });

  treeCache = tree;
  treeCacheTime = now;

  return tree;
};

// ✅ GET ALL (FLAT WITH COUNT)
export const getAllInterests = async ({ page, limit }) => {
  const offset = (page - 1) * limit;

  return await Interest.findAndCountAll({
    where: { is_deleted: false },
    attributes: [
      "interest_id",
      "name",
      "parent_id",
      "level",
      [fn("COUNT", col("Users.user_id")), "usage_count"],
    ],
    include: [
      {
        model: User,
        attributes: [],
        through: { attributes: [] },
      },
    ],
    group: ["Interest.interest_id"],
    limit,
    offset,
    order: [["name", "ASC"]],
  });
};

// ✅ ADD USER INTERESTS
export const addUserInterests = async (
  user_id,
  interest_ids,
  transaction = null,
) => {
  if (!user_id) throw new Error("user_id is required");

  const cleanIds = [
    ...new Set(interest_ids.map((id) => Number(id)).filter(Boolean)),
  ];

  if (!cleanIds.length) return { success: true };

  const interests = await Interest.findAll({
    where: {
      interest_id: cleanIds,
      is_deleted: false,
    },
  });

  if (interests.length !== cleanIds.length) {
    throw new Error("Some interest_ids are invalid");
  }

  // 🔥 Dynamic leaf check (best)
  const children = await Interest.findAll({
    where: {
      parent_id: cleanIds,
      is_deleted: false,
    },
  });

  const parentIds = new Set(children.map((c) => c.parent_id));

  const invalid = interests.filter((i) => parentIds.has(i.interest_id));

  if (invalid.length) {
    throw new Error("Only leaf interests can be selected");
  }

  const data = cleanIds.map((id) => ({
    user_id,
    interest_id: id,
  }));

  await UserInterest.bulkCreate(data, {
    ignoreDuplicates: true,
    transaction,
  });

  return {
    success: true,
    added_count: data.length,
  };
};

// ✅ GET USER INTERESTS (WITH PATH)
export const getUserInterests = async (user_id) => {
  const user = await User.findByPk(user_id, {
    include: {
      model: Interest,
      as: "Interests",
      attributes: ["interest_id", "name", "parent_id"],
      through: { attributes: [] },
    },
  });

  const interests = user?.Interests || [];

  // attach path
  const result = await Promise.all(
    interests.map(async (i) => ({
      ...i.toJSON(),
      path: await getInterestPath(i.interest_id),
    })),
  );

  return result;
};

// ✅ REPLACE USER INTERESTS
export const replaceUserInterests = async (user_id, interest_ids) => {
  const t = await sequelize.transaction();

  try {
    await UserInterest.destroy({
      where: { user_id },
      transaction: t,
    });

    //  ADD THIS GUARD
    if (!interest_ids.length) {
      await t.commit();
      return { success: true };
    }

    await addUserInterests(user_id, interest_ids, t);

    await t.commit();
    return { success: true };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// ✅ REMOVE USER INTEREST
export const removeUserInterest = async (user_id, interest_id) => {
  await UserInterest.destroy({
    where: { user_id, interest_id },
  });

  return { success: true };
};

// ✅ DELETE INTEREST (SAFE TREE DELETE)
export const deleteInterest = async (interest_id) => {
  const children = await Interest.count({
    where: { parent_id: interest_id },
  });

  if (children > 0) {
    throw new Error("Cannot delete: has child interests");
  }

  await Interest.update({ is_deleted: true }, { where: { interest_id } });

  return { success: true };
};

// ✅ GET FULL PATH (breadcrumb)
export const getInterestPath = async (interest_id) => {
  const all = await Interest.findAll({
    where: { is_deleted: false },
    attributes: ["interest_id", "name", "parent_id"],
  });

  const map = {};
  all.forEach((i) => {
    map[i.interest_id] = i;
  });

  const path = [];
  let current = map[interest_id];

  while (current) {
    path.unshift(current.name);
    current = current.parent_id ? map[current.parent_id] : null;
  }

  return path;
};
