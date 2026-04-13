// server/services/academic.service.js
import UserAcademic from "../models/user/UserAcademic.js";
const normalizeTitle = (val) => {
  let v = val?.toLowerCase().trim();

  const match = v?.match(/\d+/);
  if (match) {
    const num = parseInt(match[0]);
    if (num >= 1 && num <= 12) {
      return `class ${num}`;
    }
  }

  return v;
};
/* =========================
   GET ALL (PRIVATE)
========================= */
export const getUserAcademics = async (user_id) => {
  return await UserAcademic.findAll({
    where: { user_id },
    order: [
      ["is_primary", "DESC"], // highest first
      ["is_current", "DESC"], // current study on top
      ["end_year", "DESC"], // then latest completed
      ["start_year", "DESC"], // fallback sorting
    ],
  });
};

/* =========================
   GET ONE (PRIVATE)
========================= */
export const getAcademicByIdService = async (academic_id, user_id) => {
  const academic = await UserAcademic.findOne({
    where: { academic_id, user_id },
  });

  if (!academic) throw new Error("Record not found");

  return academic;
};

/* =========================
   GET BY USER (PUBLIC)
========================= */
export const getAcademicsByUserIdService = async (user_id) => {
  if (!user_id) throw new Error("Invalid user ID");

  return await UserAcademic.findAll({
    where: { user_id },
    order: [
      ["is_primary", "DESC"], // highest first
      ["is_current", "DESC"], // current study on top
      ["end_year", "DESC"], // then latest completed
      ["start_year", "DESC"], // fallback sorting
    ],
  });
};

/* =========================
   CREATE
========================= */
export const createAcademicService = async (body, user_id, transaction) => {
  body.user_id = user_id;

  //  HANDLE CURRENT STUDY
  if (body.is_current) {
    body.end_year = null;
  }

  // 🔍 DUPLICATE CHECK
  let normalizedTitle = normalizeTitle(body.title);

  const exists = await UserAcademic.findOne({
    where: {
      user_id,
      level: body.level,
      title: normalizedTitle,
      institute_name: body.institute_name,
      end_year: body.is_current ? null : body.end_year,
    },
    transaction,
  });

  if (exists) {
    throw new Error("This academic record already exists");
  }

  // 🎓 SCHOOL LOGIC
  let missingPrevious = false;
  let suggestion = null;

  if (body.level === "School") {
    const match = normalizedTitle?.match(/\d+/);
    const currentClass = match ? parseInt(match[0]) : null;

    if (currentClass && currentClass > 1) {
      const prevClass = `class ${currentClass - 1}`;

      const existsPrev = await UserAcademic.findOne({
        where: {
          user_id,
          level: "School",
          title: prevClass,
        },
        transaction,
      });

      if (!existsPrev) {
        missingPrevious = true;
      }

      suggestion = `Add Class ${currentClass - 1} next`;
    }
  }

  // ⭐ PRIMARY LOGIC
  if (body.is_primary) {
    await UserAcademic.update(
      { is_primary: false },
      { where: { user_id }, transaction },
    );
  }

  // ✅ FORCE NORMALIZED TITLE INTO DB
  body.title = normalizedTitle;

  // ✅ CREATE
  const created = await UserAcademic.create(body, { transaction });

  // ✅ FINAL RETURN
  return {
    ...created.toJSON(),
    suggestion,
    missingPrevious,
  };
};

/* =========================
   UPDATE
========================= */
export const updateAcademicService = async (
  academic_id,
  user_id,
  body,
  transaction,
) => {
  const academic = await UserAcademic.findOne({
    where: { academic_id, user_id },
    transaction,
  });

  if (!academic) throw new Error("Record not found");

  if (Object.keys(body).length === 0) {
    throw new Error("No fields to update");
  }
  // HANDLE CURRENT STUDY
  if (body.is_current) {
    body.end_year = null;
  }
  if (body.is_primary) {
    await UserAcademic.update(
      { is_primary: false },
      { where: { user_id }, transaction },
    );
  }

  return await academic.update(body, { transaction });
};

/* =========================
   DELETE
========================= */
export const deleteAcademicService = async (
  academic_id,
  user_id,
  transaction,
) => {
  const academic = await UserAcademic.findOne({
    where: { academic_id, user_id },
    transaction,
  });

  if (!academic) throw new Error("Record not found");

  await academic.destroy({ transaction });
};
