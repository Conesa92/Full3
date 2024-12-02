const mongoose = require('mongoose');

const PanelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  proceso: { type: String, required: true }
});

const Panel = mongoose.model('Panel', PanelSchema);

module.exports = Panel;
