const express = require("express");
const path = require("path");
const app = express();
const port = 8000;

app.use(express.json());

// Sert le frontend correctement
app.use(express.static(path.join(__dirname, "../frontend")));

const todoRoutes = require("./router/todo");
app.use(todoRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvee" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

app.listen(port, () => {
  console.log(`Le Serveur écoute sur le port ${port}`);
  console.log(`http://localhost:8000/index.html`);
});
