const Panel = require('../models/panel');
const Task = require('../models/Task');

// Crear un nuevo panel
async function createPanel(name, description, proceso) {
  const newPanel = new Panel({ name, description, proceso });
  return await newPanel.save();
}

// Obtener todos los paneles
async function getPanels() {
  return await Panel.find();
}

// Obtener un panel por su ID
async function getPanelById(id) {
  const panel = await Panel.findById(id);
  if (!panel) throw new Error('Panel no encontrado');
  return panel;
}

// Actualizar un panel
async function updatePanel(id, name, description, proceso) {
  console.log("ID recibido:", id);  // Agrega un log para ver el ID
  console.log("Datos para actualizar:", name, description, proceso);  // Verifica que los datos sean correctos
  
  const updatedPanel = await Panel.findByIdAndUpdate(
    id,
    { name, description, proceso },
    { new: true }
  );
  
  if (!updatedPanel) throw new Error('Panel no encontrado');
  return updatedPanel;
}

// Eliminar un panel y sus tareas asociadas
async function deletePanel(id) {
  console.log("Eliminando el panel con id:", id);  // Log para depurar
  const panel = await Panel.findById(id);
  if (!panel) throw new Error('Panel no encontrado');
  
  try {
    // Eliminar todas las tareas asociadas a este panel
    await Task.deleteMany({ panel: id });

    // Eliminar el panel
    await Panel.findByIdAndDelete(id);
    return 'Panel y tareas asociadas eliminados con éxito';
  } catch (error) {
    throw new Error('Error al eliminar el panel o las tareas: ' + error.message);
  }
}

// Obtener tareas asociadas a un panel
async function getTasksByPanel(panelId) {
  return await Task.find({ panel: panelId });
}

module.exports = {
  createPanel,
  getPanels,
  getPanelById,
  updatePanel,
  deletePanel,
  getTasksByPanel,
};
