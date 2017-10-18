const hash = require('hash.js');
const Random = require('random-js');

const engine = Random.engines.mt19937().autoSeed();

module.exports = {
  hashMe: (message = '') => {
    // In case message is an object we need to sort it
    if (typeof message !== 'string') {
      const sortedObjectArray = [];
      const messageKeys = Object.keys(message).sort();

      messageKeys.forEach(key => sortedObjectArray.push(`${key}:${message[key]}`));

      return hash.sha256().update(`{${sortedObjectArray.join(',')}}`).digest('hex');
    }
    else {
      return hash.sha256().update(message).digest('hex');
    }


  },
  getRandomInteger: (min, max) => {
    return Random.integer(min, max)(engine);
  },
  getRandomBool: () => {
    return Random.bool()(engine)
  }
};