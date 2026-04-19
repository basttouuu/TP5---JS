// ici j'ai fais des fonctions pour me simplifier la vie et éviter de répéter du code.
// la première c'est pour normaliser les textes de recherche, ça évite d'avoir des problèmes de casse ou d'espaces
function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}
// la deuxième c'est pour essayer de parser une réponse JSON, mais si ça échoue, ça renvoie null au lieu de planter
function getJsonOrNull(response) {
  return response.json().catch(() => null);
}

// et la troisième c'est pour faire des requêtes à l'API de manière plus simple, avec gestion des erreurs intégrée
async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const body = await getJsonOrNull(response);

  if (!response.ok) {
    const message = body && body.message ? body.message : `Erreur HTTP ${response.status}`;
    throw new Error(message);
  }

  return body;
}

// cette fonction c'est pour afficher un message dans une zone spécifique de la page, avec une classe différente si c'est une erreur ou pas
function showMessage(targetId, message, isError = false) {
  const target = document.getElementById(targetId);
  if (!target) return;
  
  target.innerHTML = ""; 
  const p = document.createElement("p");
  p.className = isError ? "blabla-meme alerte-drama" : "blabla-meme";
  p.textContent = message; 
  
  target.appendChild(p);
}

// cette fonction c'est pour créer une "carte" de tâche à partir d'un objet tâche, elle retourne un élément HTML qu'on peut ensuite ajouter à la page
function createTaskCard(todo) {
  const card = document.createElement("div");
  card.className = "DIV2LATASKAJOUTER";

  const text = document.createElement("span");
  text.className = "CONTENU2LATASK";
  text.textContent = `[${todo.nom}] ${todo.content}`;

  card.appendChild(text);
  return card;
}

// cette fonction c'est pour afficher la liste des tâches sur la page d'accueil, elle sépare les tâches actives et terminées dans deux sections différentes
function renderHome(tasks) {
  const active = document.getElementById("displayToDoAppActive");
  const completed = document.getElementById("displayToDoAppCompleted");
  if (!active || !completed) return;

  active.innerHTML = "<h2>Taches Actives</h2>";
  completed.innerHTML = "<h2>Taches Terminees</h2>";

  tasks.forEach((task) => {
    const card = createTaskCard(task);
    if (task.completed) completed.appendChild(card);
    else active.appendChild(card);
  });
}

// cette fonction c'est pour gérer la page de recherche, elle ajoute des événements au formulaire de recherche et affiche les résultats dans une section dédiée
async function renderSearch() {
  const input = document.getElementById("searchInput");
  const button = document.getElementById("searchBtn");
  const clearButton = document.getElementById("clearSearchBtn");
  const results = document.getElementById("searchResults");
  if (!input || !button || !clearButton || !results) return;

  const draw = async () => {
    try {
      const query = normalizeText(input.value);
      const tasks = await apiRequest(`/todo/search?q=${encodeURIComponent(query)}`);

      results.innerHTML = '<h2 id="search-results-title">Resultats</h2>';

      const countMsg = document.createElement("p");
      countMsg.className = "blabla-meme";
      countMsg.textContent = `${tasks.length} tache(s) trouvee(s)`;
      results.appendChild(countMsg);

      if (tasks.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.className = "blabla-meme";
        emptyMsg.textContent = "Aucun resultat.";
        results.appendChild(emptyMsg);
        return;
      }

      tasks.forEach((task) => {
        results.appendChild(createTaskCard(task));
      });
    } catch (error) {
      results.innerHTML = '<h2 id="search-results-title">Resultats</h2>';
      
      const errorMsg = document.createElement("p");
      errorMsg.className = "blabla-meme alerte-drama";
      errorMsg.textContent = error.message;
      results.appendChild(errorMsg);
    }
  };

  button.onclick = draw;
  clearButton.onclick = () => {
    input.value = "";
    draw();
  };
  input.onkeydown = (event) => {
    if (event.key === "Enter") draw();
  };

  draw();
}

