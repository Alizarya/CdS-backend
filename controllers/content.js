const path = require("path");

const { readJson, writeJson } = require("../utils/jsonStorage");

const {
  saveContentImage,
  deleteContentImage,
} = require("../services/contentImageService");

const contentFile = path.join(__dirname, "../data/content.json");

// Récupérer tous les contenus
async function getContent(request, reply) {
  try {
    const data = readJson(contentFile);

    // Trier les contenus selon leur ordre
    data.contents.sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });

    // Récupérer uniquement le contenu featured
    if (request.query.featured === "true") {
      const featuredContent = data.contents.find(
        (content) => content.featured === true,
      );

      if (!featuredContent) {
        return reply.status(404).send({
          success: false,
          message: "Aucun contenu mis en avant.",
        });
      }

      return reply.send(featuredContent);
    }

    // Récupérer tous les contenus
    return reply.send(data);
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Impossible de récupérer les contenus.",
    });
  }
}

// Récupérer un contenu par son ID
async function getContentById(request, reply) {
  try {
    const data = readJson(contentFile);
    const id = Number(request.params.id);

    const content = data.contents.find((item) => item.id === id);

    if (!content) {
      return reply.status(404).send({
        success: false,
        message: "Contenu introuvable.",
      });
    }

    return reply.send(content);
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Impossible de récupérer le contenu.",
    });
  }
}

// Créer un contenu
async function createContent(request, reply) {
  try {
    const data = readJson(contentFile);
    const contents = data.contents;

    // Générer le nouvel ID
    const newId =
      contents.length > 0
        ? Math.max(...contents.map((content) => content.id)) + 1
        : 1;

    // Générer automatiquement le nouvel ordre
    const newOrder =
      contents.length > 0
        ? Math.max(...contents.map((content) => content.order || 0)) + 1
        : 1;

    const newContent = {
      id: newId,
      order: newOrder,
      ...request.body,
    };

    // Sauvegarder l'image si elle est envoyée en Base64
    if (newContent.image) {
      newContent.image = await saveContentImage(newContent.image);
    }

    contents.push(newContent);

    writeJson(contentFile, data);

    return reply.status(201).send(newContent);
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Impossible de créer le contenu.",
    });
  }
}

// Modifier un contenu
async function updateContent(request, reply) {
  try {
    const data = readJson(contentFile);

    const id = Number(request.params.id);

    const index = data.contents.findIndex((item) => item.id === id);

    if (index === -1) {
      return reply.status(404).send({
        success: false,
        message: "Contenu introuvable.",
      });
    }

    const oldContent = data.contents[index];
    const oldImage = oldContent.image;

    const oldOrder = oldContent.order || 0;
    const newOrder =
      request.body.order !== undefined ? Number(request.body.order) : oldOrder;

    const updatedContent = {
      ...oldContent,
      ...request.body,
      id,
      order: newOrder,
    };

    // Gestion du changement d'ordre
    if (newOrder !== oldOrder) {
      const sortedContents = [...data.contents].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      );

      const oldIndex = sortedContents.findIndex((item) => item.id === id);

      // Retirer temporairement le contenu déplacé
      sortedContents.splice(oldIndex, 1);

      // Limiter la nouvelle position
      const targetIndex = Math.max(
        0,
        Math.min(newOrder - 1, sortedContents.length),
      );

      // Insérer à sa nouvelle position
      sortedContents.splice(targetIndex, 0, updatedContent);

      // Réattribuer tous les orders
      sortedContents.forEach((item, index) => {
        item.order = index + 1;
      });

      data.contents = sortedContents;
    } else {
      data.contents[index] = updatedContent;
    }

    // Gestion de l'image
    if (request.body.image && request.body.image !== oldImage) {
      data.contents.find((item) => item.id === id).image =
        await saveContentImage(request.body.image);
    }

    writeJson(contentFile, data);

    // Supprimer l'ancienne image si elle a été remplacée
    const finalContent = data.contents.find((item) => item.id === id);

    if (oldImage && finalContent.image !== oldImage) {
      await deleteContentImage(oldImage);
    }

    return reply.send(finalContent);
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Impossible de modifier le contenu.",
    });
  }
}

// Supprimer un contenu
async function deleteContent(request, reply) {
  try {
    const data = readJson(contentFile);

    const id = Number(request.params.id);

    const index = data.contents.findIndex((item) => item.id === id);

    if (index === -1) {
      return reply.status(404).send({
        success: false,
        message: "Contenu introuvable.",
      });
    }

    const deletedContent = data.contents.splice(index, 1)[0];

    // Réécrire le JSON
    writeJson(contentFile, data);

    // Supprimer l'image associée
    if (deletedContent.image) {
      await deleteContentImage(deletedContent.image);
    }

    return reply.send({
      success: true,
      message: "Contenu supprimé.",
      content: deletedContent,
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Impossible de supprimer le contenu.",
    });
  }
}

module.exports = {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
};
