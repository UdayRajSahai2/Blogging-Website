import Country from "../locations/Country.js";
import State from "../locations/State.js";
import District from "../locations/District.js";
import Block from "../locations/Block.js";
import Village from "../locations/Village.js";
import User from "../user/User.js";
import UserAddress from "../user/UserAddress.js";
const setupLocationAssociations = () => {
  //User Locations + Address

  // Country → State
  Country.hasMany(State, {
    foreignKey: "country_code",
    sourceKey: "country_code",
  });
  State.belongsTo(Country, {
    foreignKey: "country_code",
    targetKey: "country_code",
  });

  // State → District
  State.hasMany(District, {
    foreignKey: "state_code",
    sourceKey: "state_code",
  });
  District.belongsTo(State, {
    foreignKey: "state_code",
    targetKey: "state_code",
  });

  // District → Block
  District.hasMany(Block, {
    foreignKey: "district_code",
    sourceKey: "district_code",
  });
  Block.belongsTo(District, {
    foreignKey: "district_code",
    targetKey: "district_code",
  });

  // Block → Village
  Block.hasMany(Village, { foreignKey: "block_code", sourceKey: "block_code" });
  Village.belongsTo(Block, {
    foreignKey: "block_code",
    targetKey: "block_code",
  });

  /* ================= USER ↔ ADDRESS ↔ LOCATION ================= */

  User.hasMany(UserAddress, {
    foreignKey: "user_id",
    as: "addresses",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  UserAddress.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  UserAddress.belongsTo(Country, {
    foreignKey: "country_code",
    targetKey: "country_code",
    as: "countryDetails",
  });

  UserAddress.belongsTo(State, {
    foreignKey: "state_code",
    targetKey: "state_code",
    as: "stateDetails",
  });

  UserAddress.belongsTo(District, {
    foreignKey: "district_code",
    targetKey: "district_code",
    as: "districtDetails",
  });
};
export default setupLocationAssociations;
