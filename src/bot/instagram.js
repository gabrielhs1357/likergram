const { BASE_URL } = require('../config/config.json');
const puppeteer = require('puppeteer');

const tagUrl = (tag) => `https://www.instagram.com/explore/tags/${tag}/`;

const instagram = {
  browser: null,
  page: null,

  initialize: async () => {
    instagram.browser = await puppeteer.launch({
      headless: false, // opens the browser, as opposed to starting in headless mode which simulates the browser through the terminal
      args: ['--start-maximized'],
      defaultViewport: { width: 1920, height: 1080 },
    });

    instagram.page = await instagram.browser.newPage();
  },

  login: async (username, password) => {
    await instagram.page.goto(BASE_URL, {
      waitUntil: 'networkidle2',
    });

    await instagram.page.type('input[name="username"]', username, {
      delay: 50,
    });

    await instagram.page.type('input[name="password"]', password, {
      delay: 50,
    });

    const loginButton = await instagram.page.$$('button>div');

    await loginButton[0].click();

    await instagram.page.waitFor(`img[alt="Foto do perfil de ${username}"]`);

    await instagram.page.waitFor(3000);

    //Get "Not now" notifications button
    const nowNowButton = await instagram.page.$x(
      '//button[contains(., "Agora não")]' //same as button[text()="Agora não"]
    );

    if (nowNowButton) await nowNowButton[0].click();

    await instagram.page.waitFor(1000);
  },

  likeTagsProcess: async (tags = []) => {
    for (const tag of tags) {
      // Go to the tag page
      await instagram.page.goto(tagUrl(tag), {
        waitUntil: 'networkidle2',
      });

      await instagram.page.waitFor(3000);

      // Get the "Most Recent" images/posts
      const posts = await instagram.page.$$(
        'article > div:nth-child(3) img[decoding="auto"]'
      );

      // For the first three images/posts:
      for (let i = 0; i < 3; i++) {
        const post = posts[i];
        // Click on post
        await post.click();

        // Wait for the modal appear
        await instagram.page.waitFor('body[style="overflow: hidden;"]');
        await instagram.page.waitFor(2000);

        // Like the post
        if (await instagram.page.$('svg[aria-label="Curtir"]'))
          await instagram.page.click('svg[aria-label="Curtir"]');

        await instagram.page.waitFor(1000);

        // Close the modal
        await instagram.page.click('svg[aria-label="Fechar"]');

        await instagram.page.waitFor(500);
      }
      await instagram.page.waitFor(1000);
    }
    await instagram.page.goto(BASE_URL);
  },
};

module.exports = instagram;
