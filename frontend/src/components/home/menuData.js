const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, "and") // handle &
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// PATH BUILDER
const addPaths = (items, parentPath = "", level = 0) => {
  return items.map((item) => {
    const slug = item.slug || slugify(item.name);

    let path;

    if (slug === "home") {
      path = "/";
    } else if (level === 0) {
      path = `/${slug}`;
    } else {
      path = `${parentPath}/${slug}`;
    }

    path = path.replace(/\/+/g, "/");

    return {
      ...item,
      path,

      // ONLY attach children if they actually exist
      ...(item.children?.length > 0 && {
        children: addPaths(item.children, path, level + 1),
      }),
    };
  });
};

//  RAW MENU (keep adding full data here)
const rawMenu = [
  { name: "Home" },
  { name: "About Us" },

  {
    name: "Products",
    children: [
      { name: "Products Info" },
      {
        name: "Post your Product",
        children: [
          { name: "Electrical Products" },
          { name: "Industrial Products" },
          { name: "Domestic Products" },
          { name: "Artefacts & Decoration" },
        ],
      },
      { name: "Brands" },
      { name: "Manufacturers" },
      { name: "Vendors" },
    ],
  },

  {
    name: "Services",
    children: [
      { name: "Services We Host" },
      { name: "Agencies Around" },
      { name: "Post Your Services" },
      {
        name: "Household Services",
        children: [
          { name: "Electrician" },
          { name: "Plumbing" },
          { name: "AC Repair" },
          { name: "Maid Services" },
          { name: "Beautician / Saloon Services" },
          { name: "Home Tuitions" },
        ],
      },
      { name: "Security & Martial Services" },
      { name: "Delivery Services" },
      { name: "Secure Repository" },
      { name: "Consultancy" },
      { name: "Certification" },
    ],
  },
  {
    name: "Education",
    children: [
      { name: "Our Initiatives on Education" },
      {
        name: "Enrollment",
        children: [
          { name: "ECCE" },
          { name: "Primary Education" },
          { name: "Secondary Education" },
          { name: "Hr./Sr. Secondary" },
          { name: "Graduation" },
          { name: "Post Graduation & Fellowship" },
          { name: "Overseas Studies" },
          { name: "Free Coaching" },
          { name: "Civil Services" },
          { name: "State Services" },
          { name: "Communication Class" },
          { name: "Personality Development" },
        ],
      },
      {
        name: "Scholarships",
        children: [
          { name: "Pre-Matric" },
          { name: "Post-Matric" },
          { name: "NMMSS" },
          { name: "PM-USP" },
          { name: "Top Class Scholarship" },
          { name: "PM Research Fellowship" },
          { name: "National Research Fellowship" },
        ],
      },
      { name: "Connect Live" },
      { name: "Download Lectures" },
      { name: "Our Courses" },
      { name: "Course Selection Test" },
      { name: "International Initiatives" },
      { name: "Educate Your Child Abroad" },
      { name: "Mock Tests" },
    ],
  },
  {
    name: "Blogs",
    children: [
      { name: "Social" },
      { name: "Political" },
      { name: "Corruption" },
      {
        name: "Injustice",
        children: [
          { name: "Education" },
          { name: "Employment" },
          { name: "Health" },
        ],
      },
      { name: "Women & Children" },
    ],
  },

  {
    name: "Jobs / Employment",
    children: [
      { name: "Employment Scenario" },
      { name: "Employment in Private" },
      { name: "Job Openings" },
      { name: "Post Your Jobs" },
      { name: "Post Your Resume" },
      { name: "Apply to Job" },
      { name: "Career with Us" },
      { name: "Competitive Exams" },
    ],
  },
  {
    name: "Donate",
    children: [
      { name: "Vision & Mission" },
      { name: "Our Initiatives" },
      { name: "Our Schemes" },
      { name: "Payback to Society" },
      { name: "Locate Our Centers" },
      { name: "Accounts / QR Code" },
      {
        name: "Donate For",
        children: [
          { name: "Educate Children" },
          { name: "Support Your City" },
          { name: "Old Age Home" },
          { name: "Support Job Applicants" },
        ],
      },
    ],
  },
  {
    name: "Books & Articles",
    children: [
      { name: "Books" },
      { name: "Articles" },
      { name: "Magazine" },
      { name: "Blogs" },
    ],
  },

  {
    name: "Sports",
    children: [
      { name: "Hockey" },
      { name: "Martial Arts" },
      {
        name: "Cricket",
        children: [
          { name: "One Day" },
          { name: "IPL" },
          { name: "Test Matches" },
        ],
      },
    ],
  },

  {
    name: "Entertainment",
    children: [
      { name: "Films" },
      {
        name: "Music",
        children: [
          { name: "Old Melodies" },
          { name: "Ghazals" },
          { name: "Latest" },
        ],
      },
      { name: "Songs" },
      { name: "Celebrity Talk" },
    ],
  },

  {
    name: "Helpline",
    children: [
      { name: "Finance Support" },
      { name: "Blood Bank" },
      { name: "Land Bank" },
      { name: "Lodge Complaint" },
      { name: "Connect Volunteers" },
      { name: "Logistics Near You" },
      { name: "Helpline Number" },
      { name: "Drop a Message" },
      { name: "Share Incident Videos" },
      {
        name: "Legal Warriors",
        children: [
          { name: "Criminal" },
          { name: "Revenue" },
          { name: "Atrocities" },
        ],
      },
    ],
  },

  {
    name: "Matrimony",
    children: [
      { name: "Fresh Marriage" },
      { name: "Re-Marriage" },
      { name: "Locate a Match" },
      {
        name: "Enroll for Marriage",
        children: [
          { name: "Register Grooms" },
          { name: "Register Brides" },
          { name: "Search Matches" },
        ],
      },
      { name: "Verifications" },
    ],
  },

  {
    name: "Tours & Travel",
    children: [
      { name: "Pilgrimage Travel" },
      { name: "India Tours" },
      {
        name: "Overseas Tours",
        children: [
          { name: "Europe 10D/9N" },
          { name: "Singapore/Thailand/Malaysia 7D/6N" },
        ],
      },
    ],
  },
  {
    name: "Chats / Forums",
    children: [
      { name: "Chats" },
      { name: "Discussion" },
      { name: "Webinar" },
      { name: "VC" },
      { name: "WebEx" },
    ],
  },
  {
    name: "Science & Technology",
    children: [
      { name: "Drone Systems" },
      { name: "Solar PV System" },
      { name: "Laser Technology" },
      {
        name: "Metro System",
        children: [
          { name: "Architecture" },
          { name: "Structure" },
          { name: "E&M Services" },
          { name: "Rail Systems" },
          { name: "Electric Traction System" },
          { name: "Signalling System" },
          { name: "Communication System" },
          { name: "AFC Systems" },
          { name: "PSD Systems" },
          { name: "Rolling Stock Systems" },
          { name: "Maintenance Depot" },
        ],
      },
      { name: "High Speed Rail" },
    ],
  },
  {
    name: "Events",
    children: [
      { name: "E-Fair / E-Show" },
      { name: "Event Management" },
      { name: "Social Events Around You" },
      { name: "Exhibitions Around You" },
      { name: "Post Trending Events" },
      {
        name: "Our Events",
        children: [
          { name: "Upcoming Events" },
          { name: "Past Events" },
          { name: "Events Around You" },
        ],
      },
    ],
  },
  {
    name: "Quick Estimate",
    children: [
      { name: "Execution Agencies Around" },
      { name: "Work Estimate" },
      { name: "Execution of Works" },
      { name: "Inspections" },
      { name: "Testing" },
      { name: "Maintenance & Repair" },
      { name: "Certifications" },
    ],
  },

  {
    name: "Budget",
    children: [
      { name: "Learn Budget" },
      { name: "Heads of Budget" },
      { name: "Demand for Grants" },
      { name: "Budget for Infrastructure" },
      {
        name: "Social Sector",
        children: [
          { name: "Education Budget" },
          { name: "Health Budget" },
          { name: "Rural Development" },
          { name: "Agriculture" },
        ],
      },
    ],
  },

  {
    name: "Eco Empowerment",
    children: [
      { name: "GOI Financial Schemes" },
      { name: "MSME Schemes" },
      { name: "Entrepreneurship Promotion" },
      { name: "Procurement through GEM" },
      { name: "PMEGP" },
    ],
  },

  {
    name: "Tenders / Projects",
    children: [
      { name: "Infrastructure Projects" },
      { name: "Metro Projects" },
      { name: "Railways" },
      { name: "Tenders" },
    ],
  },

  {
    name: "News / Discounts",
    children: [
      { name: "News Trending" },
      { name: "Today's Weather" },
      { name: "Today's AQI Around You" },
      { name: "Global Indexes" },
      { name: "New Launches" },
      { name: "Trending Products" },
      { name: "Trending Services" },
      { name: "People Trending" },
      { name: "Events Trending" },
      { name: "Blogs Trending" },
    ],
  },

  {
    name: "Our Performers",
    children: [
      { name: "Performance Parameters" },
      { name: "All India Rankers" },
      { name: "Top 5 Performers" },
      { name: "Top 100 Leaders & Performers" },
      { name: "Regional Performers" },
      { name: "Unit Performers" },
    ],
  },

  {
    name: "Health",
    children: [
      { name: "Right to Health" },
      { name: "Global Health Indices" },
      { name: "Health Budget" },
      { name: "Health Infrastructure Norms" },
      { name: "Health Infrastructure Provisions" },
      { name: "Doctors Shortage" },
    ],
  },

  {
    name: "Art & Culture",
    children: [
      { name: "Indian Arts" },
      {
        name: "Culture",
        children: [
          { name: "Religions" },
          { name: "Constitutional Freedom" },
          { name: "Religious Teachings" },
          { name: "Religious Places" },
        ],
      },
    ],
  },

  {
    name: "Advertise",
    children: [
      { name: "We Advertise for No Profit" },
      { name: "Our Presence" },
      {
        name: "Our Rates",
        children: [
          { name: "Home Page" },
          { name: "Signup Page" },
          { name: "Other Pages" },
        ],
      },
    ],
  },

  {
    name: "Connect Us",
    children: [
      { name: "Our Presence" },
      { name: "Locate in Your State" },
      { name: "Support in Your Districts" },
      { name: "Our Wellwishers" },
      { name: "Enroll with Us" },
      { name: "Locate Your Interest" },
    ],
  },
];

const menuData = addPaths(rawMenu);
export default menuData;
