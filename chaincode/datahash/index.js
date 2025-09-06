'use strict';
const { Contract } = require('fabric-contract-api');

class DataHashContract extends Contract {
  async InitLedger(ctx) {
    // no-op
  }

  async Put(ctx, id, hash, metadataJson, createdAt) {
    const exists = await this.Exists(ctx, id);
    if (exists) throw new Error(`Record ${id} already exists`);

    let metadata = {};
    if (metadataJson) {
      try { metadata = JSON.parse(metadataJson); } catch { /* ignore */ }
    }

    const record = {
      id,
      hash,
      metadata,
      createdAt   // take from client
    };

    await ctx.stub.putState(`record:${id}`, Buffer.from(JSON.stringify(record)));
    return JSON.stringify(record);
 }


  async Get(ctx, id) {
    const data = await ctx.stub.getState(`record:${id}`);
    if (!data || data.length === 0) throw new Error(`Record ${id} not found`);
    return data.toString();
  }

  async Exists(ctx, id) {
    const data = await ctx.stub.getState(`record:${id}`);
    return !!(data && data.length);
  }
}

module.exports.contracts = [DataHashContract];
