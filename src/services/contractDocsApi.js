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

  // ----- Resolver template -> registro -----
  resolveTemplate(templateId, entity, id) {
    // Retorna { name, type_id, content (mustaches conhecidos resolvidos), missing[] }
    return api.post(`${base}/templates/${templateId}/resolver`, { entity, id });
  },

  // ----- Documentos gerados (vinculados a um registro) -----
  listDocuments(entity, id) {
    return api.get(`${base}/documentos`, { params: { entity, id } });
  },
  getDocument(documentId) {
    return api.get(`${base}/documentos/${documentId}`);
  },
  createDocument(payload) {
    // payload: { entity, id, template_id?, type_id?, name, descript?, content? }
    return api.post(`${base}/documentos`, payload);
  },
  updateDocument(documentId, payload) {
    // payload: { name?, descript?, content? }
    return api.put(`${base}/documentos/${documentId}`, payload);
  },
  deleteDocument(documentId) {
    return api.delete(`${base}/documentos/${documentId}`);
  },
};
