const path = require("path");
const Parser = require("rss-parser");

const { readJson, writeJson } = require("../utils/jsonStorage");

const rssFile = path.join(__dirname, "../data/rss.json");

const parser = new Parser();

async function getAggregatedRss() {
  const data = readJson(rssFile);

  const activeFeeds = data.feeds.filter((feed) => feed.active !== false);

  const results = await Promise.allSettled(
    activeFeeds.map(async (feed) => {
      const parsedFeed = await parser.parseURL(feed.url);

      return parsedFeed.items.map((item) => ({
        title: item.title || "",
        link: item.link || "",
        date: item.isoDate || item.pubDate || null,
        author: item.creator || item.author || feed.name,
        source: feed.name,
      }));
    }),
  );

  const items = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  });

  items.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;

    return dateB - dateA;
  });

  return {
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
  };

  data.feeds.push(newFeed);

  writeJson(rssFile, data);

  return newFeed;
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
  deleteFeed,
};
