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
  <v-dialog v-model="confirmEnableAll" width="auto">
    <v-card>
      <v-card-text>Are you sure you want to enable "{{ flagDetails.name }}" for all environments?</v-card-text>
      <v-card-actions>
        <v-btn @click="confirmEnableAll = false">Cancel</v-btn>
        <v-btn @click="enableAllEnvironments" color="blue" class="items-end">Enable</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="confirmDisableAll" width="auto">
    <v-card>
      <v-card-text>Are you sure you want to disable "{{ flagDetails.name }}" for all environments?</v-card-text>
      <v-card-actions>
        <v-btn @click="confirmDisableAll = false">Cancel</v-btn>
        <v-btn @click="disableAllEnvironments" color="red" class="items-end">Disable</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="editMetadata" persistent width="700">
    <v-card>
      <v-card-title>Edit Metadata</v-card-title>
      <v-card-text>
        <v-text-field v-model="flagDetails.name" label="Name" outlined></v-text-field>
        <v-textarea v-model="flagDetails.description" label="Description" outlined></v-textarea>
        <v-select v-model="flagDetails.app.id" :items="apps" item-title="name" item-value="id" label="App"
          outlined></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="handleCancelUpdate">Cancel</v-btn>
        <v-btn @click="handleUpdate" color="blue" class="items-end">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar" timeout="2000">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn color="blue" variant="text" @click="snackbar = false">
        Close
      </v-btn>
    </template></v-snackbar>
  <div v-if="flagDetails && flagDetails.app">
    <v-breadcrumbs class="text-sm whitespace-nowrap truncate overflow-ellipsis"
      :items="(breadcrumbs as any)"></v-breadcrumbs>
    <div class="bg-white">
      <div class="flex flex-col md:flex-row md:space-x-4">
        <div class="md:w-1/2">
          <!-- Details Card -->
          <v-card class="mx-auto">
            <v-toolbar color="blue" density="comfortable">
              <v-icon icon="mdi-information-outline" class="ml-2"></v-icon>
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
          <v-card class="mx-auto">
            <v-toolbar color="orange" density="comfortable">
              <v-icon icon="mdi-cloud-outline" class="ml-2"></v-icon>
              <v-toolbar-title>Environments</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn variant="text" icon="mdi-block-helper" @click="confirmDisableAll = true"></v-btn>
              <v-btn variant="text" icon="mdi-check-all" @click="confirmEnableAll = true"></v-btn>
            </v-toolbar>
            <v-text-field clearable label="Search environments" v-model="search" dense hide-details
              single-line></v-text-field>
            <v-expansion-panels>
              <v-expansion-panel v-for="env in filteredEnvironments" :key="env.id" :value="env.id"
                :expand-icon="getEvaluationStrategyIcon(env.evaluationStrategy)"
                :collapse-icon="getEvaluationStrategyIcon(env.evaluationStrategy)">
                <v-expansion-panel-title class="py-0 items-center">
                  <v-row no-gutters class="items-center">
                    <v-col cols="10" class="d-flex justify-start">
                      <span>{{ env.environment.name }}</span>
                    </v-col>
                    <v-col cols="2" class="d-flex justify-end">
                      <v-switch v-model="env.isActive" color="blue" hide-details density="compact"
                        @click.stop="handleToggle(env.environment.id)" :loading="isLoadingToggleFlag"></v-switch>
                    </v-col>
                  </v-row>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="flex">
                        <v-icon class="mr-1" size="small" icon="mdi-information-outline"></v-icon>
                        <p class="text-sm whitespace-pre-wrap">{{ env.environment.description }}</p>
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item class="items-center">
                      <v-list-item-title>
                        <div class="flex items-center">
                          <span class="mr-2">Strategy:</span>
                          <div>
                            <v-chip color="blue">
                              <v-icon class="mr-1" :icon="getEvaluationStrategyIcon(env.evaluationStrategy)"></v-icon>
                              {{ env.evaluationStrategy }}
                            </v-chip>
                          </div>
                        </div>
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <!-- Allowed Users -->
                    <v-list-item v-if="env.evaluationStrategy==='USER' && env.allowedUsers!.length>0">
                      <v-list-item-title class="flex">
                        <v-icon class="mr-1" size="small" color="green" icon="mdi-account-multiple-check-outline"></v-icon>
                        <p class="text-sm whitespace-pre-wrap">Allowed Users ({{ env.allowedUsers!.length }}):</p>
                      </v-list-item-title>
                      <v-virtual-scroll :items="env.allowedUsers" :item-height="32">
                        <template #default="{ item }">
                          <v-list-item-title class="flex">
                            <v-icon class="mr-1" size="small" icon="mdi-account"></v-icon>
                            <p class="text-sm whitespace-pre-wrap">{{ item.name }}</p>
                          </v-list-item-title>
                        </template>
                      </v-virtual-scroll>
                    </v-list-item>
                    <!-- Disallowed Users -->
                    <v-list-item v-if="env.evaluationStrategy==='USER' && env.disallowedUsers!.length>0">
                      <v-list-item-title class="flex">
                        <v-icon class="mr-1" size="small" color="red" icon="mdi-account-multiple-remove-outline"></v-icon>
                        <p class="text-sm whitespace-pre-wrap">Disallowed Users ({{ env.disallowedUsers!.length }}):</p>
                      </v-list-item-title>
                      <v-virtual-scroll :items="env.allowedUsers" :item-height="32">
                        <template #default="{ item }">
                          <v-list-item-title class="flex">
                            <v-icon class="mr-1" size="small" icon="mdi-account"></v-icon>
                            <p class="text-sm whitespace-pre-wrap">{{ item.name }}</p>
                          </v-list-item-title>
                        </template>
                      </v-virtual-scroll>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card>
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
import { evaluationStrategyIcon, getEvaluationStrategyIcon } from '../utils/evaluationStrategyIcon';
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
    const { getFeatureFlagById, toggleFlag, enableFlag, disableFlag, deleteFlag, updateFlagMetadata, updateFlag, getApps, getUsers, isLoading, isLoadingToggleFlag } = useApi();
    const { user } = useAuth0();
    const flagDetails = ref({} as FeatureFlag)
    const originalFlagDetails = ref({} as FeatureFlag)
    const apps = ref([] as App[]);
    const users = ref([] as User[]);
    const userSearch = ref('');
    const editEnvironmentMode = ref(false);
    const search = ref('');
    const breadcrumbs = ref([{}]);
    const panel = ref(['description'])
    const confirmDelete = ref(false);
    const confirmEnableAll = ref(false);
    const confirmDisableAll = ref(false);
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
        confirmDisableAll.value = false;
        snackbar.value = true;
        snackbarText.value = `Disabled ${flagDetails.value.name} for all environments`;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
        snackbar.value = true;
        snackbarText.value = `🚨 Error disabling ${flagDetails.value.name} for all environments`;
      }
    }

    async function enableAllEnvironments() {
      try {
        const newFlag = await enableFlag(flagDetails.value.id, user.value.name ?? 'unknown');
        flagDetails.value = newFlag;
        confirmEnableAll.value = false;
        snackbar.value = true;
        snackbarText.value = `Enabled ${flagDetails.value.name} for all environments`;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
        snackbar.value = true;
        snackbarText.value = `🚨 Error enabling ${flagDetails.value.name} for all environments`;
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
      editMetadata.value = false;
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
      editEnvironmentMode,
      expandedEnvironment,
      toggleRotation,
      evaluationStrategyIcon,
      getEvaluationStrategyIcon,
      filteredEnvironments,
      search,
      getUsersIfNeeded,
      userSearch,
      filteredUsers,
      addToAllowedUsers,
      addToDisallowedUsers,
      isLoading,
      isLoadingToggleFlag,
      disableAllEnvironments,
      enableAllEnvironments,
      breadcrumbs,
      panel,
      confirmDelete,
      confirmEnableAll,
      confirmDisableAll,
      editMetadata,
      handleCancelUpdate,
      snackbar,
      snackbarText,
    };
  },
});
</script>
