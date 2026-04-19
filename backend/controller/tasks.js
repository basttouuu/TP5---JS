// ici on importe les modules nécessaires et fonction (controller) pour les routes de tâches
const fs = require("fs");
const path = require("path");

// ensuite on définit le chemin vers le fichier de données JSON (alias les données de nos tâches)
const dataPath = path.join(__dirname, "../data/data.json");

// pour un gain de temps et de clarté, j'ai fais une méthode "readData" pour lire les données du fichier JSON
const readData = () => {
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const parsed = JSON.parse(rawData);
  if (!Array.isArray(parsed.tasks)) {
    return { tasks: [] };
  }
  return parsed;
};

// et une méthode "writeData" pour écrire les données dans le fichier JSON
const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
};

// une petite fonction pour parser les ID des tâches, ça évite de répéter ce code dans chaque méthode qui a besoin de l'ID
const parseId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) ? id : null;
};

// et on commence avec la première méthode du controller, "getAllTasks", qui lit les données du fichier JSON et renvoie la liste des tâches
const getAllTasks = (req, res) => {
  try {
    const data = readData();
    res.status(200).json(data.tasks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la lecture des taches" });
  }
};

// ensuite on a la méthode "getTaskById" qui prend un ID en paramètre, lit les données du fichier JSON, cherche la tâche correspondante et la renvoie
const getTaskById = (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const data = readData();
    const task = data.tasks.find((t) => t.id === id);

    if (!task) {
      return res.status(404).json({ message: "Tache non trouvee" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la lecture de la tache" });
  }
};

// ensuite on a la méthode "addTask" qui rajoute une nouvelle tâche dans le fichier JSON, avec un ID unique généré automatiquement, et renvoie la tâche créée en réponse
const addTask = (req, res) => {
  try {
    const { nom, content } = req.body;

    if (!nom || !content) {
      return res.status(400).json({ message: "Nom et contenu obligatoires" });
    }

    const data = readData();
    const newId = data.tasks.length > 0 ? Math.max(...data.tasks.map((t) => t.id)) + 1 : 1;
    const newTask = {
      id: newId,
      nom: String(nom).trim(),
      content: String(content).trim(),
      completed: false
    };

    data.tasks.push(newTask);
    writeData(data);

    res.status(201).json({ message: "Tache ajoutee", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de l'ajout de la tache" });
  }
};


// ensuite nous avons la méthode "updateTask" qui prend un ID en paramètre et les données à mettre à jour dans le corps de la requête
const updateTask = (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const { nom, content, completed } = req.body;
    const data = readData();
    const index = data.tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Tache non trouvee" });
    }

    if (nom !== undefined) data.tasks[index].nom = String(nom).trim();
    if (content !== undefined) data.tasks[index].content = String(content).trim();
    if (completed !== undefined) data.tasks[index].completed = Boolean(completed);

    writeData(data);
    res.status(200).json({ message: "Tache modifiee", task: data.tasks[index] });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la modification de la tache" });
  }
};

// l'avant-dernière méthode du controller, "deleteTask", qui prend un ID en paramètre, cherche la tâche correspondante dans le fichier JSON, la supprime et renvoie un message de confirmation
const deleteTask = (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const data = readData();
    const index = data.tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Tache non trouvee" });
    }

    const deleted = data.tasks.splice(index, 1)[0];
    writeData(data);

    res.status(200).json({ message: "Tache supprimee", deleted });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la suppression de la tache" });
  }
};

// et pour finir, la méthode "searchTasks" qui prend une query en paramètre, lit les données du fichier JSON, filtre les tâches qui correspondent à la query (en cherchant dans le nom et le contenu) et renvoie la liste des tâches filtrées
const searchTasks = (req, res) => {
  try {
    const query = String(req.query.q || "").toLowerCase().trim();
    const data = readData();

    if (!query) {
      return res.status(200).json(data.tasks);
    }

    const filtered = data.tasks.filter((task) => {
      const fullText = `${task.nom} ${task.content}`.toLowerCase();
      return fullText.includes(query);
    });

    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la recherche" });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  searchTasks
};
