const Task = require('../models/task');
const Panel = require('../models/panel');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // Guardar en la carpeta 'uploads'

// Crear una nueva tarea dentro de un panel
const createTaskInPanel = async ({ panelId, name, description, date, responsible, status, fileUrl }) => {
  console.log('Datos recibidos para crear la tarea:', { panelId, name, description, date, responsible, status, fileUrl });

  // Verificar que el panel existe
  const panel = await Panel.findById(panelId);
  if (!panel) {
    console.error('Panel no encontrado');
    throw new Error('Panel no encontrado');
  }

  // Validar datos esenciales
  if (!name || !date || !responsible) {
    console.error('Faltan datos esenciales para crear la tarea');
    throw new Error('Faltan datos esenciales');
  }

  // Crear la nueva tarea
  const newTask = new Task({
    name,
    description,
    date,
    responsible,
    status,
    panel: panelId,
    fileUrl,
  });

  try {
    const savedTask = await newTask.save();
    console.log('Tarea creada y guardada:', savedTask);
    return savedTask;
  } catch (error) {
    console.error('Error al guardar la tarea:', error); // Mostrar el error en la consola
    throw new Error('Hubo un error al crear la tarea'); // Lanza un error para manejarlo en el frontend
  }
};

// Obtener tareas dentro de un panel específico
const getTasksInPanel = async (panelId) => {
  try {
    const tasks = await Task.find({ panel: panelId });

    if (!tasks || tasks.length === 0) {
      // Si no hay tareas, devolver un array vacío
      return [];
    }

    return tasks; // Retornar las tareas encontradas
  } catch (error) {
    console.error('Error al obtener tareas:', error); // Mostrar error en consola
    throw new Error('Hubo un error al obtener las tareas'); // Lanzar el error para manejarlo en el frontend
  }
};

// Eliminar una tarea en un panel
const deleteTaskInPanel = async (taskId) => {
  try {
    // Eliminar la tarea por su ID (también realiza la búsqueda internamente)
    const result = await Task.findByIdAndDelete(taskId);

    if (!result) {
      console.error('No se encontró la tarea con el ID:', taskId);
      throw new Error('No se encontró la tarea con ese ID');
    }

    console.log('Tarea eliminada correctamente');
    return { message: 'Tarea eliminada correctamente', success: true };
  } catch (error) {
    console.error('Error al intentar eliminar la tarea:', error); // Mostrar error en consola
    throw new Error('Error al intentar eliminar la tarea'); // Lanzar error para manejarlo en el frontend
  }
};

const getTaskById = async (id) => {
  // Buscar la tarea por su ID
  const task = await Task.findById(id);
  if (!task) {
    console.error('Tarea no encontrada con ID:', id); // Mostrar error en consola
    return null;  // Si no se encuentra la tarea, se devuelve null
  }
  return task;
};

// Actualizar una tarea en un panel
const updateTaskInPanel = async (taskId, { name, description, date, responsible, status, fileUrl }) => {
  const task = await Task.findById(taskId);

  if (!task) {
      console.error("Tarea no encontrada para actualizar con ID:", taskId);
      throw new Error(`Tarea no encontrada con ID: ${taskId}`);
  }

  // Actualizar campos si se proporcionan
  if (name) task.name = name;
  if (description) task.description = description;
  if (date) task.date = date;
  if (responsible) task.responsible = responsible;
  if (status) task.status = status;
  if (fileUrl) task.fileUrl = fileUrl;

  const updatedTask = await task.save();
  console.log("Tarea actualizada correctamente:", updatedTask);
  return updatedTask;
};


module.exports = {
  createTaskInPanel,
  getTasksInPanel,
  updateTaskInPanel,
  deleteTaskInPanel,
  getTaskById,
};
