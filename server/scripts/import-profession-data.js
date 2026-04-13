import { Profession } from "../models/associations.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Build hierarchical code
 */
const buildCode = (parentCode, currentPart) => {
  return parentCode ? `${parentCode}-${currentPart}` : currentPart;
};

/**
 * Import profession data (TRANSACTION SAFE)
 */
export const importProfessionData = async (transaction) => {
  try {
    console.log("🔄 Starting profession data import...");

    const jsonPath = path.join(
      __dirname,
      "../data/profession_hierarchy_soc.json",
    );

    const professionData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    let totalImported = 0;

    for (const majorGroup of professionData) {
      const domainPart = majorGroup.major_code.slice(0, 2);
      const domainCode = buildCode(null, domainPart);

      // DOMAIN (LEVEL 0)
      const [domain, domainCreated] = await Profession.findOrCreate({
        where: {
          name: majorGroup.major_name,
          parent_id: null,
        },
        defaults: {
          name: majorGroup.major_name,
          level: 0,
          parent_id: null,
          code: domainCode,
        },
        transaction,
      });

      if (domainCreated) totalImported++;

      for (const minorGroup of majorGroup.minor_groups) {
        const fieldPart = minorGroup.minor_code.slice(2, 4);
        const fieldCode = buildCode(domainCode, fieldPart);

        // FIELD (LEVEL 1)
        const [field, fieldCreated] = await Profession.findOrCreate({
          where: {
            name: minorGroup.minor_name,
            parent_id: domain.profession_id,
          },
          defaults: {
            name: minorGroup.minor_name,
            level: 1,
            parent_id: domain.profession_id,
            code: fieldCode,
          },
          transaction,
        });

        if (fieldCreated) totalImported++;

        for (const broadGroup of minorGroup.broad_groups) {
          const specialtyPart = broadGroup.broad_code.slice(4, 6);
          const specialtyCode = buildCode(fieldCode, specialtyPart);

          // SPECIALTY (LEVEL 2)
          const [specialty, specialtyCreated] = await Profession.findOrCreate({
            where: {
              name: broadGroup.broad_name,
              parent_id: field.profession_id,
            },
            defaults: {
              name: broadGroup.broad_name,
              level: 2,
              parent_id: field.profession_id,
              code: specialtyCode,
            },
            transaction,
          });

          if (specialtyCreated) totalImported++;

          for (const detailedOccupation of broadGroup.detailed_occupations) {
            const detailedPart = detailedOccupation.detailed_code.slice(-2);

            const detailedCode = buildCode(specialtyCode, detailedPart);

            // DETAILED (LEVEL 3)
            const [detailed, detailedCreated] = await Profession.findOrCreate({
              where: {
                name: detailedOccupation.detailed_name,
                parent_id: specialty.profession_id,
              },
              defaults: {
                name: detailedOccupation.detailed_name,
                level: 3,
                parent_id: specialty.profession_id,
                code: detailedCode,
              },
              transaction,
            });

            if (detailedCreated) totalImported++;
          }
        }
      }
    }

    console.log(`🎉 Import completed! Total new records: ${totalImported}`);

    return { success: true, totalImported };
  } catch (error) {
    console.error("❌ Import error:", error);
    throw error;
  }
};

/**
 * Clear profession data (TRANSACTION SAFE)
 */
export const clearProfessionData = async (transaction) => {
  try {
    console.log("🗑️ Clearing profession data...");

    const { User } = await import("../models/associations.js");

    // Remove FK references first
    await User.update(
      { profession_id: null },
      {
        where: { profession_id: { [Op.ne]: null } },
        transaction,
      },
    );

    // Delete bottom-up (safe order)
    await Profession.destroy({ where: { level: 3 }, transaction });
    await Profession.destroy({ where: { level: 2 }, transaction });
    await Profession.destroy({ where: { level: 1 }, transaction });
    await Profession.destroy({ where: { level: 0 }, transaction });

    console.log("✅ Profession data cleared");

    return { success: true };
  } catch (error) {
    console.error("❌ Clear error:", error);
    throw error;
  }
};

/**
 * Get profession statistics
 */
export const getProfessionStats = async (transaction) => {
  try {
    const domains = await Profession.count({
      where: { level: 0 },
      transaction,
    });

    const fields = await Profession.count({
      where: { level: 1 },
      transaction,
    });

    const specialties = await Profession.count({
      where: { level: 2 },
      transaction,
    });

    const detailed = await Profession.count({
      where: { level: 3 },
      transaction,
    });

    return {
      domains,
      fields,
      specialties,
      detailed,
      total: domains + fields + specialties + detailed,
    };
  } catch (error) {
    console.error("❌ Stats error:", error);
    throw error;
  }
};
