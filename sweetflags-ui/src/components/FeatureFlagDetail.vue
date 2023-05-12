<template>
  <v-dialog v-model="confirmDelete" width="auto">
    <v-card>
      <v-card-text>Are you sure you want to delete this feature flag?</v-card-text>
      <v-card-actions>
        <v-btn @click="confirmDelete = false">Cancel</v-btn>
        <v-btn @click="handleDelete" color="red" class="items-end">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="editMetadata" persistent width="700">
    <v-card>
      <v-card-title>Edit Metadata</v-card-title>
      <v-card-text>
        <v-text-field v-model="flagDetails.name" label="Name" outlined></v-text-field>
        <v-textarea v-model="flagDetails.description" label="Description" outlined></v-textarea>
        <v-select v-model="flagDetails.app.id" :items="apps" item-title="name" item-value="id" label="App" outlined></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="handleCancelUpdate">Cancel</v-btn>
        <v-btn @click="handleUpdate" color="green" class="items-end">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar" timeout="4000" >
    {{ snackbarText }}
    <template v-slot:actions>
        <v-btn
          color="blue"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template></v-snackbar>
  <div v-if="flagDetails && flagDetails.app && flagDetails.app.name">
    <v-breadcrumbs class="text-sm whitespace-nowrap truncate overflow-ellipsis"
      :items="(breadcrumbs as any)"></v-breadcrumbs>
    <div class="bg-white shadow-md rounded-lg p-2">
      <div class="flex flex-col md:flex-row md:space-x-8">
        <div class="md:w-1/2 md:border-r md:pr-4">
          <v-card class="mx-auto">
            <v-toolbar color="blue" density="comfortable">
              <v-toolbar-title>Details</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn variant="text" icon="mdi-delete-outline" @click="confirmDelete = true"></v-btn>
              <v-btn variant="text" icon="mdi-pencil-outline" @click="editMetadata = true"></v-btn>
            </v-toolbar>
            <v-list density="comfortable">
              <!-- Name -->
              <v-list-item title="Name:">
                <template v-slot:append>
                  <v-chip color="blue">{{ flagDetails.name }}</v-chip>
                </template>
              </v-list-item>
              <v-divider></v-divider>
              <!-- ID -->
              <v-list-item title="ID:">
                <template v-slot:append>
                  <p class="font-mono text-sm">{{ flagDetails.id }}</p>
                  <v-btn icon="mdi-content-copy" variant="text" size="x-small" @click="copyToClipboard">
                  </v-btn>
                </template>
              </v-list-item>
              <!-- Description -->
              <v-list-item>
                <v-expansion-panels v-model="panel">
                  <v-expansion-panel title="Description:" :text="flagDetails.description || 'No description provided.'"
                    value="description" class="overflow-auto whitespace-pre-wrap">
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-list-item>
              <v-divider></v-divider>
              <!-- Created -->
              <v-list-item title="Created:" :subtitle="formatDateTime(flagDetails.createdAt)">
                <template v-slot:prepend>
                  <v-icon icon="mdi-star-plus-outline"></v-icon>
                </template>
                <template v-slot:append>
                  <v-chip color="blue">{{ flagDetails.createdBy }}</v-chip>
                </template>
              </v-list-item>
              <v-divider></v-divider>
              <!-- Updated -->
              <v-list-item title="Updated:" :subtitle="formatDateTime(flagDetails.updatedAt)">
                <template v-slot:prepend>
                  <v-icon icon="mdi-update"></v-icon>
                </template>
                <template v-slot:append>
                  <v-chip color="blue">{{ flagDetails.updatedBy }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
        <!-- Environments -->
        <div class="md:w-1/2">
          <div class="sm:flex-row md:flex items-center justify-between mt-4">
            <h2 class="text-2xl font-semibold">Environments</h2>
            <div class="flex space-x-2">
              <button @click="disableAllEnvironments"
                class="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded truncate">
                Disable All
              </button>
              <button @click="enableAllEnvironments"
                class="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded truncate">
                Enable All
              </button>
            </div>
          </div>
          <input v-model="search" type="text" placeholder="Search environments"
            class="w-full mt-4 p-1 border border-gray-300 rounded-md" />
          <div v-for="env in filteredEnvironments" :key="env.environment.environment"
            class="mt-4 p-4 pl-2 border border-gray-200 rounded-md cursor-pointer select-none hover:bg-gray-200 transition-colors duration-200 ease-in">
            <div @click="toggleRotation(env.environment.name)">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-5 h-5 mr-1 transition-transform duration-500 ease-in-out"
                  :class="{ 'rotate-90': expandedEnvironment === env.environment.name }">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <div class="flex w-full items-center justify-between">
                  <h4 class="font-medium">{{ env.environment.name }}</h4>
                  <div class="flex items-center justify-end">
                    <div v-html="evaluationStrategyIcon(env.evaluationStrategy)" class="w-4 h-4 mr-2"></div>
                    <span :class="[
                      'px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-100 ease-in',
                      env.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white',
                    ]" @click.stop="handleToggle(env.environment.id)">
                      {{ env.isActive ? 'Enabled' : 'Disabled' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Collapse :when="expandedEnvironment === env.environment.name" class="v-collapse">
              <div class="ml-6 mt-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-4 h-4 mr-1">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    <p>{{ env.environment.description }}</p>
                  </div>
                  <div v-if="!editEnvironmentMode">
                    <button @click="editEnvironmentMode = true"
                      class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-0.5 px-3 rounded">
                      Edit
                    </button>
                  </div>
                  <div v-else class="flex items-center mx-1">
                    <button @click="cancelEdit"
                      class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-0.5 px-3 rounded mr-1">
                      Cancel
                    </button>
                    <button @click="handleUpdateEnvironment(env.environment.id)"
                      class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-0.5 px-3 rounded">
                      Save
                    </button>
                  </div>
                </div>
                <h4 class="font-semibold">Evaluation Strategy:</h4>
                <div class="flex items-center">
                  <div v-html="evaluationStrategyIcon(env.evaluationStrategy)" class="w-4 h-4 mr-2"></div>
                  <template v-if="!editEnvironmentMode">
                    <span>{{ env.evaluationStrategy }}</span>
                  </template>
                  <template v-else>
                    <select v-model="env.evaluationStrategy"
                      class="border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                      @change="getUsersIfNeeded">
                      <option value="BOOLEAN">Boolean</option>
                      <option value="USER">User</option>
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="PROBABALISTIC">Probabilistic</option>
                    </select>
                  </template>
                </div>
                <div v-if="editEnvironmentMode && env.evaluationStrategy === 'USER'">
                  <label for="userSearch" class="block text-sm mb-2">Search Users: ({{ filteredUsers.length }})</label>
                  <input type="text" id="userSearch" v-model="userSearch"
                    class="w-full px-3 py-2 mb-4 border border-gray-300 rounded" placeholder="Search for users..." />
                  <div class="relative mb-4 h-64 overflow-y-auto">
                    <ul v-show="!isLoading">
                      <li v-for="user in filteredUsers" :key="user.id"
                        class="p-2 border bg-white shadow-md rounded-md flex items-center justify-between whitespace-nowrap hover:bg-gray-200 transition-colors duration-200 ease-in">
                        <span class="flex-grow text whitespace-nowrap truncate">{{ user.name }}</span>
                        <div v-if="env.allowedUsers?.map(user => user.id).includes(user.id)" class="ml-4 text-green-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            class="w-5 h-5 mr-2">
                            <path fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div v-if="env.disallowedUsers?.map(user => user.id).includes(user.id)" class="ml-4 text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            class="w-5 h-5 mr-2">
                            <path fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <button @click.prevent="addToAllowedUsers(env.id, user)"
                            class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2">
                            Allow
                          </button>
                          <button @click.prevent="addToDisallowedUsers(env.id, user)"
                            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                            Disallow
                          </button>
                        </div>
                      </li>
                    </ul>
                    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  </div>
                  <div class="flex flex-row justify-between">
                    <div class="w-1/2 mr-2">
                      <h3 class="text-lg font-semibold mb-2">Allowed Users</h3>
                      <ul class="px-2">
                        <li v-for="user in env.allowedUsers" :key="user.id" class="mb-2 truncate">
                          <span class="text whitespace-nowrap truncate">
                            {{ user.name }}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div class="w-1/2 ml-2">
                      <h3 class="text-lg font-semibold mb-2">Disallowed Users</h3>
                      <ul>
                        <li v-for="user in env.disallowedUsers" :key="user.id" class="mb-2">
                          {{ user.name }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-if="!editEnvironmentMode && env.evaluationStrategy === 'USER'">
                  <div v-if="env.allowedUsers && env.allowedUsers.length > 0">
                    <h4 class="font-semibold">Allowed Users:</h4>
                    <ul>
                      <li v-for="user in env.allowedUsers" :key="user.id">{{ user.name }}</li>
                    </ul>
                  </div>
                  <div v-if="env.disallowedUsers && env.disallowedUsers.length > 0">
                    <h4 class="font-semibold">Disallowed Users:</h4>
                    <ul>
                      <li v-for="user in env.disallowedUsers" :key="user.id">{{ user.name }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="fixed inset-0 flex items-center justify-center">
    <div class="loading-spinner">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  </div>
</template>
  

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import { evaluationStrategyIcon } from '../utils/evaluationStrategyIcon';
import { FeatureFlag, App, User } from 'src/types';
import router from '../router';
import LoadingSpinner from './LoadingSpinner.vue';

export default defineComponent({
  props: {
    flagId: {
      type: String,
      required: true,
    },
  },
  components: {
    LoadingSpinner,
  },
  setup(props) {
    const { getFeatureFlagById, toggleFlag, enableFlag, disableFlag, deleteFlag, updateFlagMetadata, updateFlag, getApps, getUsers, isLoading } = useApi();
    const { user } = useAuth0();
    const flagDetails = ref({} as FeatureFlag)
    const originalFlagDetails = ref({} as FeatureFlag)
    const apps = ref([] as App[]);
    const users = ref([] as User[]);
    const userSearch = ref('');
    const editMode = ref(false);
    const editEnvironmentMode = ref(false);
    const search = ref('');
    const breadcrumbs = ref([{}]);
    const panel = ref(['description'])
    const confirmDelete = ref(false);
    const editMetadata = ref(false);
    const snackbar = ref(false);
    const snackbarText = ref('');

    var expandedEnvironment = ref('')

    onMounted(async () => {
      await fetchFeatureFlagDetails(props.flagId);
      apps.value = await getApps();
      setBreadcrumb();

    });

    // watch for changes to flagDetails.environments and get users if evaluationstrategy is USER
    watch(flagDetails, async (newVal, oldVal) => {
      if (newVal.environments && newVal.environments.length > 0 && newVal.environments.some(env => env.evaluationStrategy === 'USER')) {
        await getUsersIfNeeded();
      }
    });

    async function getUsersIfNeeded() {
      if (users.value.length === 0) {
        users.value = await getUsers(flagDetails.value.app.id);
      }
    }

    async function setBreadcrumb() {
      breadcrumbs.value = [
        {
          title: 'Home',
          disabled: false,
          to: '/',
        },
        {
          title: flagDetails.value.app.name,
          disabled: false,
          to: `/apps/${flagDetails.value.app.id}`,
        },
        {
          title: flagDetails.value.name,
          disabled: true,
          to: `/flags/${flagDetails.value.id}`,
        }
      ];
    }

    async function fetchFeatureFlagDetails(id: string) {
      try {
        const data = await getFeatureFlagById(id);
        flagDetails.value = data;
        // make a copy of the flag details so we can reset them if the user cancels
        originalFlagDetails.value = JSON.parse(JSON.stringify(data));
      } catch (err) {
        console.error('Error fetching feature flag details:', err);
      }
    }

    async function disableAllEnvironments() {
      try {
        const newFlag = await disableFlag(flagDetails.value.id, user.value.name ?? 'unknown');
        flagDetails.value = newFlag;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
      }
    }

    async function enableAllEnvironments() {
      try {
        const newFlag = await enableFlag(flagDetails.value.id, user.value.name ?? 'unknown');
        flagDetails.value = newFlag;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
      }
    }

    const filteredEnvironments = computed(() => {
      return flagDetails.value.environments.filter((env) => {
        const nameMatch = env.environment.name.toLowerCase().includes(search.value.toLowerCase());
        return nameMatch;
      });
    });

    const filteredUsers = computed(() => {
      return users.value?.filter(user => {
        const nameMatches = !userSearch.value || user.name.toLowerCase().includes(userSearch.value.toLowerCase());
        const externalIdMatches = !userSearch.value || user.externalId.toLowerCase().includes(userSearch.value.toLowerCase());
        const isActive = user.isActive;
        return (nameMatches || externalIdMatches) && isActive;
      });
    });

    function addToAllowedUsers(envId: string, user: User) {
      let allowedUsers = flagDetails.value.environments.find(env => env.id === envId)?.allowedUsers;
      let disallowedUsers = flagDetails.value.environments.find(env => env.id === envId)?.disallowedUsers;
      if (!allowedUsers) {
        allowedUsers = [];
      }
      if (!disallowedUsers) {
        disallowedUsers = [];
      }
      if (!allowedUsers.map(user => user.id).includes(user.id)) {
        allowedUsers.push(user);
        if (disallowedUsers.map(user => user.id).includes(user.id)) {
          disallowedUsers = disallowedUsers.filter(disallowedUser => disallowedUser.id !== user.id);
        }
      } else {
        allowedUsers = allowedUsers.filter(allowedUser => allowedUser.id !== user.id);
      }
      flagDetails.value.environments.find(env => env.id === envId)!.allowedUsers = allowedUsers;
      flagDetails.value.environments.find(env => env.id === envId)!.disallowedUsers = disallowedUsers;
    }

    function addToDisallowedUsers(envId: string, user: User) {
      let allowedUsers = flagDetails.value.environments.find(env => env.id === envId)?.allowedUsers;
      let disallowedUsers = flagDetails.value.environments.find(env => env.id === envId)?.disallowedUsers;
      if (!allowedUsers) {
        allowedUsers = [];
      }
      if (!disallowedUsers) {
        disallowedUsers = [];
      }
      if (!disallowedUsers?.map(user => user.id).includes(user.id)) {
        disallowedUsers.push(user);
        if (allowedUsers.map(user => user.id).includes(user.id)) {
          allowedUsers = allowedUsers.filter(allowedUser => allowedUser.id !== user.id);
        }
      } else {
        disallowedUsers = disallowedUsers.filter(disallowedUser => disallowedUser.id !== user.id);
      }
      flagDetails.value.environments.find(env => env.id === envId)!.allowedUsers = allowedUsers;
      flagDetails.value.environments.find(env => env.id === envId)!.disallowedUsers = disallowedUsers;
    }

    async function handleToggle(envId: string) {
      try {
        const newFlag = await toggleFlag(flagDetails.value.id, envId, user.value.name ?? 'unknown');
        flagDetails.value = newFlag;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
      }
    };

    async function handleCancelUpdate() {
      // reset the flag details to the original values
      flagDetails.value = JSON.parse(JSON.stringify(originalFlagDetails.value));
      // exit edit mode
      editMetadata.value = false;
    }

    async function handleUpdate() {
      try {
        // compare the original flag details with the new ones to see if anything has changed
        if (JSON.stringify(flagDetails.value) === JSON.stringify(originalFlagDetails.value)) {
          // nothing has changed
          snackbar.value = true;
          snackbarText.value = 'No changes were made'; 
          return;
        }

        // something has changed, so update the flag. only send the fields that have changed
        // loop through the original flag details and compare each field to the new flag details
        // if the field has changed, add it to the update object
        const updateObj: any = {};
        for (const [key, value] of Object.entries(originalFlagDetails.value as FeatureFlag)) {
          if (
            JSON.stringify(value) !==
            JSON.stringify((flagDetails.value as FeatureFlag)[key])
          ) {
            updateObj[key] = (flagDetails.value as FeatureFlag)[key];
          }
        }

        // update the flag. only send the fields that have changed
        const newFlag = await updateFlagMetadata(
          flagDetails.value.id,
          user.value.name ?? 'unknown',
          updateObj.name,
          updateObj.description,
          updateObj.app?.id
        );

        flagDetails.value = newFlag;
        originalFlagDetails.value = JSON.parse(JSON.stringify(newFlag));
        editMetadata.value = false;
        setBreadcrumb();
        snackbar.value = true;
        snackbarText.value = 'Feature flag updated successfully';
      } catch (err) {
        console.error('Error updating feature flag:', err);
        snackbar.value = true;
        snackbarText.value = 'Error updating feature flag';
      }
    };

    async function handleUpdateEnvironment(envId: string) {
      try {
        // Find the original environment and the new environment by the given ID
        const originalEnvironment = originalFlagDetails.value.environments.find(env => env.environment.id === envId);
        const newEnvironment = flagDetails.value.environments.find(env => env.environment.id === envId);

        if (!originalEnvironment || !newEnvironment) {
          console.error('Environment not found');
          return;
        }

        // Compare the original environment with the new one to see if anything has changed
        if (JSON.stringify(originalEnvironment) === JSON.stringify(newEnvironment)) {
          // nothing has changed, so just exit edit mode
          editEnvironmentMode.value = false;
          return;
        }

        // something has changed, so update the flag. only send the fields that have changed
        // loop through the original environment and compare each field to the new environment
        // if the field has changed, add it to the update object
        const updateObj: Partial<FeatureFlag> = { id: envId };
        for (const [key, value] of Object.entries(originalEnvironment)) {
          const typedKey = key as keyof typeof originalEnvironment;
          if (JSON.stringify(value) !== JSON.stringify(newEnvironment[typedKey])) {
            updateObj[typedKey] = newEnvironment[typedKey];
          }
        }

        // Update the flag with the changed environment
        const newFlag = await updateFlag(
          flagDetails.value.id,
          envId,
          user.value.name ?? 'unknown',
          updateObj.isActive,
          updateObj.evaluationStrategy,
          updateObj.evaluationPercentage,
          updateObj.allowedUsers?.map((user: User) => user.id),
          updateObj.disallowedUsers?.map((user: User) => user.id),
        );

        flagDetails.value = newFlag;
        originalFlagDetails.value = JSON.parse(JSON.stringify(newFlag));
        editEnvironmentMode.value = false;
      } catch (err) {
        console.error('Error updating feature flag:', err);
      }
    };

    async function handleDelete() {
      try {
        await deleteFlag(flagDetails.value.id);
        router.push(`/apps/${flagDetails.value.app.id}`);
      } catch (err) {
        console.error('Error deleting feature flag:', err);
      }
    }

    async function cancelEdit() {
      // reset the flag details to the original values
      flagDetails.value = JSON.parse(JSON.stringify(originalFlagDetails.value));
      editMode.value = false;
      editEnvironmentMode.value = false;
    }

    function copyToClipboard() {
      navigator.clipboard.writeText(flagDetails.value.id).then(() => {
        snackbar.value = true;
        snackbarText.value = 'ID copied to clipboard';
      }).catch((err) => {
        console.error('Failed to copy ID to clipboard:', err);
      });
    }

    function formatDateTime(date: string) {
      if (date) {
        return new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        }).format(new Date(date));
      }
      return '';
    }

    function toggleRotation(envName: string) {
      if (expandedEnvironment.value === envName) {
        expandedEnvironment.value = '';
        editEnvironmentMode.value = false;
      } else {
        expandedEnvironment.value = envName;
      }
    }

    return {
      flagDetails,
      apps,
      copyToClipboard,
      formatDateTime,
      handleToggle,
      handleUpdate,
      handleUpdateEnvironment,
      handleDelete,
      cancelEdit,
      editMode,
      editEnvironmentMode,
      expandedEnvironment,
      toggleRotation,
      evaluationStrategyIcon,
      filteredEnvironments,
      search,
      getUsersIfNeeded,
      userSearch,
      filteredUsers,
      addToAllowedUsers,
      addToDisallowedUsers,
      isLoading,
      disableAllEnvironments,
      enableAllEnvironments,
      breadcrumbs,
      panel,
      confirmDelete,
      editMetadata,
      handleCancelUpdate,
      snackbar,
      snackbarText,
    };
  },
});
</script>
