const helper = require('./helper');
const Exceptions = require('./exceptions');

// TODO: Use ImmutableJS

const makeTransaction = (maxValue = 3) => {
  const sign = helper.getRandomBool() ? 1 : -1;
  const amount = helper.getRandomInteger(1, maxValue);
  const alicePays = sign * amount;
  const bobPays = -alicePays;

  return { Alice: alicePays, Bob: bobPays };
}

const updateState = (transaction, state) => {
  const newState = JSON.parse(JSON.stringify(state));

  Object.keys(newState).forEach(key => {
    transaction[key] ?
      newState[key] += transaction[key] :
      newState[key] = transaction[key]
  });

  return newState;
};

const isValidTransaction = (transaction, state) => {
  const transactionKeys = Object.keys(transaction);

  // Check that transaction sum is 0
  let sum = 0;
  transactionKeys.forEach(key => sum += transaction[key]);

  if (sum !== 0) {
    return false;
  }

  // Check that the transaction does not cause overdraft
  let isValid = true;

  transactionKeys.forEach(key => {
    const accountBalance = state[key] ? state[key] : 0;

    if (accountBalance + transaction[key] < 0) {
      isValid = false;
    }
  });

  return isValid;
};

const makeBlock = (txns, chain) => {
  const parentBlock = chain.slice(-1)[0];
  const parentHash = parentBlock.hash;
  const blockNumber = parentBlock.contents.blockNumber + 1;
  const txnCount = txns.length;
  const contents = { blockNumber, parentHash, txnCount, txns };
  const hash = helper.hashMe(contents);

  return { hash, contents };
};

const checkBlockHash = block => {
  const expectedHash = helper.hashMe(block.contents);

  if (block.hash !== expectedHash) {
    throw new Exceptions.HashException(block.contents.blockNumber);
  }
};

const checkBlockValidity = (block, parent, state) => {
  /**
   * We want to check the following conditions:
   * - Each of the transactions are valid updates to the system state
   * - Block hash is valid for the block contents
   * - Block number increments the parent block number by 1
   * - Accurately references the parent block's hash
   */

   const parentNumber = parent.contents.blockNumber;
   const parentHash = parent.hash;
   const blockNumber = block.contents.blockNumber;

   // Check transaction validity; throw an error if an invalid transaction was found.
   for (let transaction of block.contents.txns) {
     if (isValidTransaction(transaction, state)) {
       state = updateState(transaction, state);
     }
     else {
       throw new Exceptions.InvalidTransactionExceptions(blockNumber, transaction);
     }
   }

   // Check hash integrity; raises error if inaccurate
   checkBlockHash(block);

   if (blockNumber !== parentNumber + 1) {
     throw new Exceptions.HashException(blockNumber);
   }

   if (block.contents.parentHash !== parentHash) {
     throw new Exceptions.ParentHashException(blockNumber);
   }

   return state;
};

const checkChain = chain => {
  /**
   * Work through the chain from the genesis block (which gets special treatment),
   *  checking that all transactions are internally valid,
   *    that the transactions do not cause an overdraft,
   *    and that the blocks are linked by their hashes.
   * This returns the state as a dictionary of accounts and balances,
   *   or returns False if an error was detected
   */
  
  // Data input processing: Make sure that our chain is a list of objects
  if (typeof chain === 'string') {
    chain = JSON.parse(chain);
  }
  
  /**
   * Prime the pump by checking the genesis block
   * We want to check the following conditions:
   * - Each of the transactions are valid updates to the system state
   * - Block hash is valid for the block contents
   */
  const genesisBlock = chain[0];
  let state = {};
  let parent = genesisBlock;

  for (let transaction in genesisBlock.contents.txns) {
    state = updateState(transaction, state);
  }

  checkBlockHash(genesisBlock);

  /**
   * Checking subsequent blocks: These additionally need to check
   *    - the reference to the parent block's hash
   *    - the validity of the block number
   */
  for (let block in chain.slice(1)) {
    state = checkBlockValidity(block, parent, state);
    parent = block;
  }

  return state;
};

/**
 * Executing and testing our blockchain
 */
const transactionsBuffer = [];

for (let i = 0; i < 30; i++) {
  transactionsBuffer.push(makeTransaction());
}

// Initial state
let state = { Alice: 50, Bob: 50 };

const contents = {
  blockNumber: 0,
  parentHash: undefined,
  txnCount: 1,
  txns: [state]
};
const hash = helper.hashMe(contents);
const genesisBlock = { hash, contents };
const genesisBlockStr = JSON.stringify(genesisBlock);

const chain = [genesisBlock];

// Arbitrary number of transactions per block
//    this is chosen by the block miner, and can vary between blocks!
const blockSizeLimit = 5;

while (transactionsBuffer.length > 0) {
  // Gather a set of valid transactions for inclusion
  const txnList = [];

  while (transactionsBuffer.length > 0 && txnList.length < blockSizeLimit) {
    const newTransaction = transactionsBuffer.pop();
    const validTransaction = isValidTransaction(newTransaction, state);

    if (validTransaction) {
      txnList.push(newTransaction);
      state = updateState(newTransaction, state);
    }
    else {
      console.log('Ignored transaction');
    }
  }

  // Make a block
  const block = makeBlock(txnList, chain);

  chain.push(block);
}

nodeBlockhain = JSON.parse(JSON.stringify(chain));
nodeBlockTransactions = [];

for (var i = 0; i < 5; i++) {
  nodeBlockTransactions.push(makeTransaction());
}

const newBlock = makeBlock(nodeBlockTransactions, nodeBlockhain);

console.log(`Blockchain on Node A is currently ${chain.length} blocks long`);

try {
  console.log(`New block received. Checking validity...`);
  state = checkBlockValidity(newBlock, chain.slice(-1)[0], state);
  chain.push(newBlock)
}
catch (e) {
  console.log('Invalid block.ignoring and waiting for the next block:');
  console.log(`${e.name}: ${e.message}`);
}

console.log(`Blockchain on Node A is currently ${chain.length} blocks long`);