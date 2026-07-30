const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { dbRun, dbGet, dbAll } = require('./db');
const { appendBlock, sha256 } = require('./blockchainService');

function hashAadhaar(aadhaar) {
    return sha256(aadhaar.toString().trim());
}

const retailerUsers = [
    { username: 'retailer_a', password: 'demo123', name: 'Agri Retail Sharma & Sons', location: 'Village North, Lucknow', pin_code: '226001', license_number: 'LIC-UP-001', allotted_quantity: 100, current_stock: 96 },
    { username: 'retailer_b', password: 'demo123', name: 'Yadav Fertilizers (Retailer B)', location: 'Village South, Lucknow', pin_code: '226002', license_number: 'LIC-UP-002', allotted_quantity: 50, current_stock: 20 },
    { username: 'retailer_c', password: 'demo123', name: 'Kisan Suvidha Center', location: 'East Zone, Kanpur', pin_code: '208001', license_number: 'LIC-UP-003', allotted_quantity: 150, current_stock: 145 },
    { username: 'retailer_d', password: 'demo123', name: 'Green Earth Fertilizers', location: 'West Market, Agra', pin_code: '282001', license_number: 'LIC-UP-004', allotted_quantity: 80, current_stock: 72 },
    { username: 'retailer_e', password: 'demo123', name: 'DAP Supply Hub', location: 'Central Hub, Varanasi', pin_code: '221001', license_number: 'LIC-UP-005', allotted_quantity: 200, current_stock: 198 },
];

const extraRetailers = [
    { name: 'Kisaan Mitra Bhandar', location: 'North Block, Prayagraj', pin_code: '211001', license_number: 'LIC-UP-006', allotted_quantity: 120, current_stock: 118 },
    { name: 'Bharat Agro Center', location: 'Meerut Road, Ghaziabad', pin_code: '201001', license_number: 'LIC-UP-007', allotted_quantity: 90, current_stock: 85 },
    { name: 'Annadata Fertilizers', location: 'Main Bazar, Gorakhpur', pin_code: '273001', license_number: 'LIC-UP-008', allotted_quantity: 110, current_stock: 107 },
    { name: 'Jai Kisan Store', location: 'Block Road, Bareilly', pin_code: '243001', license_number: 'LIC-UP-009', allotted_quantity: 75, current_stock: 71 },
    { name: 'Gram Vikas Fertilizers', location: 'Village East, Moradabad', pin_code: '244001', license_number: 'LIC-UP-010', allotted_quantity: 130, current_stock: 130 },
    { name: 'Pradhan Agri Depot', location: 'Tehsil Market, Aligarh', pin_code: '202001', license_number: 'LIC-UP-011', allotted_quantity: 160, current_stock: 158 },
    { name: 'Satyam Farm Supplies', location: 'Sector 4, Noida', pin_code: '201301', license_number: 'LIC-UP-012', allotted_quantity: 95, current_stock: 90 },
    { name: 'Shivam Agro Traders', location: 'Bypass Road, Mathura', pin_code: '281001', license_number: 'LIC-UP-013', allotted_quantity: 115, current_stock: 111 },
    { name: 'Patel Fertilizer Mart', location: 'Old Town, Jhansi', pin_code: '284001', license_number: 'LIC-UP-014', allotted_quantity: 85, current_stock: 83 },
    { name: 'Krishi Seva Kendra', location: 'Village West, Sitapur', pin_code: '261001', license_number: 'LIC-UP-015', allotted_quantity: 140, current_stock: 138 },
    { name: 'Maa Bhagwati Seeds', location: 'Chowk, Raebareli', pin_code: '229001', license_number: 'LIC-UP-016', allotted_quantity: 70, current_stock: 68 },
    { name: 'Farmers Point', location: 'GT Road, Unnao', pin_code: '209801', license_number: 'LIC-UP-017', allotted_quantity: 125, current_stock: 120 },
    { name: 'Sahara Agri Inputs', location: 'Nazirabad, Sultanpur', pin_code: '228001', license_number: 'LIC-UP-018', allotted_quantity: 88, current_stock: 86 },
    { name: 'Nayak Krishi Bhandar', location: 'Block Office Road, Faizabad', pin_code: '224001', license_number: 'LIC-UP-019', allotted_quantity: 105, current_stock: 103 },
    { name: 'Lucky Fertilizers', location: 'Tehsil Chowk, Hardoi', pin_code: '241001', license_number: 'LIC-UP-020', allotted_quantity: 145, current_stock: 142 },
];

