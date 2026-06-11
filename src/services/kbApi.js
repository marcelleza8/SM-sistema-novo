import api from "../api";

// Cliente da Base de Conhecimento (endpoints /api/v1/admin/kb).
const base = "admin/kb";

export default {
  tree() {
    return api.get(`${base}/tree`);
  },
  search(q) {
    return api.get(`${base}/search`, { params: { q } });
  },
  getNote(noteId) {
    return api.get(`${base}/notes/${noteId}`);
  },
  createNote(payload) {
    // payload: { title, content?, content_format?, type?, parent_id? }
    return api.post(`${base}/notes`, payload);
  },
  updateNote(noteId, payload) {
    // payload: { title?, content?, content_format?, type? }
    return api.put(`${base}/notes/${noteId}`, payload);
  },
  deleteBranch(branchId) {
    return api.delete(`${base}/branches/${branchId}`);
  },
  cloneNote(noteId, parentId) {
    return api.post(`${base}/notes/${noteId}/clone`, { parent_id: parentId });
  },
  moveBranch(branchId, payload) {
    // payload: { parent_id?, sort_order? }
    return api.put(`${base}/branches/${branchId}/move`, payload);
  },
  reorder(parentId, orderedBranchIds) {
    return api.put(`${base}/branches/reorder`, {
      parent_id: parentId,
      ordered_branch_ids: orderedBranchIds,
    });
  },
  revisions(noteId) {
    return api.get(`${base}/notes/${noteId}/revisions`);
  },
  getRevision(noteId, revisionId) {
    return api.get(`${base}/notes/${noteId}/revisions/${revisionId}`);
  },
  revert(noteId, revisionId) {
    return api.post(`${base}/notes/${noteId}/revert/${revisionId}`);
  },
};
