const panelController = require('../controllers/PanelController');
const taskController = require('../controllers/taskController');

const resolvers = {
  Query: {
    // Panel Queries
    getPanels: async () => await panelController.getPanels(),
    getPanel: async (_, { id }) => await panelController.getPanelById(id),

    // Task Queries
    getTasks: async () => await taskController.getTasks(),
    getTask: async (_, { id }) => await taskController.getTaskById(id),
    getTasksByPanel: async (_, { panelId }) => await taskController.getTasksInPanel(panelId),
  },

  Mutation: {
    // Panel Mutations
    createPanel: async (_, { name, description, proceso }) => {
      await panelController.createPanel(name, description, proceso); // Solo realiza la acción sin retorno
    },
    
    updatePanel: async (_, { id, name, description, proceso }) => {
      await panelController.updatePanel(id, name, description, proceso); // Solo realiza la acción sin retorno
    },
    
    deletePanel: async (_, { id }) => {
      await panelController.deletePanel(id); // Solo realiza la acción sin retorno
    },

    // Task Mutations
    createTask: async (_, { panelId, name, description, date, responsible, status, fileUrl }) => {
      // Llamada al controlador para crear la tarea sin retornar datos
      await taskController.createTaskInPanel({
        panelId,
        name,
        description,
        date,
        responsible,
        status,
        fileUrl,  // Asegúrate de que fileUrl esté pasando correctamente
      });
    },

    updateTask: async (_, { id, name, description, date, responsible, status }) => {
      // Llamada al controlador para actualizar la tarea sin retornar datos
      await taskController.updateTaskInPanel(id, { name, description, date, responsible, status });
    },

    deleteTask: async (_, { id }) => {
      // Llamada al controlador para eliminar la tarea sin retorno
      await taskController.deleteTaskInPanel(id);
    }
  },

  // Relaciones entre Panel y Task
  Panel: {
    tasks: async (parent) => await taskController.getTasksInPanel(parent.id),
  },

  Task: {
    panel: async (parent) => await panelController.getPanelById(parent.panel),
  },
};

module.exports = resolvers;
