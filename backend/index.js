require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { dbRun, dbGet, dbAll } = require('./db');
const { appendBlock, verifyChain, sha256 } = require('./blockchainService');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dap_portal_jwt_secret_2024';

const authenticateJWT = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        next();
    } catch { res.status(403).json({ error: 'Invalid or expired token' }); }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
};


app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) return res.status(401).json({ error: 'Invalid username or password' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

        let profileId = null;
        if (user.role === 'retailer') {
            const r = await dbGet('SELECT id FROM retailers WHERE user_id = ?', [user.id]);
            profileId = r?.id;
        } else if (user.role === 'farmer') {
            const f = await dbGet('SELECT id FROM farmers WHERE user_id = ?', [user.id]);
            profileId = f?.id;
        }

        const token = jwt.sign({ id: user.id, role: user.role, profileId, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, role: user.role, profileId, username: user.username });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', authenticateJWT, async (req, res) => {
    res.json({ id: req.user.id, role: req.user.role, profileId: req.user.profileId, username: req.user.username });
});

app.get('/api/retailers', async (req, res) => {
    try {
        const { pin_code } = req.query;
        let sql = 'SELECT id, name, location, pin_code, current_stock, allotted_quantity FROM retailers';
        const params = [];
        if (pin_code) { sql += ' WHERE pin_code = ?'; params.push(pin_code); }
        sql += ' ORDER BY name ASC';
        res.json({ retailers: await dbAll(sql, params) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/retailers/:id/public', async (req, res) => {
    try {
        const r = await dbGet('SELECT id, name, location, pin_code, current_stock, allotted_quantity FROM retailers WHERE id = ?', [req.params.id]);
        if (!r) return res.status(404).json({ error: 'Retailer not found' });
        res.json({ retailer: r });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/farmers/lookup', async (req, res) => {
    try {
        const { aadhaar } = req.body;
        if (!aadhaar || aadhaar.length < 12) return res.status(400).json({ error: 'Invalid Aadhaar number' });
        const hash = sha256(aadhaar.toString().trim());
        const farmer = await dbGet('SELECT id, name, mobile_last4, land_size_acres, khasra_id FROM farmers WHERE aadhaar_hash = ?', [hash]);
        if (!farmer) return res.status(404).json({ error: 'Farmer not found. Please check your Aadhaar number.' });
        res.json({ farmer, eligible_bags: Math.floor(farmer.land_size_acres) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/farmers/me', authenticateJWT, requireRole('farmer'), async (req, res) => {
    try {
        const f = await dbGet('SELECT id, name, mobile_last4, land_size_acres, khasra_id FROM farmers WHERE id = ?', [req.user.profileId]);
        if (!f) return res.status(404).json({ error: 'Farmer profile not found' });
        res.json({ farmer: f, eligible_bags: Math.floor(f.land_size_acres) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/farmers/me/transactions', authenticateJWT, requireRole('farmer'), async (req, res) => {
    try {
        const txs = await dbAll(
            `SELECT t.id, t.requested_bags, t.status, t.block_hash, t.timestamp,
              r.name as retailer_name, r.location as retailer_location
       FROM transactions t JOIN retailers r ON t.retailer_id = r.id
       WHERE t.farmer_id = ? ORDER BY t.timestamp DESC`,
            [req.user.profileId]
        );
        res.json({ transactions: txs });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.post('/api/transactions/book', authenticateJWT, requireRole('farmer'), async (req, res) => {
    try {
        const { retailer_id, requested_bags } = req.body;
        const farmer_id = req.user.profileId;
        if (!farmer_id) return res.status(400).json({ error: 'Farmer profile not found for this account.' });

        const farmer = await dbGet('SELECT land_size_acres FROM farmers WHERE id = ?', [farmer_id]);
        const eligible = Math.floor(farmer.land_size_acres);
        if (requested_bags > eligible) return res.status(400).json({ error: `You are eligible for max ${eligible} bags based on your land size.` });

        const retailer = await dbGet('SELECT current_stock FROM retailers WHERE id = ?', [retailer_id]);
        if (!retailer) return res.status(404).json({ error: 'Retailer not found' });
        if (retailer.current_stock < requested_bags) return res.status(400).json({ error: 'Insufficient stock at this retailer.' });

        const result = await dbRun(
            'INSERT INTO transactions (retailer_id, farmer_id, requested_bags, status) VALUES (?,?,?,?)',
            [retailer_id, farmer_id, requested_bags, 'PENDING']
        );
        res.json({ transaction_id: result.lastID, otp: '123456', message: 'OTP sent to your registered mobile.' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/transactions/verify', authenticateJWT, requireRole('farmer'), async (req, res) => {
    try {
        const { transaction_id, otp } = req.body;
        if (otp !== '123456') return res.status(400).json({ error: 'Invalid OTP. Please try again.' });

        const tx = await dbGet('SELECT * FROM transactions WHERE id = ? AND status = ?', [transaction_id, 'PENDING']);
        if (!tx) return res.status(404).json({ error: 'Transaction not found or already processed.' });
        if (tx.farmer_id !== req.user.profileId) return res.status(403).json({ error: 'Unauthorized transaction.' });

        // Append to blockchain
        const blockHash = await appendBlock('TRANSACTION_VERIFIED', {
            transaction_id: tx.id, retailer_id: tx.retailer_id, farmer_id: tx.farmer_id,
            bags: tx.requested_bags, timestamp: new Date().toISOString()
        });

        await dbRun('UPDATE transactions SET status = ?, block_hash = ? WHERE id = ?', ['VERIFIED', blockHash, transaction_id]);
        await dbRun('UPDATE retailers SET current_stock = current_stock - ? WHERE id = ?', [tx.requested_bags, tx.retailer_id]);

        res.json({ success: true, block_hash: blockHash, message: 'Purchase confirmed and anchored on blockchain.' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/retailers/me', authenticateJWT, requireRole('retailer'), async (req, res) => {
    try {
        const r = await dbGet('SELECT * FROM retailers WHERE id = ?', [req.user.profileId]);
        if (!r) return res.status(404).json({ error: 'Retailer profile not found' });
        const sold = await dbGet('SELECT SUM(requested_bags) as total FROM transactions WHERE retailer_id = ? AND status = ?', [r.id, 'VERIFIED']);
        res.json({ retailer: r, total_sold: sold?.total || 0 });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.get('/api/retailers/me/transactions', authenticateJWT, requireRole('retailer'), async (req, res) => {
    try {
        const txs = await dbAll(
            `SELECT t.id, t.requested_bags, t.status, t.block_hash, t.timestamp,
              f.id as farmer_id
       FROM transactions t JOIN farmers f ON t.farmer_id = f.id
       WHERE t.retailer_id = ? ORDER BY t.timestamp DESC`,
            [req.user.profileId]
        );
        res.json({ transactions: txs });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/retailers/me/declarations', authenticateJWT, requireRole('retailer'), async (req, res) => {
    try {
        const decls = await dbAll('SELECT * FROM declarations WHERE retailer_id = ? ORDER BY timestamp DESC', [req.user.profileId]);
        res.json({ declarations: decls });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/retailers/me/declare', authenticateJWT, requireRole('retailer'), async (req, res) => {
    try {
        const retailer_id = req.user.profileId;
        const { declared_stock, photo_placeholder, geo_tag } = req.body;

        const retailer = await dbGet('SELECT allotted_quantity FROM retailers WHERE id = ?', [retailer_id]);
        const soldRow = await dbGet('SELECT SUM(requested_bags) as total FROM transactions WHERE retailer_id = ? AND status = ?', [retailer_id, 'VERIFIED']);
        const totalSold = soldRow?.total || 0;
        const expectedStock = retailer.allotted_quantity - totalSold;
        const isFlagged = parseInt(declared_stock) !== expectedStock;
        const discrepancy = isFlagged ? expectedStock - parseInt(declared_stock) : 0;

        const blockHash = await appendBlock('DECLARATION_SUBMITTED', {
            retailer_id, declared_stock, expected_stock: expectedStock,
            discrepancy, is_flagged: isFlagged, timestamp: new Date().toISOString()
        });

        await dbRun(
            'INSERT INTO declarations (retailer_id, declared_stock, expected_stock, discrepancy, is_flagged, photo_placeholder, geo_tag, block_hash) VALUES (?,?,?,?,?,?,?,?)',
            [retailer_id, declared_stock, expectedStock, discrepancy, isFlagged ? 1 : 0, photo_placeholder || null, geo_tag || null, blockHash]
        );

        if (isFlagged) {
            await dbRun('UPDATE retailers SET trust_score = MAX(0, trust_score - 20) WHERE id = ?', [retailer_id]);
        }

        res.json({
            success: true, isFlagged, expectedStock, declaredStock: parseInt(declared_stock), discrepancy, block_hash: blockHash,
            message: isFlagged ? 'Discrepancy detected! Flagged to Agriculture Department.' : 'Declaration accepted. Records match.'
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/disputes', authenticateJWT, requireRole('retailer', 'farmer'), async (req, res) => {
    try {
        const { retailer_id, subject, description } = req.body;
        await dbRun('INSERT INTO disputes (retailer_id, raised_by, subject, description) VALUES (?,?,?,?)',
            [retailer_id || req.user.profileId, req.user.id, subject, description]);
        res.json({ success: true, message: 'Dispute raised successfully.' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/flags', authenticateJWT, requireRole('admin'), async (req, res) => {
    try {
        const flags = await dbAll(`
      SELECT d.id, d.timestamp, d.expected_stock, d.declared_stock, d.discrepancy, d.block_hash,
             r.name as retailer_name, r.id as retailer_id, r.trust_score, r.location
      FROM declarations d JOIN retailers r ON d.retailer_id = r.id
      WHERE d.is_flagged = 1 ORDER BY d.timestamp DESC
    `);
        res.json({ flags });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/stats', authenticateJWT, requireRole('admin'), async (req, res) => {
    try {
        const retailers = await dbAll('SELECT id, name, trust_score, allotted_quantity, current_stock, location, pin_code, season FROM retailers ORDER BY trust_score ASC');
        res.json({ retailers });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/transactions', authenticateJWT, requireRole('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const txs = await dbAll(`
      SELECT t.id, t.requested_bags, t.status, t.block_hash, t.timestamp,
             r.name as retailer_name, f.id as farmer_id
      FROM transactions t JOIN retailers r ON t.retailer_id = r.id JOIN farmers f ON t.farmer_id = f.id
      ORDER BY t.timestamp DESC LIMIT ? OFFSET ?
    `, [limit, offset]);
        res.json({ transactions: txs });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/season-summary', authenticateJWT, requireRole('admin'), async (req, res) => {
    try {
        const totals = await dbGet('SELECT SUM(allotted_quantity) as total_allotted, SUM(current_stock) as total_remaining, COUNT(*) as total_retailers FROM retailers');
        const soldRow = await dbGet("SELECT SUM(requested_bags) as total_sold FROM transactions WHERE status = 'VERIFIED'");
        const flagsRow = await dbGet('SELECT COUNT(*) as total_flags FROM declarations WHERE is_flagged = 1');
        res.json({ summary: { ...totals, total_sold: soldRow?.total_sold || 0, total_flags: flagsRow?.total_flags || 0 } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.get('/api/disputes', authenticateJWT, async (req, res) => {
    try {
        let sql = `SELECT d.*, r.name as retailer_name, u.username FROM disputes d
               LEFT JOIN retailers r ON d.retailer_id = r.id
               LEFT JOIN users u ON d.raised_by = u.id ORDER BY d.timestamp DESC`;
        if (req.user.role === 'retailer') {
            sql = `SELECT d.*, r.name as retailer_name, u.username FROM disputes d
             LEFT JOIN retailers r ON d.retailer_id = r.id
             LEFT JOIN users u ON d.raised_by = u.id
             WHERE d.retailer_id = ${req.user.profileId} ORDER BY d.timestamp DESC`;
        }
        res.json({ disputes: await dbAll(sql) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/disputes/:id', authenticateJWT, requireRole('admin'), async (req, res) => {
    try {
        const { status, admin_note } = req.body;
        await dbRun('UPDATE disputes SET status = ?, admin_note = ? WHERE id = ?', [status, admin_note, req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/audit/chain', async (req, res) => {
    try {
        const chain = await dbAll('SELECT * FROM audit_chain ORDER BY block_index ASC');
        res.json({ chain });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/audit/verify', async (req, res) => {
    try {
        const result = await verifyChain();
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/audit/block/:hash', async (req, res) => {
    try {
        const block = await dbGet('SELECT * FROM audit_chain WHERE block_hash = ?', [req.params.hash]);
        if (!block) return res.status(404).json({ error: 'Block not found' });
        res.json({ block: { ...block, event_data: JSON.parse(block.event_data) } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ DAP Portal Backend running on http://localhost:${PORT}`));
