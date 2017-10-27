const hash = require('hash.js');
const Random = require('random-js');

const engine = Random.engines.mt19937().autoSeed();

module.exports = {
  hashMe: (message = '') => {
    const sha256 = hash.sha256();

    typeof message === 'string' ?
      sha256.update(message) :
      sha256.update(JSON.stringify(message));

    return sha256.digest('hex');
  },
  getRandomInteger: (min, max) => {
    return Random.integer(min, max)(engine);
  },
  getRandomBool: () => {
    return Random.bool()(engine)
  }
};