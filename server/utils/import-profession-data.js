import { Profession } from '../Schema/associations.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Import profession data from profession_hierarchy_soc.json
 * This will create the hierarchical structure in the database
 */
export const importProfessionData = async () => {
  try {
    console.log('🔄 Starting profession data import...');
    
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../data/profession_hierarchy_soc.json');
    const professionData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let totalImported = 0;
    
    // Process each major group (domain)
    for (const majorGroup of professionData) {
      console.log(`Processing domain: ${majorGroup.major_name}`);
      
      // Create domain (level 0)
      const [domain, domainCreated] = await Profession.findOrCreate({
        where: { 
          name: majorGroup.major_name,
          level: 0,
          parent_id: null
        },
        defaults: {
          name: majorGroup.major_name,
          level: 0,
          parent_id: null,
          code: majorGroup.major_code.replace('-', '').substring(0, 2) // Extract first 2 digits
        }
      });
      
      if (domainCreated) {
        totalImported++;
        console.log(`✅ Created domain: ${domain.name}`);
      }
      
      // Process minor groups (fields) for this domain
      for (const minorGroup of majorGroup.minor_groups) {
        console.log(`  Processing field: ${minorGroup.minor_name}`);
        
        // Create field (level 1)
        const [field, fieldCreated] = await Profession.findOrCreate({
          where: { 
            name: minorGroup.minor_name,
            level: 1,
            parent_id: domain.profession_id
          },
          defaults: {
            name: minorGroup.minor_name,
            level: 1,
            parent_id: domain.profession_id,
            code: minorGroup.minor_code.replace('-', '').substring(2, 4) // Extract next 2 digits
          }
        });
        
        if (fieldCreated) {
          totalImported++;
          console.log(`  ✅ Created field: ${field.name}`);
        }
        
                 // Process broad groups (specialties) for this field
         for (const broadGroup of minorGroup.broad_groups) {
           console.log(`    Processing specialty: ${broadGroup.broad_name}`);
           
           // Create specialty (level 2) - broad group
           const [specialty, specialtyCreated] = await Profession.findOrCreate({
             where: { 
               name: broadGroup.broad_name,
               level: 2,
               parent_id: field.profession_id
             },
             defaults: {
               name: broadGroup.broad_name,
               level: 2,
               parent_id: field.profession_id,
               code: broadGroup.broad_code.replace('-', '').substring(4, 6) // Extract last 2 digits
             }
           });
           
           if (specialtyCreated) {
             totalImported++;
             console.log(`    ✅ Created specialty: ${specialty.name}`);
           }
           
           // Process detailed occupations (level 3) for this specialty
           for (const detailedOccupation of broadGroup.detailed_occupations) {
             console.log(`      Processing detailed: ${detailedOccupation.detailed_name}`);
             
             // Create detailed occupation (level 3)
             const [detailed, detailedCreated] = await Profession.findOrCreate({
               where: { 
                 name: detailedOccupation.detailed_name,
                 level: 3,
                 parent_id: specialty.profession_id
               },
               defaults: {
                 name: detailedOccupation.detailed_name,
                 level: 3,
                 parent_id: specialty.profession_id,
                 code: detailedOccupation.detailed_code.replace('-', '').substring(6, 8) // Extract last 2 digits
               }
             });
             
             if (detailedCreated) {
               totalImported++;
               console.log(`      ✅ Created detailed: ${detailed.name}`);
             }
           }
         }
      }
    }
    
    console.log(`🎉 Profession data import completed! Total records imported: ${totalImported}`);
    return { success: true, totalImported };
    
  } catch (error) {
    console.error('❌ Error importing profession data:', error);
    throw error;
  }
};

/**
 * Clear all profession data from database
 * Must delete in order: detailed (level 3) -> specialties (level 2) -> fields (level 1) -> domains (level 0)
 */
export const clearProfessionData = async () => {
  try {
    console.log('🗑️ Clearing all profession data...');
    
    // First, update all users to have null profession_id to avoid foreign key constraints
    const { User } = await import('../Schema/associations.js');
    const usersUpdated = await User.update(
      { profession_id: null },
      { where: { profession_id: { [Op.ne]: null } } }
    );
    console.log(`🔄 Updated ${usersUpdated[0]} users to have null profession_id`);
    
    // Delete in correct order to avoid foreign key constraint issues
    // 1. Delete detailed occupations (level 3) first
    const detailedDeleted = await Profession.destroy({
      where: { level: 3 }
    });
    console.log(`🗑️ Deleted ${detailedDeleted} detailed occupations`);
    
    // 2. Delete specialties (level 2)
    const specialtiesDeleted = await Profession.destroy({
      where: { level: 2 }
    });
    console.log(`🗑️ Deleted ${specialtiesDeleted} specialties`);
    
    // 3. Delete fields (level 1)
    const fieldsDeleted = await Profession.destroy({
      where: { level: 1 }
    });
    console.log(`🗑️ Deleted ${fieldsDeleted} fields`);
    
    // 4. Delete domains (level 0)
    const domainsDeleted = await Profession.destroy({
      where: { level: 0 }
    });
    console.log(`🗑️ Deleted ${domainsDeleted} domains`);
    
    const totalDeleted = detailedDeleted + specialtiesDeleted + fieldsDeleted + domainsDeleted;
    console.log(`✅ Cleared ${totalDeleted} profession records total`);
    return { success: true, deletedCount: totalDeleted };
  } catch (error) {
    console.error('❌ Error clearing profession data:', error);
    throw error;
  }
};

/**
 * Get profession statistics
 */
export const getProfessionStats = async () => {
  try {
    const domains = await Profession.count({ where: { level: 0 } });
    const fields = await Profession.count({ where: { level: 1 } });
    const specialties = await Profession.count({ where: { level: 2 } });
    const detailed = await Profession.count({ where: { level: 3 } });
    
    return {
      domains,
      fields,
      specialties,
      detailed,
      total: domains + fields + specialties + detailed
    };
  } catch (error) {
    console.error('❌ Error getting profession stats:', error);
    throw error;
  }
};

// If this file is run directly, import the data
if (import.meta.url === `file://${process.argv[1]}`) {
  importProfessionData()
    .then(() => {
      console.log('✅ Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}
