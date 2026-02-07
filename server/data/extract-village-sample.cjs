const fs = require('fs');
const path = require('path');

const VILLAGE_FILE = path.join(__dirname, 'village-lgd-codes.json');
const STATE_NAME = 'DELHI';
const SAMPLE_SIZE = 30;

function main() {
  fs.readFile(VILLAGE_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    let json;
    try {
      json = JSON.parse(data);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return;
    }
    if (!json.fields || !json.records) {
      console.error('Expected "fields" and "records" in village-lgd-codes.json');
      return;
    }
    const fieldNames = json.fields.map(f => f.id);
    // Find the index for state_name
    const stateIdx = fieldNames.indexOf('state_name');
    if (stateIdx === -1) {
      console.error('state_name field not found');
      return;
    }
    // Filter for DELHI state
    const delhiRecords = json.records
      .filter(rec => rec[stateIdx] && rec[stateIdx].toUpperCase() === STATE_NAME)
      .map(rec => Object.fromEntries(fieldNames.map((f, i) => [f, rec[i]])));
    if (delhiRecords.length === 0) {
      console.log('No records found for state:', STATE_NAME);
      return;
    }
    // Print field names
    console.log('Field names:', fieldNames);
    // Print first SAMPLE_SIZE records
    console.log(`\nFirst ${SAMPLE_SIZE} records for state ${STATE_NAME}:`);
    delhiRecords.slice(0, SAMPLE_SIZE).forEach((rec, idx) => {
      console.log(`\nRecord ${idx + 1}:`);
      console.log(rec);
    });
    console.log(`\nTotal records for ${STATE_NAME}:`, delhiRecords.length);
  });
}

main(); 