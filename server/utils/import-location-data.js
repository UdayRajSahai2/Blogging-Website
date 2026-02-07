import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Country, State, District, Block, Village } from '../Schema/associations.js';
import sequelize from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importLocationData = async () => {
  try {
    console.log('🔄 Starting location data import...');
    
    // Read the village LGD codes JSON file
    const villageDataPath = path.join(__dirname, '../data/village-lgd-codes.json');
    const villageData = JSON.parse(fs.readFileSync(villageDataPath, 'utf8'));
    
    // Always use fields.map(f => f.id) for field names
    const fieldNames = villageData.fields.map(f => f.id);
    const records = villageData.records;
    
    if (!Array.isArray(fieldNames) || !Array.isArray(records)) {
      throw new Error('Invalid JSON structure. Expected "fields" and "records" arrays.');
    }
    
    // Map each record array to an object using field names
    const mappedRecords = records.map(arr => Object.fromEntries(fieldNames.map((f, i) => [f, arr[i]])));
    console.log('First 3 mapped records:', mappedRecords.slice(0, 3));
    
    console.log(`📊 Found ${mappedRecords.length} location records to process`);
    
    // Find field indices
    const fieldIndices = {};
    fieldNames.forEach((name, idx) => { fieldIndices[name] = idx; });
    
    // Validate that all required fields exist
    const missingFields = Object.entries(fieldIndices)
      .filter(([name, index]) => index === -1)
      .map(([name]) => name);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Extract unique data for each level
    const uniqueData = {
      countries: new Set(),
      states: new Set(),
      districts: new Set(),
      blocks: new Set(),
      villages: []
    };
    const villageKeys = new Set(); // Composite key set for villages
    
    console.log('🔄 Processing records to extract unique data...');
    
    mappedRecords.forEach((record, index) => {
      // Log the first 3 records for each level
      if (index < 3) {
        console.log('Record', index + 1, record);
      }
      // Inject country_code as '356' (India) if missing
      let countryCode = record['country_code'] || '356';
      const stateCode = record['state_code'];
      const stateName = record['state_name'];
      const districtCode = record['district_code'];
      const districtName = record['district_name'];
      const blockCode = record['block_code'];
      const blockName = record['block_name'];
      const subDistrictName = record['sub_district_name'];
      const villageCode = record['village_code'];
      const villageName = record['village_name'];
      
      // Add unique countries
      if (countryCode) {
        uniqueData.countries.add(countryCode);
      }
      
      // Add unique states
      if (stateCode && stateName && countryCode) {
        uniqueData.states.add(JSON.stringify({ stateCode, stateName, countryCode }));
      } else if (index < 3) {
        console.log('Skipping state for record', index + 1, { stateCode, stateName, countryCode });
      }
      
      // Add unique districts
      if (districtCode && districtName && stateCode && countryCode) {
        uniqueData.districts.add(JSON.stringify({ districtCode, districtName, stateCode, countryCode }));
      } else if (index < 3) {
        console.log('Skipping district for record', index + 1, { districtCode, districtName, stateCode, countryCode });
      }
      
      // Add unique blocks
      if (blockCode && districtCode && stateCode && countryCode) {
        const isUrban = !blockName && subDistrictName;
        uniqueData.blocks.add(JSON.stringify({
          blockCode,
          blockName: blockName || null,
          subDistrictName: subDistrictName || null,
          districtCode,
          stateCode,
          countryCode,
          isUrban
        }));
      } else if (index < 3) {
        console.log('Skipping block for record', index + 1, { blockCode, districtCode, stateCode, countryCode });
      }
      
      // Add villages (use composite key for uniqueness)
      if (villageCode && villageName && blockCode && districtCode && stateCode && countryCode) {
        const villageKey = `${villageCode}|${blockCode}|${districtCode}|${stateCode}|${countryCode}`;
        if (!villageKeys.has(villageKey)) {
          uniqueData.villages.push({
            villageCode,
            villageName,
            blockCode,
            blockName: blockName || null,
            subDistrictCode: record['sub_district_code'] || null,
            subDistrictName: record['sub_district_name'] || null,
            districtCode,
            stateCode,
            countryCode
          });
          villageKeys.add(villageKey);
        }
      } else if (index < 3) {
        console.log('Skipping village for record', index + 1, { villageCode, villageName, blockCode, districtCode, stateCode, countryCode });
      }
      
      if ((index + 1) % 10000 === 0) {
        console.log(`📊 Processed ${index + 1}/${mappedRecords.length} records...`);
      }
    });
    
    console.log(`📊 Extracted unique data:`);
    console.log(`   Countries: ${uniqueData.countries.size}`);
    console.log(`   States: ${uniqueData.states.size}`);
    console.log(`   Districts: ${uniqueData.districts.size}`);
    console.log(`   Blocks: ${uniqueData.blocks.size}`);
    console.log(`   Villages: ${uniqueData.villages.length}`);
    
    // Import countries (assuming they're already imported, but we'll check)
    console.log('🔄 Importing countries...');
    const countriesToInsert = Array.from(uniqueData.countries).map(countryCode => ({
      country_code: countryCode,
      country_name: countryCode, // We'll use code as name for now
      is_active: true
    }));
    
    await Country.bulkCreate(countriesToInsert, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['country_name', 'is_active']
    });
    
    // Import states
    console.log('🔄 Importing states...');
    const statesToInsert = Array.from(uniqueData.states).map(stateStr => {
      const state = JSON.parse(stateStr);
      return {
        state_code: state.stateCode,
        state_name: state.stateName,
        country_code: state.countryCode,
        is_active: true
      };
    });
    
    await State.bulkCreate(statesToInsert, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['state_name', 'is_active']
    });
    
    // Import districts
    console.log('🔄 Importing districts...');
    const districtsToInsert = Array.from(uniqueData.districts).map(districtStr => {
      const district = JSON.parse(districtStr);
      return {
        district_code: district.districtCode,
        district_name: district.districtName,
        state_code: district.stateCode,
        country_code: district.countryCode,
        is_active: true
      };
    });
    
    await District.bulkCreate(districtsToInsert, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['district_name', 'is_active']
    });
    
    // Import blocks
    console.log('🔄 Importing blocks...');
    const blocksToInsert = Array.from(uniqueData.blocks).map(blockStr => {
      const block = JSON.parse(blockStr);
      return {
        block_code: block.blockCode,
        block_name: block.blockName,
        sub_district_name: block.subDistrictName,
        district_code: block.districtCode,
        state_code: block.stateCode,
        country_code: block.countryCode,
        is_urban: block.isUrban,
        is_active: true
      };
    });
    
    await Block.bulkCreate(blocksToInsert, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['block_name', 'sub_district_name', 'is_urban', 'is_active']
    });
    
    // Insert villages in batches to avoid large SQL statements
    const BATCH_SIZE = 1000;
    for (let i = 0; i < uniqueData.villages.length; i += BATCH_SIZE) {
      const batch = uniqueData.villages.slice(i, i + BATCH_SIZE);
      await Village.bulkCreate(batch, { ignoreDuplicates: true });
    }
    console.log('✅ Villages import done.');
    
    // Verify the import
    const totalCountries = await Country.count();
    const totalStates = await State.count();
    const totalDistricts = await District.count();
    const totalBlocks = await Block.count();
    const totalVillages = await Village.count();
    
    console.log('🎉 Location data import completed!');
    console.log(`📊 Final counts:`);
    console.log(`   Countries: ${totalCountries}`);
    console.log(`   States: ${totalStates}`);
    console.log(`   Districts: ${totalDistricts}`);
    console.log(`   Blocks: ${totalBlocks}`);
    console.log(`   Villages: ${totalVillages}`);
    
  } catch (error) {
    console.error('❌ Error importing location data:', error);
    throw error;
  }
};

// Run the import if this script is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname || process.argv[1] === new URL(import.meta.url).pathname.replace(/^\//, '')) {
  importLocationData()
    .then(() => {
      console.log('✅ Location data import script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Location data import script failed:', error);
      process.exit(1);
    });
}

export default importLocationData; 