// cette fonction c'est pour gérer la page de gestion des tâches
function setupGestionForm(refresh) {
  const form = document.getElementById("gestionTaskForm");
  const nomInput = document.getElementById("taskNomInput");
  const contentInput = document.getElementById("taskContentInput");
  const saveBtn = document.getElementById("taskSaveBtn");
  const cancelBtn = document.getElementById("taskCancelEditBtn");
  if (!form || !nomInput || !contentInput || !saveBtn || !cancelBtn) return null;

  const resetForm = () => {
    form.dataset.editingId = "";
    saveBtn.textContent = "Ajouter";
    cancelBtn.hidden = true;
    form.reset();
  };

  form.onsubmit = async (event) => {
    event.preventDefault();

    const nom = nomInput.value.trim();
    const content = contentInput.value.trim();
    if (!nom || !content) {
      showMessage("gestionResults", "Nom et contenu obligatoires.", true);
      return;
    }

    const id = form.dataset.editingId;
    try {
      if (id) {
        await apiRequest(`/todo/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nom, content })
        });
        showMessage("gestionResults", "Tache modifiee.");
      } else {
        await apiRequest("/todo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nom, content })
        });
        showMessage("gestionResults", "Tache ajoutee.");
      }
      resetForm();
      refresh();
    } catch (error) {
      showMessage("gestionResults", error.message, true);
    }
  };

  cancelBtn.onclick = () => {
    resetForm();
    showMessage("gestionResults", "Edition annulee.");
  };

  return {
    edit(task) {
      form.dataset.editingId = String(task.id);
      nomInput.value = task.nom;
      contentInput.value = task.content;
      saveBtn.textContent = "Enregistrer";
      cancelBtn.hidden = false;
      nomInput.focus();
      showMessage("gestionResults", "Mode edition actif.");
    }
  };
}

// cette fonction c'est pour gérer la page de gestion des tâches
async function renderGestion() {
  const active = document.getElementById("gestionToDoAppActive");
  const completed = document.getElementById("gestionToDoAppCompleted");
  if (!active || !completed) return;

  const load = async () => {
    try {
      const tasks = await apiRequest("/todo");
      active.innerHTML = "<h2>Taches Actives</h2>";
      completed.innerHTML = "<h2>Taches Terminees</h2>";

      const formApi = setupGestionForm(load);

      tasks.forEach((task) => {
        const card = createTaskCard(task);
        const actions = document.createElement("div");
        actions.className = "boutons-chaos";

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "complete-btn";
        toggleBtn.textContent = task.completed ? "Reouvrir" : "Terminer";
        toggleBtn.onclick = async () => {
          try {
            await apiRequest(`/todo/${task.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ completed: !task.completed })
            });
            showMessage("gestionResults", "Statut mis a jour.");
            load();
          } catch (error) {
            showMessage("gestionResults", error.message, true);
          }
        };

        const editBtn = document.createElement("button");
        editBtn.className = "complete-btn";
        editBtn.textContent = "Modifier";
        editBtn.onclick = () => {
          if (formApi) formApi.edit(task);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "complete-btn";
        deleteBtn.textContent = "Supprimer";
        deleteBtn.onclick = async () => {
          if (!confirm("Supprimer cette tache ?")) return;
          try {
            await apiRequest(`/todo/${task.id}`, { method: "DELETE" });
            showMessage("gestionResults", "Tache supprimee.");
            load();
          } catch (error) {
            showMessage("gestionResults", error.message, true);
          }
        };

        actions.appendChild(toggleBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        card.appendChild(actions);

        if (task.completed) completed.appendChild(card);
        else active.appendChild(card);
      });

      showMessage("gestionResults", `${tasks.length} tache(s) chargee(s).`);
    } catch (error) {
      showMessage("gestionResults", error.message, true);
    }
  };

  load();
}

// et pour finir, cette fonction c'est pour initialiser la page
async function initPage() {
  if (document.getElementById("searchResults")) {
    renderSearch();
    return;
  }

  if (document.getElementById("gestionToDoAppActive") && document.getElementById("gestionToDoAppCompleted")) {
    renderGestion();
    return;
  }

  try {
    const tasks = await apiRequest("/todo");
    renderHome(tasks);
  } catch (error) {
    showMessage("displayToDoAppActive", error.message, true);
  }
}

document.addEventListener("DOMContentLoaded", initPage);