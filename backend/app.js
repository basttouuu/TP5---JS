// ici on importe les modules nécessaires, on configure le serveur express, on définit les routes et on démarre le serveur
const express = require("express");
const path = require("path");
const app = express();
const port = 8000;

app.use(express.json());

// Sert le frontend correctement
app.use(express.static(path.join(__dirname, "../frontend")));

// routes pour les opérations CRUD sur les tâches
const todoRoutes = require("./router/todo");
app.use(todoRoutes);

// ça c'est pour gérer les routes non trouvées et les erreurs(erreur 404)
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvee" });
});

// et ça c'est pour gérer les erreurs internes du serveur (erreur 500)
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// et pour finir on démarre le serveur sur le port qu'on a mis dans la variable port, j'ai rajouté un petit message pour mettre l'url dans la console pour que ce soit plus facile à trouver
app.listen(port, () => {
  console.log(`Le Serveur écoute sur le port ${port}`);
  console.log(`http://localhost:8000/index.html`);
});
