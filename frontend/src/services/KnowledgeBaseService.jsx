import api from './api';

class KnowledgeBaseService {
  async list(params = {}) {
    try {
      const response = await api.get('/v1/knowledge-base', { params });
      const resp = response.data;
      if (Array.isArray(resp)) {
        return { success: true, data: { data: resp, pagination: { total: resp.length, last_page: 1, current_page: 1 } }, message: 'OK' };
      }
      if (resp && resp.data && resp.pagination) {
        return { success: true, data: { data: resp.data, pagination: resp.pagination }, message: resp.message || 'OK' };
      }
      if (resp && resp.data && typeof resp.total !== 'undefined') {
        const pagination = {
          total: resp.total,
          per_page: resp.per_page,
          current_page: resp.current_page,
          last_page: resp.last_page,
          from: resp.from,
          to: resp.to
        };
        return { success: true, data: { data: resp.data, pagination }, message: resp.message || 'OK' };
      }
      return { success: true, data: { data: resp?.items || [], pagination: resp?.pagination || {} }, message: resp?.message || 'OK' };
    } catch (error) {
      return this.handleError(error, 'Failed to load knowledge items');
    }
  }

  async getById(id) {
    try {
      const response = await api.get(`/v1/knowledge-base/${id}`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch item');
    }
  }

  async create(payload) {
    try {
      const response = await api.post('/v1/knowledge-base', payload);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return this.handleError(error, 'Failed to create item');
    }
  }

  async update(id, payload) {
    try {
      const response = await api.put(`/v1/knowledge-base/${id}`, payload);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return this.handleError(error, 'Failed to update item');
    }
  }

  async remove(id) {
    try {
      const response = await api.delete(`/v1/knowledge-base/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return this.handleError(error, 'Failed to delete item');
    }
  }

  async search(query, filters = {}) {
    try {
      const response = await api.get('/v1/knowledge-base/search', { params: { query, ...filters } });
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return this.handleError(error, 'Failed to search items');
    }
  }

  async getCategories(params = {}) {
    try {
      const response = await api.get('/v1/knowledge-base/categories', { params });
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return this.handleError(error, 'Failed to load categories');
    }
  }

  async publish(id) {
    try {
      const response = await api.post(`/v1/knowledge-base/${id}/publish`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return this.handleError(error, 'Failed to publish item');
    }
  }

  handleError(error, defaultMessage) {
    if (error?.response) {
      const { status, data } = error.response;
      return { success: false, message: data?.message || defaultMessage, errors: data?.errors || {}, status };
    }
    if (error?.request) {
      return { success: false, message: 'Network error', errors: {}, status: 0 };
    }
    return { success: false, message: error?.message || defaultMessage, errors: {}, status: 0 };
  }
}

export default new KnowledgeBaseService();


