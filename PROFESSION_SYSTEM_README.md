# Profession System Documentation

## Overview

This system implements a hierarchical profession categorization based on the Standard Occupational Classification (SOC) system. Users can select their profession through a three-level hierarchy: Domain → Field → Specialty, which generates a unique 6-digit profile ID.

## Architecture

### Backend Components

1. **Database Schema** (`server/Schema/Professions.js`)
   - Hierarchical structure with `level` (0=domain, 1=field, 2=specialty)
   - `parent_id` for establishing relationships
   - `code` field for generating profile IDs

2. **Data Import** (`server/utils/import-profession-data.js`)
   - Imports profession data from `profession_hierarchy_soc.json`
   - Creates hierarchical structure in database
   - Extracts codes from SOC codes for profile ID generation

3. **Profile ID Generation** (`server/utils/profileIdGenerator.js`)
   - Generates 6-digit profile IDs: `DDFFSS` format
   - Validates profession hierarchy
   - Provides utility functions for parsing and retrieving profession details

4. **API Endpoints** (`server/server.js`)
   - `GET /professions/domains` - Get all domains
   - `GET /professions/fields/:domain_id` - Get fields for a domain
   - `GET /professions/specialties/:field_id` - Get specialties for a field
   - `GET /professions/profile/:profile_id` - Get profession details from profile ID
   - `POST /professions/import` - Import profession data (admin)
   - `GET /professions/stats` - Get profession statistics

### Frontend Components

1. **Profession Selector** (`blogging website - frontend/src/components/profession-selector.component.jsx`)
   - Cascading dropdowns for domain, field, and specialty selection
   - Real-time loading of dependent options
   - Visual feedback for selected profession path

2. **Edit Profile Integration** (`blogging website - frontend/src/pages/edit-profile.page.jsx`)
   - Integrated profession selector
   - Sends profession data to backend for profile ID generation

## Profile ID Format

The profile ID is a 6-digit code in the format `DDFFSS`:
- **DD**: 2-digit domain code (from SOC major group)
- **FF**: 2-digit field code (from SOC minor group)  
- **SS**: 2-digit specialty code (from SOC broad group)

Example: `110101` represents:
- Domain: Management Occupations (11)
- Field: Top Executives (10)
- Specialty: Chief Executives (01)

## Setup Instructions

### 1. Import Profession Data

The system automatically imports profession data on server startup if no data exists. To manually import:

```bash
# From server directory
node import-professions.js
```

Or use the API endpoint:
```bash
curl -X POST http://localhost:3000/professions/import
```

### 2. Check Import Status

```bash
curl http://localhost:3000/professions/stats
```

### 3. Frontend Integration

The profession selector is already integrated into the edit profile page. Users can:

1. Navigate to Settings → Edit Profile
2. Select their profession through the cascading dropdowns
3. Save the profile to generate their profile ID

## API Usage Examples

### Get Available Domains
```javascript
const response = await axios.get('/professions/domains');
const domains = response.data.data;
```

### Get Fields for a Domain
```javascript
const response = await axios.get(`/professions/fields/${domainId}`);
const fields = response.data.data;
```

### Get Specialties for a Field
```javascript
const response = await axios.get(`/professions/specialties/${fieldId}`);
const specialties = response.data.data;
```

### Update Profile with Profession
```javascript
const formData = {
  domain_id: selectedDomain,
  field_id: selectedField,
  specialty_id: selectedSpecialty,
  // ... other profile fields
};

const response = await axios.post('/update-profile', formData);
// Response includes generated profile_id
```

## Data Structure

### Profession Hierarchy
```
Domain (Level 0)
├── Field (Level 1)
│   ├── Specialty (Level 2)
│   └── Specialty (Level 2)
└── Field (Level 1)
    ├── Specialty (Level 2)
    └── Specialty (Level 2)
```

### Database Records
Each profession record contains:
- `profession_id`: Auto-increment primary key
- `name`: Profession name
- `level`: Hierarchy level (0, 1, or 2)
- `parent_id`: Reference to parent profession
- `code`: 2-digit code for profile ID generation

## Benefits

1. **Standardized Classification**: Based on official SOC system
2. **Unique Identification**: 6-digit profile IDs for easy reference
3. **Hierarchical Organization**: Logical grouping of related professions
4. **Scalable**: Easy to add new professions or modify existing ones
5. **User-Friendly**: Intuitive dropdown interface

## Future Enhancements

1. **Profile ID Validation**: Add checksums or validation algorithms
2. **Profession Analytics**: Track profession distribution among users
3. **Custom Professions**: Allow users to suggest new professions
4. **International Support**: Add support for other classification systems
5. **Profession Matching**: Suggest connections based on profession similarity
