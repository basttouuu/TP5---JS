// encore la même chanson, on importe les modules nécessaires et fonction (controller) pour les routes de tâches
const express = require('express')
const router = express.Router()
const controller = require('../controller/tasks')

// initialisation de la route pour les tâches
router.get('/todo', controller.getAllTasks)
router.get('/todo/search', controller.searchTasks)
router.get('/todo/:id', controller.getTaskById)
router.post('/todo', controller.addTask)
router.put('/todo/:id', controller.updateTask)
router.delete('/todo/:id', controller.deleteTask)

module.exports = router