const farmerData = [
    { username: 'farmer_ramesh', password: 'demo123', name: 'Ramesh Kumar', aadhaar: '123412341234', mobile_last4: '9999', land_size_acres: 3, khasra_id: 'KH-9999' },
    { username: 'farmer_suresh', password: 'demo123', name: 'Suresh Yadav', aadhaar: '000122223333', mobile_last4: '0001', land_size_acres: 4, khasra_id: 'KH-1001' },
    { username: 'farmer_priya', password: 'demo123', name: 'Priya Devi', aadhaar: '000222223333', mobile_last4: '0002', land_size_acres: 2, khasra_id: 'KH-1002' },
    { name: 'Mahesh Singh', aadhaar: '000322223333', mobile_last4: '0003', land_size_acres: 5, khasra_id: 'KH-1003' },
    { name: 'Kavita Patel', aadhaar: '000422223333', mobile_last4: '0004', land_size_acres: 1, khasra_id: 'KH-1004' },
    { name: 'Rajendra Prasad', aadhaar: '000522223333', mobile_last4: '0005', land_size_acres: 3, khasra_id: 'KH-1005' },
    { name: 'Sita Ram', aadhaar: '000622223333', mobile_last4: '0006', land_size_acres: 2, khasra_id: 'KH-1006' },
    { name: 'Geeta Kumari', aadhaar: '000722223333', mobile_last4: '0007', land_size_acres: 4, khasra_id: 'KH-1007' },
    { name: 'Mohan Lal', aadhaar: '000822223333', mobile_last4: '0008', land_size_acres: 1, khasra_id: 'KH-1008' },
    { name: 'Anita Yadav', aadhaar: '000922223333', mobile_last4: '0009', land_size_acres: 5, khasra_id: 'KH-1009' },
    { name: 'Vikas Tiwari', aadhaar: '001022223333', mobile_last4: '0010', land_size_acres: 3, khasra_id: 'KH-1010' },
    { name: 'Lakshmi Devi', aadhaar: '001122223333', mobile_last4: '0011', land_size_acres: 2, khasra_id: 'KH-1011' },
    { name: 'Deepak Shukla', aadhaar: '001222223333', mobile_last4: '0012', land_size_acres: 4, khasra_id: 'KH-1012' },
    { name: 'Sunita Pal', aadhaar: '001322223333', mobile_last4: '0013', land_size_acres: 1, khasra_id: 'KH-1013' },
    { name: 'Rakesh Verma', aadhaar: '001422223333', mobile_last4: '0014', land_size_acres: 3, khasra_id: 'KH-1014' },
    { name: 'Pooja Sharma', aadhaar: '001522223333', mobile_last4: '0015', land_size_acres: 2, khasra_id: 'KH-1015' },
    { name: 'Anil Kumar', aadhaar: '001622223333', mobile_last4: '0016', land_size_acres: 5, khasra_id: 'KH-1016' },
    { name: 'Rekha Singh', aadhaar: '001722223333', mobile_last4: '0017', land_size_acres: 3, khasra_id: 'KH-1017' },
    { name: 'Vijay Mishra', aadhaar: '001822223333', mobile_last4: '0018', land_size_acres: 4, khasra_id: 'KH-1018' },
    { name: 'Meena Gupta', aadhaar: '001922223333', mobile_last4: '0019', land_size_acres: 1, khasra_id: 'KH-1019' },
    { name: 'Santosh Pandey', aadhaar: '002022223333', mobile_last4: '0020', land_size_acres: 2, khasra_id: 'KH-1020' },
    { name: 'Urmila Tripathi', aadhaar: '002122223333', mobile_last4: '0021', land_size_acres: 3, khasra_id: 'KH-1021' },
    { name: 'Harish Chandra', aadhaar: '002222223333', mobile_last4: '0022', land_size_acres: 5, khasra_id: 'KH-1022' },
    { name: 'Kamla Devi', aadhaar: '002322223333', mobile_last4: '0023', land_size_acres: 1, khasra_id: 'KH-1023' },
    { name: 'Yogesh Rawat', aadhaar: '002422223333', mobile_last4: '0024', land_size_acres: 4, khasra_id: 'KH-1024' },
    { name: 'Shanti Bai', aadhaar: '002522223333', mobile_last4: '0025', land_size_acres: 2, khasra_id: 'KH-1025' },
    { name: 'Pradeep Nishad', aadhaar: '002622223333', mobile_last4: '0026', land_size_acres: 3, khasra_id: 'KH-1026' },
    { name: 'Mamta Chauhan', aadhaar: '002722223333', mobile_last4: '0027', land_size_acres: 1, khasra_id: 'KH-1027' },
    { name: 'Girish Sharma', aadhaar: '002822223333', mobile_last4: '0028', land_size_acres: 5, khasra_id: 'KH-1028' },
    { name: 'Radha Rani', aadhaar: '002922223333', mobile_last4: '0029', land_size_acres: 2, khasra_id: 'KH-1029' },
    { name: 'Mukesh Dubey', aadhaar: '003022223333', mobile_last4: '0030', land_size_acres: 4, khasra_id: 'KH-1030' },
    { name: 'Sarla Bajpai', aadhaar: '003122223333', mobile_last4: '0031', land_size_acres: 3, khasra_id: 'KH-1031' },
    { name: 'Hemant Kumar', aadhaar: '003222223333', mobile_last4: '0032', land_size_acres: 2, khasra_id: 'KH-1032' },
    { name: 'Pushpa Devi', aadhaar: '003322223333', mobile_last4: '0033', land_size_acres: 1, khasra_id: 'KH-1033' },
    { name: 'Dinesh Soni', aadhaar: '003422223333', mobile_last4: '0034', land_size_acres: 3, khasra_id: 'KH-1034' },
    { name: 'Usha Rani', aadhaar: '003522223333', mobile_last4: '0035', land_size_acres: 4, khasra_id: 'KH-1035' },
    { name: 'Narendra Pal', aadhaar: '003622223333', mobile_last4: '0036', land_size_acres: 5, khasra_id: 'KH-1036' },
    { name: 'Sarita Sahu', aadhaar: '003722223333', mobile_last4: '0037', land_size_acres: 2, khasra_id: 'KH-1037' },
    { name: 'Bhupendra Dwivedi', aadhaar: '003822223333', mobile_last4: '0038', land_size_acres: 3, khasra_id: 'KH-1038' },
    { name: 'Manju Devi', aadhaar: '003922223333', mobile_last4: '0039', land_size_acres: 1, khasra_id: 'KH-1039' },
    { name: 'Kamlesh Awasthi', aadhaar: '004022223333', mobile_last4: '0040', land_size_acres: 4, khasra_id: 'KH-1040' },
    { name: 'Sudha Singh', aadhaar: '004122223333', mobile_last4: '0041', land_size_acres: 2, khasra_id: 'KH-1041' },
    { name: 'Ashok Pathak', aadhaar: '004222223333', mobile_last4: '0042', land_size_acres: 5, khasra_id: 'KH-1042' },
    { name: 'Sheela Devi', aadhaar: '004322223333', mobile_last4: '0043', land_size_acres: 3, khasra_id: 'KH-1043' },
    { name: 'Ravi Shankar', aadhaar: '004222223333', mobile_last4: '0044', land_size_acres: 1, khasra_id: 'KH-1044' },
    { name: 'Kiran Bala', aadhaar: '004522223333', mobile_last4: '0045', land_size_acres: 2, khasra_id: 'KH-1045' },
    { name: 'Umesh Chaudhary', aadhaar: '004622223333', mobile_last4: '0046', land_size_acres: 4, khasra_id: 'KH-1046' },
    { name: 'Savita Yadav', aadhaar: '004722223333', mobile_last4: '0047', land_size_acres: 3, khasra_id: 'KH-1047' },
    { name: 'Devendra Kushwaha', aadhaar: '004822223333', mobile_last4: '0048', land_size_acres: 2, khasra_id: 'KH-1048' },
    { name: 'Sunil Srivastava', aadhaar: '004922223333', mobile_last4: '0049', land_size_acres: 5, khasra_id: 'KH-1049' },
];

