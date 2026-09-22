const rssService = require("../services/rssService");

async function getRss(request, reply) {
  try {
    const rss = await rssService.getAggregatedRss();

    return reply.send(rss);
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Impossible de récupérer le flux RSS.",
    });
  }
}

async function addRss(request, reply) {
  try {
    const { name, url } = request.body || {};

    if (!name || !url) {
      return reply.status(400).send({
        success: false,
        message: "Le nom et l'URL du flux RSS sont obligatoires.",
      });
    }

    const feed = await rssService.addFeed({
      name,
      url,
    });

    return reply.status(201).send(feed);
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Impossible d'ajouter le flux RSS.",
    });
  }
}

async function deleteRss(request, reply) {
  try {
    const id = Number(request.params.id);

    if (Number.isNaN(id)) {
      return reply.status(400).send({
        success: false,
        message: "L'identifiant du flux RSS est invalide.",
      });
    }

    const deletedFeed = await rssService.deleteFeed(id);

    if (!deletedFeed) {
      return reply.status(404).send({
        success: false,
        message: "Flux RSS introuvable.",
      });
    }

    return reply.send({
      success: true,
      message: "Flux RSS supprimé.",
      feed: deletedFeed,
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Impossible de supprimer le flux RSS.",
    });
  }
}

module.exports = {
  getRss,
  addRss,
  deleteRss,
};
