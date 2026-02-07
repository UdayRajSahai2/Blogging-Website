import { importProfessionData, getProfessionStats } from './utils/import-profession-data.js';
import sequelize from './config/db.js';

const runImport = async () => {
  try {
    console.log('🔄 Starting profession data import...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check current stats
    const beforeStats = await getProfessionStats();
    console.log('📊 Current profession data:', beforeStats);
    
    // Import data
    const result = await importProfessionData();
    console.log('✅ Import result:', result);
    
    // Check final stats
    const afterStats = await getProfessionStats();
    console.log('📊 Final profession data:', afterStats);
    
    console.log('🎉 Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
};

runImport();
