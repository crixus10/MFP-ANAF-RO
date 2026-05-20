import create from 'zustand';
import api from '../api/client';

const useCompanyStore = create((set) => ({
  companies: [],
  currentCompany: null,
  loading: false,
  error: null,

  fetchCompanies: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/companies');
      set({
        companies: response.data.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message,
      });
    }
  },

  selectCompany: (company) => {
    localStorage.setItem('selectedCompanyId', company.id);
    set({ currentCompany: company });
  },

  createCompany: async (data) => {
    try {
      set({ loading: true });
      const response = await api.post('/companies', data);
      set((state) => ({
        companies: [...state.companies, response.data.data],
        currentCompany: response.data.data,
        loading: false,
        error: null,
      }));
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },

  updateCompany: async (id, data) => {
    try {
      set({ loading: true });
      const response = await api.put(`/companies/${id}`, data);
      set((state) => ({
        companies: state.companies.map((c) => (c.id === id ? response.data.data : c)),
        currentCompany:
          state.currentCompany?.id === id ? response.data.data : state.currentCompany,
        loading: false,
        error: null,
      }));
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },

  verifyTaxStatus: async (companyId) => {
    try {
      set({ loading: true });
      const response = await api.post(`/companies/${companyId}/verify-tax-status`);
      set({
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },
}));

export default useCompanyStore;
