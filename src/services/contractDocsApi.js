import api from "../api";

// Gestor de documentos de contrato (endpoints /api/v1/admin/contrato-documentos).
const base = "admin/contrato-documentos";

export default {
  // Catálogo de schema para o autocomplete dos mustaches.
  schema() {
    return api.get(`${base}/schema`);
  },

  // ----- Tipos -----
  listTypes() {
    return api.get(`${base}/tipos`);
  },
  createType(payload) {
    // payload: { name, description?, active? }
    return api.post(`${base}/tipos`, payload);
  },
  updateType(typeId, payload) {
    return api.put(`${base}/tipos/${typeId}`, payload);
  },
  deleteType(typeId) {
    return api.delete(`${base}/tipos/${typeId}`);
  },

  // ----- Templates -----
  listTemplates(params = {}) {
    // params: { type_id? }
    return api.get(`${base}/templates`, { params });
  },
  getTemplate(templateId) {
    return api.get(`${base}/templates/${templateId}`);
  },
  createTemplate(payload) {
    // payload: { type_id, name, content? }
    return api.post(`${base}/templates`, payload);
  },
  updateTemplate(templateId, payload) {
    // payload: { type_id?, name?, content? }
    return api.put(`${base}/templates/${templateId}`, payload);
  },
  deleteTemplate(templateId) {
    return api.delete(`${base}/templates/${templateId}`);
  },
};
