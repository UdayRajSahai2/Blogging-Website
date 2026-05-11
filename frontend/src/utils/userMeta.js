//frontend\src\utils\userMeta.js
//getUserMeta  is a small helper function that formats profile meta data.

export const getUserMeta = (details = {}) => {
  const { gender, marital_status, date_of_birth } = details;

  const dob = date_of_birth
    ? new Date(date_of_birth).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return {
    gender,
    marital_status,
    dob,
  };
};
