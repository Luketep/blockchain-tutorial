module.exports = {
  HashException: class HashException {
    constructor(blockNumber) {
      this.name = 'HashException';
      this.message = `Hash does not match contents of block ${blockNumber}`;
    }
  },
  ParentHashException: class ParentHashException {
    constructor(blockNumber) {
      this.name = 'ParentHashException';
      this.message = `Parent hash does not match contents of block ${blockNumber}`;
    }
  },
  InvalidTransactionExceptions: class InvalidTransactionExceptions {
    constructor(blockNumber, transaction) {
      this.name = 'InvalidTransactionExceptions';
      this.message = `Invalid transaction in block ${blockNumber}: ${JSON.stringify(transaction)}`;
    }
  }
};