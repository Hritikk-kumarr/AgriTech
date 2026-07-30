const crypto = require('crypto');
const { dbRun, dbGet, dbAll } = require('./db');
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}
async function getLastBlock(){
  return dbGet('SELECT * FROM audit_chain ORDER BY block_index DESC LIMIT 1');
}
async function appendBlock(eventType, eventData){
  const lastBlock = await getLastBlock();
  const blockIndex = lastBlock ? lastBlock.block_index + 1 : 0;
  const prevHash = lastBlock ? lastBlock.block_hash : GENESIS_HASH;
  const timestamp = new Date().toISOString();
  const dataStr = JSON.stringify(eventData);
  const dataHash = sha256(dataStr);
  const blockHash = sha256(prevHash + eventType + dataHash + timestamp);

  await dbRun(
    `INSERT INTO audit_chain (block_index, prev_hash, event_type, event_data, data_hash, block_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [blockIndex, prevHash, eventType, dataStr, dataHash, blockHash]
  );
  return blockHash;
}
async function verifyChain() {
  const blocks = await dbAll('SELECT * FROM audit_chain ORDER BY block_index ASC');
  if (blocks.length === 0) return { valid: true, totalBlocks: 0 };
  for (let i = 0; i < blocks.length; i++){
    const b = blocks[i];
    const expectedDataHash = sha256(b.event_data);
    if (expectedDataHash !== b.data_hash){
      return { valid: false, brokenAtBlock: b.block_index, reason: 'Data hash mismatch' };
    }
    const expectedBlockHash = sha256(b.prev_hash + b.event_type + b.data_hash + b.timestamp);
    if (expectedBlockHash !== b.block_hash){
      return { valid: false, brokenAtBlock: b.block_index, reason: 'Block hash mismatch' };
    }
    if (i > 0 && b.prev_hash !== blocks[i - 1].block_hash) {
      return { valid: false, brokenAtBlock: b.block_index, reason: 'Chain linkage broken' };
    }
  }
  return{ valid: true, totalBlocks: blocks.length};
}
module.exports = { appendBlock, verifyChain, sha256, GENESIS_HASH };