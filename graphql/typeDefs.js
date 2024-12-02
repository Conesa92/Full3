const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Definición de Panel
  type Panel {
    id: ID!
    name: String!
    description: String!
    proceso: String!
    tasks: [Task]  # Relación con las tareas del panel
  }

  # Definición de Task
  type Task {
    id: ID!
    name: String!
    description: String
    date: String!
    responsible: String!
    status: String!  # Campo para el estado de la tarea
    panel: Panel!  # Relación con el panel, devolvemos el objeto Panel completo
    fileUrl: String # La URL del archivo almacenado
  }

  # Definir Upload como un tipo scalar
  scalar Upload

  # Consultas para Panels y Tasks
  type Query {
    getPanels: [Panel]  # Obtiene todos los paneles
    getPanel(id: ID!): Panel  # Obtiene un panel específico por ID
    getTasks: [Task]  # Obtiene todas las tareas
    getTask(id: ID!): Task  # Obtiene una tarea específica por ID
    getTasksByPanel(panelId: ID!): [Task]  # Obtiene tareas por panel
  }

  # Mutaciones para Panels y Tasks
  type Mutation {
    createPanel(name: String!, description: String!, proceso: String!): Panel  # Crear un panel
    updatePanel(id: ID!, name: String!, description: String!, proceso: String!): Panel  # Actualizar un panel
    deletePanel(id: ID!): String  # Eliminar un panel
    createTask(name: String!, description: String!, date: String!, responsible: String!, status: String!, panelId: ID!,   fileUrl: String): Task
    updateTask(id: ID!, name: String, description: String, date: String, responsible: String, status: String,   fileUrl: String): Task  # Actualizar una tarea
    deleteTask(id: ID!): String  # Eliminar una tarea
  }
`;

module.exports = typeDefs;
