const { USERNAME, PASSWORD, TAGS } = require('./config/config.json');
const instagram = require('../src/bot/instagram');

(async () => {
  await instagram.initialize();

  await instagram.login(USERNAME, PASSWORD);

  await instagram.likeTagsProcess(TAGS);
})();
