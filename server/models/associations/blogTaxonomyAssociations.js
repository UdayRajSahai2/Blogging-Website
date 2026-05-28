// server/models/associations/blogTaxonomyAssociations.js

import Blog from "../blog/Blog.js";
import BlogTaxonomy from "../blog/BlogTaxonomy.js";

const setupBlogTaxonomyAssociations = () => {
  Blog.belongsTo(BlogTaxonomy, {
    foreignKey: "taxonomy_id",
    targetKey: "taxonomy_id",
    as: "taxonomy",
  });

  BlogTaxonomy.hasMany(Blog, {
    foreignKey: "taxonomy_id",
    sourceKey: "taxonomy_id",
    as: "blogs",
  });
};

export default setupBlogTaxonomyAssociations;
