# Location Data Migration Guide

This guide explains how to migrate location data from JSON files to a normalized MySQL database structure for better performance and scalability.

## Overview

The location data has been migrated from large JSON files to a normalized database structure with the following tables:
- `countries` - Country information
- `states` - State/Province information  
- `districts` - District information
- `blocks` - Block/Zone/Ward information (handles both rural and urban areas)
- `villages` - Village/Locality information

## Database Schema

### Countries Table
```sql
CREATE TABLE countries (
  country_id INT AUTO_INCREMENT PRIMARY KEY,
  country_code VARCHAR(3) UNIQUE NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### States Table
```sql
CREATE TABLE states (
  state_id INT AUTO_INCREMENT PRIMARY KEY,
  state_code VARCHAR(2) NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  country_code VARCHAR(3) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_state_country (state_code, country_code),
  FOREIGN KEY (country_code) REFERENCES countries(country_code) ON DELETE CASCADE
);
```

### Districts Table
```sql
CREATE TABLE districts (
  district_id INT AUTO_INCREMENT PRIMARY KEY,
  district_code VARCHAR(4) NOT NULL,
  district_name VARCHAR(100) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  country_code VARCHAR(3) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_district_state_country (district_code, state_code, country_code),
  FOREIGN KEY (state_code, country_code) REFERENCES states(state_code, country_code) ON DELETE CASCADE
);
```

### Blocks Table
```sql
CREATE TABLE blocks (
  block_id INT AUTO_INCREMENT PRIMARY KEY,
  block_code VARCHAR(6) NOT NULL,
  block_name VARCHAR(100) NULL,
  sub_district_name VARCHAR(100) NULL,
  district_code VARCHAR(4) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  country_code VARCHAR(3) NOT NULL,
  is_urban BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_block_district_state_country (block_code, district_code, state_code, country_code),
  FOREIGN KEY (district_code, state_code, country_code) REFERENCES districts(district_code, state_code, country_code) ON DELETE CASCADE
);
```

### Villages Table
```sql
CREATE TABLE villages (
  village_id INT AUTO_INCREMENT PRIMARY KEY,
  village_code VARCHAR(6) NOT NULL,
  village_name VARCHAR(100) NOT NULL,
  block_code VARCHAR(6) NOT NULL,
  district_code VARCHAR(4) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  country_code VARCHAR(3) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_village_block_district_state_country (village_code, block_code, district_code, state_code, country_code),
  FOREIGN KEY (block_code, district_code, state_code, country_code) REFERENCES blocks(block_code, district_code, state_code, country_code) ON DELETE CASCADE
);
```

## Migration Steps

### 1. Run Database Migrations

First, run the Sequelize migrations to create the new tables:

```bash
cd server
npx sequelize-cli db:migrate
```

This will run the following migrations in order:
- `20250703130000-create-countries-table.cjs`
- `20250703130100-create-states-table.cjs`
- `20250703130200-create-districts-table.cjs`
- `20250703130300-create-blocks-table.cjs`
- `20250703130400-create-villages-table.cjs`

### 2. Import Location Data

Run the import script to populate all location tables:

```bash
cd server
node utils/import-all-location-data.js
```

This script will:
1. Import countries from `country_codes.json`
2. Import states, districts, blocks, and villages from `village-lgd-codes.json`
3. Handle both rural (block_name) and urban (sub_district_name) areas
4. Create proper relationships between all tables

### 3. Verify the Import

Check that the data was imported correctly:

```bash
cd server
node -e "
const { Country, State, District, Block, Village } = require('./Schema/associations.js');
(async () => {
  console.log('Countries:', await Country.count());
  console.log('States:', await State.count());
  console.log('Districts:', await District.count());
  console.log('Blocks:', await Block.count());
  console.log('Villages:', await Village.count());
})();
"
```

## API Endpoints

The backend API endpoints have been updated to use the database instead of JSON files:

### GET /api/countries
Returns all active countries.

**Response:**
```json
[
  {
    "country_code": "IND",
    "country_name": "India"
  }
]
```

### GET /api/states
Returns states, optionally filtered by country.

**Query Parameters:**
- `country_code` (optional): Filter by country code

**Response:**
```json
[
  {
    "state_code": "29",
    "state_name": "KARNATAKA",
    "country_code": "IND"
  }
]
```

### GET /api/districts
Returns districts, optionally filtered by state and country.

**Query Parameters:**
- `state_code` (optional): Filter by state code
- `country_code` (optional): Filter by country code

**Response:**
```json
[
  {
    "district_code": "2901",
    "district_name": "BANGALORE URBAN",
    "state_code": "29",
    "country_code": "IND"
  }
]
```

### GET /api/blocks
Returns blocks/zones/wards for a specific district.

**Query Parameters:**
- `district_code` (required): District code
- `state_code` (required): State code
- `country_code` (required): Country code

**Response:**
```json
[
  {
    "block_name": "BANGALORE NORTH",
    "block_code": "290101",
    "district_name": "2901",
    "is_urban": false
  },
  {
    "sub_district_name": "CENTRAL ZONE",
    "sub_district_code": "290102",
    "district_name": "2901",
    "is_urban": true
  }
]
```

### GET /api/villages
Returns villages, optionally filtered by block, district, state, and country.

**Query Parameters:**
- `block_code` (optional): Filter by block code
- `district_code` (optional): Filter by district code
- `state_code` (optional): Filter by state code
- `country_code` (optional): Filter by country code

**Response:**
```json
[
  {
    "village_code": "290101001",
    "village_name": "Village Name",
    "block_code": "290101",
    "district_code": "2901",
    "state_code": "29",
    "country_code": "IND"
  }
]
```

## Frontend Changes

The frontend has been updated to work with the new API structure:

1. **Query Parameters**: Now uses codes instead of names (e.g., `state_code` instead of `state`)
2. **Response Structure**: Updated to match the new database schema
3. **Dropdown Values**: Now stores codes instead of names for better data integrity

## Benefits of the Migration

1. **Performance**: Database queries are much faster than parsing large JSON files
2. **Scalability**: Can handle millions of location records efficiently
3. **Data Integrity**: Foreign key constraints ensure data consistency
4. **Flexibility**: Easy to add new fields or modify existing ones
5. **Caching**: Database queries can be cached for even better performance
6. **Search**: Full-text search capabilities on location names
7. **Updates**: Easy to update location data without redeploying the application

## Troubleshooting

### Migration Issues
If migrations fail, check:
1. Database connection settings in `config/config.json`
2. MySQL version compatibility
3. Database permissions

### Import Issues
If import fails:
1. Check that JSON files exist in `server/data/`
2. Verify JSON file structure
3. Check database connection and permissions
4. Look for memory issues with large files (increase Node.js memory limit if needed)

### API Issues
If API endpoints return errors:
1. Verify that location tables are populated
2. Check that associations are properly set up
3. Ensure the server is using the updated endpoints

## Rollback

If you need to rollback the changes:

1. **Drop location tables:**
```bash
cd server
npx sequelize-cli db:migrate:undo:all
```

2. **Revert server.js endpoints** to use JSON files
3. **Revert frontend changes** to use the old API structure

## Performance Optimization

For production environments, consider:

1. **Indexing**: Add additional indexes based on query patterns
2. **Caching**: Implement Redis caching for frequently accessed location data
3. **Pagination**: Add pagination to endpoints that return large datasets
4. **Connection Pooling**: Optimize database connection settings

## Support

If you encounter any issues during the migration, check:
1. The server logs for detailed error messages
2. Database logs for connection or constraint issues
3. Network connectivity between application and database 