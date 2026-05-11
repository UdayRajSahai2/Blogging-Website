import Page from "../Page.js";

const setupPageAssociations = () => {
  Page.hasMany(Page, {
    as: "children",
    foreignKey: "parent_id",
    onDelete: "CASCADE",
  });

  Page.belongsTo(Page, {
    as: "parent",
    foreignKey: "parent_id",
  });
};

export default setupPageAssociations;
