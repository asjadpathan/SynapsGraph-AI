import axios from 'axios';

const api = axios.create({
  baseURL: '', // Relative URL for Vite proxying to http://localhost:8000
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('synaps_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const AuthService = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await api.post('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    if (res.data?.access_token) {
      localStorage.setItem('synaps_token', res.data.access_token);
      localStorage.setItem('synaps_user', JSON.stringify({ username }));
    }
    return res.data;
  },

  signup: async (username, email, password) => {
    const res = await api.post('/signup', { username, email, password });
    if (res.data?.access_token) {
      localStorage.setItem('synaps_token', res.data.access_token);
      localStorage.setItem('synaps_user', JSON.stringify({ username, email }));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('synaps_token');
    localStorage.removeItem('synaps_user');
    localStorage.removeItem('synaps_active_project');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('synaps_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const ProjectService = {
  getProjects: async () => {
    const res = await api.get('/projects');
    return res.data?.projects || [];
  },

  createProject: async (name, description) => {
    const res = await api.post('/projects', { name, description });
    return res.data;
  }
};

export const PaperService = {
  uploadPaper: async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/upload?project_id=${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getPapers: async (projectId) => {
    const res = await api.get(`/papers?project_id=${projectId}`);
    return res.data?.papers || [];
  },

  semanticSearch: async (projectId, query, limit = 5) => {
    const res = await api.get(`/search?query=${encodeURIComponent(query)}&project_id=${projectId}&limit=${limit}`);
    return res.data;
  },

  getAuthorNetwork: async (projectId) => {
    const res = await api.get(`/author-network?project_id=${projectId}`);
    return res.data;
  },

  getResearchTimeline: async (projectId) => {
    const res = await api.get(`/timeline?project_id=${projectId}`);
    return res.data;
  },

  askQuestion: async (projectId, question, contextLimit = 3) => {
    const res = await api.get(`/ask?question=${encodeURIComponent(question)}&project_id=${projectId}&context_limit=${contextLimit}`);
    return res.data;
  },

  generateLiteratureReview: async (projectId, topic, paperLimit = 8) => {
    const res = await api.get(`/literature-review?topic=${encodeURIComponent(topic)}&project_id=${projectId}&paper_limit=${paperLimit}`);
    return res.data;
  },

  recommendCitations: async (projectId, paperId, limit = 5) => {
    const res = await api.get(`/recommend-citations?paper_id=${paperId}&project_id=${projectId}&limit=${limit}`);
    return res.data;
  },

  detectResearchGaps: async (projectId) => {
    const res = await api.get(`/research-gaps?project_id=${projectId}`);
    return res.data;
  }
};
