const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/data.json");

const readData = () => {
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const parsed = JSON.parse(rawData);
  if (!Array.isArray(parsed.tasks)) {
    return { tasks: [] };
  }
  return parsed;
};

const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
};

const parseId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) ? id : null;
};

const getAllTasks = (req, res) => {
  try {
    const data = readData();
    res.status(200).json(data.tasks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la lecture des taches" });
  }
};

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
