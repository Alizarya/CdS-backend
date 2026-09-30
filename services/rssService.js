const path = require("path");

const Parser = require("rss-parser");

const { readJson, writeJson } = require("../utils/jsonStorage");

const rssFile = path.join(__dirname, "../data/rss.json");

const parser = new Parser({
  customFields: {
    item: ["content:encoded", "dc:creator"],
  },
});

async function getAggregatedRss() {
  const data = readJson(rssFile);

  const activeFeeds = data.feeds.filter((feed) => feed.active !== false);

  const feedResults = await Promise.all(
    activeFeeds.map(async (feed) => {
      try {
        const parsedFeed = await parser.parseURL(feed.url);

        const items = parsedFeed.items.map((item) => ({
          title: item.title || "",

          content:
            item.contentSnippet || item.content || item.description || "",

          link: item.link || "",

          date: item.isoDate || item.pubDate || null,

          author: item.creator || item.author || feed.name,

          source: feed.name,
        }));

        return {
          feed: {
            ...feed,
            status: "ok",
            error: null,
          },

          items,
        };
      } catch (error) {
        return {
          feed: {
            ...feed,
            status: "error",
            error: error.message || "Impossible de récupérer le flux.",
          },

          items: [],
        };
      }
    }),
  );

  const feeds = feedResults.map((result) => result.feed);

  const items = feedResults.flatMap((result) => result.items);

  items.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;

    const dateB = b.date ? new Date(b.date).getTime() : 0;

    return dateB - dateA;
  });

  return {
    feeds,
    items,
  };
}

async function addFeed({ name, url }) {
  const data = readJson(rssFile);

  const existingFeed = data.feeds.find(
    (feed) => feed.url.toLowerCase() === url.toLowerCase(),
  );

  if (existingFeed) {
    throw new Error("Ce flux RSS existe déjà.");
  }

  const newId =
    data.feeds.length > 0
      ? Math.max(...data.feeds.map((feed) => feed.id)) + 1
      : 1;

  const newFeed = {
    id: newId,
    name,
    url,
    active: true,
    online: true,
  };

  data.feeds.push(newFeed);

  writeJson(rssFile, data);

  return newFeed;
}

async function updateFeed(id, { name, url, online }) {
  const data = readJson(rssFile);

  const index = data.feeds.findIndex((feed) => feed.id === id);

  if (index === -1) {
    return null;
  }

  const currentFeed = data.feeds[index];

  const updatedFeed = {
    ...currentFeed,
  };

  if (name !== undefined) {
    updatedFeed.name = name;
  }

  if (url !== undefined) {
    updatedFeed.url = url;
  }

  if (online !== undefined) {
    updatedFeed.online = online;
  }

  data.feeds[index] = updatedFeed;

  writeJson(rssFile, data);

  return updatedFeed;
}

async function deleteFeed(id) {
  const data = readJson(rssFile);

  const index = data.feeds.findIndex((feed) => feed.id === id);

  if (index === -1) {
    return null;
  }

  const deletedFeed = data.feeds.splice(index, 1)[0];

  writeJson(rssFile, data);

  return deletedFeed;
}

module.exports = {
  getAggregatedRss,
  addFeed,
  updateFeed,
  deleteFeed,
};
