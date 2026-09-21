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

    const newId =
      contents.length > 0
        ? Math.max(...contents.map((content) => content.id)) + 1
        : 1;

    const newContent = {
      id: newId,
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

    const updatedContent = {
      ...oldContent,
      ...request.body,
      id,
    };

    // Si une nouvelle image est envoyée,
    // elle est convertie et enregistrée dans data/images
    if (request.body.image && request.body.image !== oldImage) {
      updatedContent.image = await saveContentImage(request.body.image);
    }

    data.contents[index] = updatedContent;

    // Écrire le nouveau contenu dans content.json
    writeJson(contentFile, data);

    // Si une nouvelle image a remplacé l'ancienne,
    // supprimer l'ancien fichier
    if (oldImage && updatedContent.image !== oldImage) {
      await deleteContentImage(oldImage);
    }

    return reply.send(updatedContent);
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
