// src/composables/useApi.ts
import { ref } from 'vue';
import axios from 'axios';
import { FeatureFlag, FeatureFlagCreatePayload, Environment, App, EnvironmentCreatePayload } from '../types';
import { useAuth0 } from '@auth0/auth0-vue';

export default function useApi() {
  const { getAccessTokenSilently } = useAuth0();
  const api = axios.create({
    baseURL: import.meta.env.VITE_SWEETFLAGS_API_BASE_URL,
  });

  api.interceptors.request.use(async (config) => {
    const token = await getAccessTokenSilently();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  const isLoading = ref(false);
  const error = ref(null);

  async function getApps() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get('/apps');
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function getAppById(appId: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/apps/${appId}`);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function getEnvironments(appId: string): Promise<Environment[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/environments/app/${appId}`);
      return response.data.environments as Environment[];
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function getEnvironmentById(environmentId: string): Promise<Environment> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/environments/${environmentId}`);
      return response.data as Environment;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  }


  async function deleteEnvironment(environmentId: string): Promise<Environment> {
    isLoading.value = true;
    error.value = null;

    try {
      const deletedEnvironment = await api.delete(`/environments/${environmentId}`);
      return deletedEnvironment.data as Environment;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function createEnvironment(environment: EnvironmentCreatePayload): Promise<Environment> {
    isLoading.value = true;
    error.value = null;

    try {
      const createdEnvironment = await api.post('/environments', environment);
      return createdEnvironment.data as Environment;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function getFeatureFlagsByAppId(appId: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/flags/app/${appId}`);
      return response.data as FeatureFlag[];
    } catch (err) {
      // error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function getFeatureFlagById(flagId: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/flags/${flagId}`);
      return response.data as FeatureFlag;
    } catch (err) {
      // error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  const toggleFlag = async (
    id: string,
    environmentId: string,
    updatedBy: string
  ) => {
    try {
      const response = await api.put("/flags/toggle", {
        id,
        environmentId,
        updatedBy,
      });

      return response.data;
    } catch (error) {
      console.error("Failed to toggle flag:", error);
      throw error;
    }
  };

  const enableFlag = async (
    id: string,
    updatedBy: string
  ) => {
    try {
      const response = await api.put("/flags/enable", {
        id,
        updatedBy,
      });

      return response.data;
    } catch (error) {
      console.error("Failed to enable flag:", error);
      throw error;
    }
  };

  const disableFlag = async (
    id: string,
    updatedBy: string
  ) => {
    try {
      const response = await api.put("/flags/disable", {
        id,
        updatedBy,
      });

      return response.data;
    } catch (error) {
      console.error("Failed to disable flag:", error);
      throw error;
    }
  };

  const createFeatureFlag = async (flag: FeatureFlagCreatePayload) => {
    try {
      const response = await api.post("/flags", flag);
      return response.data;
    } catch (error) {
      console.error("Failed to create flag:", error);
      throw error;
    }
  };

  async function updateFlag(id: string, name: string, description: string, app: string, updatedBy: string): Promise<FeatureFlag> {
    try {
      const response = await api.put(`/flags/${id}/metadata`, {
        "flagName": name,
        "description": description,
        "app": app,
        "updatedBy": updatedBy,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw error;
    }
  }

  async function deleteFlag(id: string): Promise<FeatureFlag> {
    try {
      const response = await api.delete(`/flags/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      throw error;
    }
  }

  async function createApp(app: App) {
    try {
      const response = await api.post("/apps", app);
      return response.data;
    } catch (error) {
      console.error("Failed to create app:", error);
      throw error;
    }
  };

  async function getUsers(appId: string) {
    isLoading.value = true;
    try {
      const response = await api.get(`/users/app/${appId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get users:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  async function getAuditLogsByDocumentId(documentId: string, page: number = 1, limit: number = 10) {
    isLoading.value = true;
    try {
      const response = await api.get(`/auditlog/doc/${documentId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get audit logs:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    getApps,
    getAppById,
    getFeatureFlagsByAppId,
    getFeatureFlagById,
    getEnvironments,
    getEnvironmentById,
    createEnvironment,
    deleteEnvironment,
    toggleFlag,
    enableFlag,
    disableFlag,
    createFeatureFlag,
    createApp,
    updateFlag,
    deleteFlag,
    getUsers,
    getAuditLogsByDocumentId,
  };
}