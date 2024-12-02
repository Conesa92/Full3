const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Rutas para gestionar tareas en un panel específico
router.post('/:panelId/tasks', taskController.createTaskInPanel);
router.get('/:panelId/tasks', taskController.getTasksInPanel);
router.put('/tasks/:taskId', taskController.updateTaskInPanel);
router.delete('/:panelId/tasks/:taskId', taskController.deleteTaskInPanel);

module.exports = router;
