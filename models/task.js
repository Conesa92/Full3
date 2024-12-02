const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  responsible: { type: String, required: true },
  status: {
    type: String,
    enum: ['Por hacer', 'En proceso', 'Terminado'],
    default: 'Por hacer',
  },
  panel: { type: Schema.Types.ObjectId, ref: 'Panel' },
  fileUrl: { type: String }, // Nuevo campo para almacenar la URL del archivo
});

// Verifica si el modelo ya existe antes de crearlo
module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
