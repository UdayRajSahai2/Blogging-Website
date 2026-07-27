// server/controllers/academic.controller.js
import sequelize from "../config/db.config.js";
import {
  getUserAcademics,
  getAcademicByIdService,
  getAcademicsByUserIdService,
  createAcademicService,
  updateAcademicService,
  deleteAcademicService,
} from "../services/academic.service.js";

/* =========================
   ADD
========================= */
export const addAcademic = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const data = await createAcademicService(
      req.body,
      req.user.id,
      transaction,
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Academic record added",
      data,
    });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

/* =========================
   UPDATE
========================= */
export const updateAcademic = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const academic_id = parseInt(req.params.academic_id, 10);

    const data = await updateAcademicService(
      academic_id,
      req.user.id,
      req.body,
      transaction,
    );

    await transaction.commit();

    return res.json({
      message: "Academic record updated",
      data,
    });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

/* =========================
   DELETE
========================= */
export const deleteAcademic = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const academic_id = parseInt(req.params.academic_id, 10);

    await deleteAcademicService(academic_id, req.user.id, transaction);

    await transaction.commit();

    return res.json({ message: "Academic record deleted" });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

/* =========================
   GET MY
========================= */
export const getMyAcademics = async (req, res) => {
  try {
    const data = await getUserAcademics(req.user.id);
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch" });
  }
};

/* =========================
   GET SINGLE
========================= */
export const getAcademicById = async (req, res) => {
  try {
    const academic_id = parseInt(req.params.academic_id, 10);

    const data = await getAcademicByIdService(academic_id, req.user.id);

    return res.json({ data });
  } catch (err) {
    console.error(err); // <-- add this
    return res.status(404).json({ error: err.message });
  }
};

/* =========================
   PUBLIC
========================= */
export const getAcademicsByUserId = async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id, 10);

    const data = await getAcademicsByUserIdService(user_id);

    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};
