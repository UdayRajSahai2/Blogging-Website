import User from "../user/User.js";
import UserAddress from "../user/UserAddress.js";

import Country from "../locations/Country.js";
import State from "../locations/State.js";
import District from "../locations/District.js";
import Block from "../locations/Block.js";
import Village from "../locations/Village.js";

const setupUserAddressAssociations = () => {
  /* ================= USER ↔ ADDRESS ================= */

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

  /* ================= ADDRESS ↔ LOCATION ================= */

  //  FIX: renamed aliases to avoid collision

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

  UserAddress.belongsTo(Block, {
    foreignKey: "block_code",
    targetKey: "block_code",
    as: "blockDetails",
  });

  UserAddress.belongsTo(Village, {
    foreignKey: "village_code",
    targetKey: "village_code",
    as: "villageDetails",
  });

  console.log("✅ UserAddress associations initialized");
};

export default setupUserAddressAssociations;
