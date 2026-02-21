import { Profession } from "../models/associations.js";
import { Op } from "sequelize";
import sequelize from "../config/db.config.js";

/**
 * Generate hierarchical profile ID based on profession hierarchy
 * Format: DDFFSS (Domain-Field-Specialty) - 6 digits total
 * Uses the codes from profession_hierarchy_soc.json structure
 * Handles both database entries and custom "Other" inputs
 */
export const generateProfileId = async (domainId, fieldId, specialtyId) => {
  try {
    if (!domainId || !fieldId || !specialtyId) {
      throw new Error("Domain ID, Field ID, and Specialty ID are all required");
    }

    let domainCode = "00";
    let fieldCode = "00";
    let specialtyCode = "00";
    let domainName = "";
    let fieldName = "";
    let specialtyName = "";

    // Handle domain (check if it's a custom "Other" input)
    if (domainId.startsWith("other:")) {
      domainName = domainId.substring(6); // Remove 'other:' prefix
      domainCode = "99"; // Use 99 for custom domains
    } else {
      const domain = await Profession.findOne({
        where: {
          profession_id: domainId,
          level: 0,
          parent_id: null,
        },
      });

      if (!domain) {
        throw new Error("Invalid domain selected");
      }
      domainCode = domain.code || "00";
      domainName = domain.name;
    }

    // Handle field (check if it's a custom "Other" input)
    if (fieldId.startsWith("other:")) {
      fieldName = fieldId.substring(6); // Remove 'other:' prefix
      fieldCode = "99"; // Use 99 for custom fields
    } else {
      const field = await Profession.findOne({
        where: {
          profession_id: fieldId,
          level: 1,
          parent_id: domainId,
        },
      });

      if (!field) {
        throw new Error(
          "Invalid field selected or not under the specified domain",
        );
      }
      fieldCode = field.code || "00";
      fieldName = field.name;
    }

    // Handle specialty (check if it's a custom "Other" input)
    if (specialtyId.startsWith("other:")) {
      specialtyName = specialtyId.substring(6); // Remove 'other:' prefix
      specialtyCode = "99"; // Use 99 for custom specialties
    } else {
      const specialty = await Profession.findOne({
        where: {
          profession_id: specialtyId,
          level: 3, // Changed to level 3 for detailed occupations
          parent_id: {
            [Op.in]: sequelize.literal(`(
              SELECT profession_id FROM Professions 
              WHERE level = 2 AND parent_id = ${fieldId}
            )`),
          },
        },
      });

      if (!specialty) {
        throw new Error(
          "Invalid specialty selected or not under the specified field",
        );
      }
      specialtyCode = specialty.code || "00";
      specialtyName = specialty.name;
    }

    // Generate the 6-digit profile_id
    const profileId = domainCode + fieldCode + specialtyCode;

    return {
      profile_id: profileId,
      profession_details: {
        domain: {
          id: domainId.startsWith("other:") ? "custom" : domainId,
          name: domainName,
          code: domainCode,
          isCustom: domainId.startsWith("other:"),
        },
        field: {
          id: fieldId.startsWith("other:") ? "custom" : fieldId,
          name: fieldName,
          code: fieldCode,
          isCustom: fieldId.startsWith("other:"),
        },
        specialty: {
          id: specialtyId.startsWith("other:") ? "custom" : specialtyId,
          name: specialtyName,
          code: specialtyCode,
          isCustom: specialtyId.startsWith("other:"),
        },
      },
    };
  } catch (error) {
    console.error("Error generating profile ID:", error);
    throw error;
  }
};

/**
 * Parse profile ID to get profession hierarchy
 */
export const parseProfileId = (profileId) => {
  try {
    if (!profileId || typeof profileId !== "string" || profileId.length !== 6) {
      throw new Error("Invalid profile ID format - must be 6 digits");
    }

    const domainCode = profileId.substring(0, 2);
    const fieldCode = profileId.substring(2, 4);
    const specialtyCode = profileId.substring(4, 6);

    return {
      domainCode,
      fieldCode,
      specialtyCode,
      hasCustomDomain: domainCode === "99",
      hasCustomField: fieldCode === "99",
      hasCustomSpecialty: specialtyCode === "99",
    };
  } catch (error) {
    console.error("Error parsing profile ID:", error);
    throw error;
  }
};

/**
 * Get profession names from profile ID
 */
export const getProfessionNamesFromProfileId = async (profileId) => {
  try {
    const {
      domainCode,
      fieldCode,
      specialtyCode,
      hasCustomDomain,
      hasCustomField,
      hasCustomSpecialty,
    } = parseProfileId(profileId);

    let domain = null;
    let field = null;
    let specialty = null;

    // Only query database if not custom
    if (!hasCustomDomain) {
      domain = await Profession.findOne({
        where: { code: domainCode, level: 0 },
      });
    }

    if (!hasCustomField) {
      field = await Profession.findOne({
        where: { code: fieldCode, level: 1 },
      });
    }

    if (!hasCustomSpecialty) {
      specialty = await Profession.findOne({
        where: { code: specialtyCode, level: 3 },
      });
    }

    return {
      domain: hasCustomDomain
        ? "Custom Domain"
        : domain
          ? domain.name
          : "Unknown",
      field: hasCustomField ? "Custom Field" : field ? field.name : "Unknown",
      specialty: hasCustomSpecialty
        ? "Custom Specialty"
        : specialty
          ? specialty.name
          : "Unknown",
    };
  } catch (error) {
    console.error("Error getting profession names from profile ID:", error);
    throw error;
  }
};
