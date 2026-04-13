import sequelize from "../config/db.config.js";
import Interest from "../models/user/Interest.js";

//  IMPORTANT (avoid mess)
// DO NOT:
// Repeat same category names again (e.g., "Technology" twice)
// DO:
// Merge properly OR expand inside existing category
const evenMoreInterests = [
  {
    name: "Technology",
    children: [
      {
        name: "Web Technologies",
        children: [
          { name: "React" },
          { name: "Node.js" },
          { name: "Next.js" },
          { name: "TypeScript" },
        ],
      },
      {
        name: "Programming Languages",
        children: [
          { name: "JavaScript" },
          { name: "Python" },
          { name: "Java" },
          { name: "C++" },
        ],
      },
    ],
  },

  {
    name: "Finance & Economy",
    children: [
      {
        name: "Finance Basics",
        children: [
          { name: "Budgeting" },
          { name: "Saving" },
          { name: "Debt Management" },
          { name: "Financial Planning" },
        ],
      },
      {
        name: "Markets",
        children: [
          { name: "Stock Trading" },
          { name: "Forex" },
          { name: "Crypto Trading" },
          { name: "Options Trading" },
        ],
      },
    ],
  },

  {
    name: "Communication",
    children: [
      {
        name: "Languages",
        children: [
          { name: "English" },
          { name: "Hindi" },
          { name: "Spanish" },
          { name: "French" },
        ],
      },
      {
        name: "Skills",
        children: [
          { name: "Public Speaking" },
          { name: "Storytelling" },
          { name: "Negotiation" },
          { name: "Presentation Skills" },
        ],
      },
    ],
  },

  {
    name: "Career & Jobs",
    children: [
      {
        name: "Tech Careers",
        children: [
          { name: "Software Engineer" },
          { name: "Data Scientist" },
          { name: "DevOps Engineer" },
          { name: "UI/UX Designer" },
        ],
      },
      {
        name: "Non-Tech Careers",
        children: [
          { name: "Marketing Manager" },
          { name: "Sales" },
          { name: "HR" },
          { name: "Consulting" },
        ],
      },
    ],
  },

  {
    name: "Travel & Exploration",
    children: [
      {
        name: "Travel Types",
        children: [
          { name: "Backpacking" },
          { name: "Luxury Travel" },
          { name: "Solo Travel" },
          { name: "Adventure Travel" },
        ],
      },
      {
        name: "Experiences",
        children: [
          { name: "Hiking" },
          { name: "Camping" },
          { name: "Road Trips" },
          { name: "Cultural Tourism" },
        ],
      },
    ],
  },

  {
    name: "Food & Culinary",
    children: [
      {
        name: "Cooking",
        children: [
          { name: "Indian Cuisine" },
          { name: "Italian Cuisine" },
          { name: "Baking" },
          { name: "Street Food" },
        ],
      },
      {
        name: "Food Interests",
        children: [
          { name: "Healthy Recipes" },
          { name: "Vegan Food" },
          { name: "Food Blogging" },
          { name: "Restaurant Reviews" },
        ],
      },
    ],
  },

  {
    name: "Mental Wellness",
    children: [
      {
        name: "Mindfulness",
        children: [
          { name: "Meditation" },
          { name: "Stress Management" },
          { name: "Self Awareness" },
          { name: "Journaling" },
        ],
      },
      {
        name: "Psychology",
        children: [
          { name: "Behavioral Psychology" },
          { name: "Emotional Intelligence" },
          { name: "Therapy" },
          { name: "Mental Health Awareness" },
        ],
      },
    ],
  },

  {
    name: "Startups & Innovation",
    children: [
      {
        name: "Startup Ecosystem",
        children: [
          { name: "Fundraising" },
          { name: "Pitching" },
          { name: "MVP Building" },
          { name: "Growth Hacking" },
        ],
      },
      {
        name: "Innovation",
        children: [
          { name: "Product Innovation" },
          { name: "Disruptive Tech" },
          { name: "Future Tech" },
          { name: "Automation" },
        ],
      },
    ],
  },
];
const moreInterests = [
  {
    name: "Arts & Culture",
    children: [
      {
        name: "Visual Arts",
        children: [
          { name: "Painting" },
          { name: "Photography" },
          { name: "Illustration" },
          { name: "Digital Art" },
        ],
      },
      {
        name: "Performing Arts",
        children: [
          { name: "Music" },
          { name: "Dance" },
          { name: "Theatre" },
          { name: "Singing" },
        ],
      },
    ],
  },

  {
    name: "Education",
    children: [
      {
        name: "Academic Learning",
        children: [
          { name: "Mathematics" },
          { name: "Physics" },
          { name: "Chemistry" },
          { name: "Biology" },
        ],
      },
      {
        name: "Online Learning",
        children: [
          { name: "MOOCs" },
          { name: "Skill Development" },
          { name: "Certifications" },
          { name: "E-learning" },
        ],
      },
    ],
  },

  {
    name: "Entertainment",
    children: [
      {
        name: "Media",
        children: [
          { name: "Movies" },
          { name: "TV Shows" },
          { name: "Anime" },
          { name: "Documentaries" },
        ],
      },
      {
        name: "Gaming",
        children: [
          { name: "PC Gaming" },
          { name: "Mobile Gaming" },
          { name: "Console Gaming" },
          { name: "Esports" },
        ],
      },
    ],
  },

  {
    name: "Lifestyle",
    children: [
      {
        name: "Daily Life",
        children: [
          { name: "Travel" },
          { name: "Food & Cooking" },
          { name: "Fashion" },
          { name: "Minimalism" },
        ],
      },
      {
        name: "Home",
        children: [
          { name: "Home Decor" },
          { name: "Interior Design" },
          { name: "Gardening" },
          { name: "DIY Projects" },
        ],
      },
    ],
  },

  {
    name: "Science & Research",
    children: [
      {
        name: "Core Sciences",
        children: [
          { name: "Astronomy" },
          { name: "Quantum Physics" },
          { name: "Genetics" },
          { name: "Neuroscience" },
        ],
      },
      {
        name: "Research",
        children: [
          { name: "Academic Research" },
          { name: "Innovation" },
          { name: "Scientific Writing" },
          { name: "Experiments" },
        ],
      },
    ],
  },

  {
    name: "Social Impact",
    children: [
      {
        name: "Community",
        children: [
          { name: "Volunteering" },
          { name: "NGOs" },
          { name: "Social Work" },
          { name: "Fundraising" },
        ],
      },
      {
        name: "Environment",
        children: [
          { name: "Sustainability" },
          { name: "Climate Change" },
          { name: "Recycling" },
          { name: "Green Energy" },
        ],
      },
    ],
  },

  {
    name: "Sports",
    children: [
      {
        name: "Outdoor Sports",
        children: [
          { name: "Football" },
          { name: "Cricket" },
          { name: "Basketball" },
          { name: "Tennis" },
        ],
      },
      {
        name: "Indoor & Fitness",
        children: [
          { name: "Table Tennis" },
          { name: "Badminton" },
          { name: "Chess" },
          { name: "Esports" },
        ],
      },
    ],
  },
];
const interests = [
  {
    name: "Design & Creative",
    children: [
      {
        name: "Design",
        children: [
          { name: "UI Design" },
          { name: "UX Design" },
          { name: "Graphic Design" },
          { name: "Motion Design" },
        ],
      },
      {
        name: "Content Creation",
        children: [
          { name: "Blogging" },
          { name: "YouTube" },
          { name: "Podcasting" },
          { name: "Copywriting" },
        ],
      },
    ],
  },

  {
    name: "Health & Fitness",
    children: [
      {
        name: "Fitness",
        children: [
          { name: "Gym Training" },
          { name: "Yoga" },
          { name: "Running" },
          { name: "Home Workouts" },
        ],
      },
      {
        name: "Nutrition",
        children: [
          { name: "Diet Planning" },
          { name: "Weight Loss" },
          { name: "Muscle Gain" },
          { name: "Healthy Eating" },
        ],
      },
    ],
  },

  {
    name: "Personal Development",
    children: [
      {
        name: "Self Growth",
        children: [
          { name: "Productivity" },
          { name: "Time Management" },
          { name: "Goal Setting" },
          { name: "Habits" },
        ],
      },
      {
        name: "Career",
        children: [
          { name: "Interview Preparation" },
          { name: "Resume Building" },
          { name: "Networking" },
          { name: "Freelancing" },
        ],
      },
    ],
  },
  ...moreInterests,
  ...evenMoreInterests,
];

const seedTree = async (nodes, parentId = null) => {
  for (const node of nodes) {
    const [created] = await Interest.findOrCreate({
      where: {
        name: node.name.trim(),
        parent_id: parentId,
      },
      defaults: {
        name: node.name.trim(),
        parent_id: parentId,
      },
    });

    if (node.children) {
      await seedTree(node.children, created.interest_id);
    }
  }
};

const seedInterests = async () => {
  try {
    await sequelize.authenticate();

    await seedTree(interests);

    console.log("✅ Hierarchical interests seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding interests:", err);
    process.exit(1);
  }
};

seedInterests();