async function seed() {
    console.log('🌱 Starting seed...');


    await dbRun('DELETE FROM audit_chain');
    await dbRun('DELETE FROM disputes');
    await dbRun('DELETE FROM declarations');
    await dbRun('DELETE FROM transactions');
    await dbRun('DELETE FROM farmers');
    await dbRun('DELETE FROM retailers');
    await dbRun('DELETE FROM users');
    await dbRun('DELETE FROM sqlite_sequence WHERE name IN ("audit_chain","disputes","declarations","transactions","farmers","retailers","users")');

    const adminHash = await bcrypt.hash('demo123', 10);
    await dbRun('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)', ['admin', adminHash, 'admin']);
    console.log('✅ Admin user created');

    const retailerIds = [];
    for (const r of retailerUsers) {
        const pwHash = await bcrypt.hash(r.password, 10);
        const userRes = await dbRun('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)', [r.username, pwHash, 'retailer']);
        const rRes = await dbRun(
            'INSERT INTO retailers (user_id, name, location, pin_code, license_number, allotted_quantity, current_stock) VALUES (?,?,?,?,?,?,?)',
            [userRes.lastID, r.name, r.location, r.pin_code, r.license_number, r.allotted_quantity, r.current_stock]
        );
        retailerIds.push(rRes.lastID);
    }

    for (const r of extraRetailers) {
        await dbRun(
            'INSERT INTO retailers (name, location, pin_code, license_number, allotted_quantity, current_stock) VALUES (?,?,?,?,?,?)',
            [r.name, r.location, r.pin_code, r.license_number, r.allotted_quantity, r.current_stock]
        );
    }

    console.log('✅ 20 Retailers created');

    const farmerIds = [];
    for (const f of farmerData) {
        let userId = null;
        if (f.username) {
            const pwHash = await bcrypt.hash(f.password, 10);
            const userRes = await dbRun('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)', [f.username, pwHash, 'farmer']);
            userId = userRes.lastID;
        }
        const fRes = await dbRun(
            'INSERT INTO farmers (user_id, name, aadhaar_hash, mobile_last4, land_size_acres, khasra_id) VALUES (?,?,?,?,?,?)',
            [userId, f.name, hashAadhaar(f.aadhaar), f.mobile_last4, f.land_size_acres, f.khasra_id]
        );
        farmerIds.push(fRes.lastID);
    }
    console.log('✅ 50 Farmers created');

    const retailerBId = retailerIds[1];
    for (let i = 0; i < 10; i++) {
        const farmerId = farmerIds[i % farmerIds.length];
        const blockHash = await appendBlock('TRANSACTION_VERIFIED', {
            retailer_id: retailerBId, farmer_id: farmerId, bags: 3, note: 'Seed transaction'
        });
        await dbRun(
            'INSERT INTO transactions (retailer_id, farmer_id, requested_bags, status, block_hash) VALUES (?,?,?,?,?)',
            [retailerBId, farmerId, 3, 'VERIFIED', blockHash]
        );
    }

    const retailerAId = retailerIds[0];
    const normalSales = [[2, 1], [3, 1], [4, 2]];
    for (const [fi, bags] of normalSales) {
        const blockHash = await appendBlock('TRANSACTION_VERIFIED', {
            retailer_id: retailerAId, farmer_id: farmerIds[fi], bags, note: 'Seed transaction'
        });
        await dbRun(
            'INSERT INTO transactions (retailer_id, farmer_id, requested_bags, status, block_hash) VALUES (?,?,?,?,?)',
            [retailerAId, farmerIds[fi], bags, 'VERIFIED', blockHash]
        );
    }
}

seed().then(() => setTimeout(() => process.exit(0), 500)).catch(e => { console.error(e); process.exit(1); });
