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
  <v-dialog v-model="editEnvironment" persistent width="700">
    <v-card>
      <v-card-title>Edit Environment</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              <v-slide-group show-arrows center-active mandatory v-model="environmentToEdit">
                <v-slide-group-item v-for="environment in flagDetails.environments" :key="environment.id"
                  v-slot="{ isSelected, toggle }" :value="environment.environment.id">
                  <v-btn class="ma-2 mb-8" rounded :color="isSelected ? 'orange' : 'undefined'" @click="toggle">
                    {{ environment.environment.name }}
                  </v-btn>
                </v-slide-group-item>
              </v-slide-group>
              <div class="flex items-center">
                <p class="mr-2">Evaluation Strategy:</p>
                <v-btn-toggle mandatory v-if="flagDetails.environments"
                  v-model="flagDetails.environments[environmentToEditIndex].evaluationStrategy">
                  <v-btn value="BOOLEAN" :icon="getEvaluationStrategyIcon('BOOLEAN')"></v-btn>
                  <v-btn value="USER" :icon="getEvaluationStrategyIcon('USER')"></v-btn>
                  <v-btn value="PERCENTAGE" :icon="getEvaluationStrategyIcon('PERCENTAGE')"></v-btn>
                  <v-btn value="PROBABALISTIC" :icon="getEvaluationStrategyIcon('PROBABALISTIC')"></v-btn>
                </v-btn-toggle>
              </div>
              <div v-if="flagDetails.environments[environmentToEditIndex].evaluationStrategy === 'USER'">
                <v-card class="mt-4">
                  <v-card-title>Users</v-card-title>
                  <v-text-field label="Search users" append-inner-icon="mdi-magnify" v-model="userSearch" dense
                    hide-details single-line></v-text-field>
                  <v-progress-linear v-if="isLoadingGetUsers" :indeterminate="true"></v-progress-linear>
                  <v-virtual-scroll v-if="!isLoadingGetUsers" :items="filteredUsers" :item-height="25" height="300px">
                    <template v-slot="{ item }">
                      <v-list-item v-if="item" :key="item.id">
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <template v-slot:append>
                          <v-btn @click="addToDisallowedUsers(environmentToEdit, item)" size="x-small" class="mr-1"
                            :color="flagDetails.environments[environmentToEditIndex].disallowedUsers!.some(user => user.id === item.id) ? 'red' : undefined"
                            icon>
                            <v-icon icon="mdi-block-helper"></v-icon>
                          </v-btn>
                          <v-btn @click="addToAllowedUsers(environmentToEdit, item)" size="x-small"
                            :color="flagDetails.environments[environmentToEditIndex].allowedUsers!.some(user => user.id === item.id) ? 'green' : undefined"
                            icon>
                            <v-icon icon="mdi-plus"></v-icon>
                          </v-btn>
                        </template>
                        <v-divider></v-divider>
                      </v-list-item>
                    </template>
                  </v-virtual-scroll>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="handleCancelUpdate">Cancel</v-btn>
        <v-btn @click="handleUpdateEnvironment(environmentToEdit)" color="blue" class="items-end">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <div v-if="flagDetails && flagDetails.app">
    <v-breadcrumbs class="text-sm whitespace-nowrap truncate overflow-ellipsis" :items="(breadcrumbs as any)">
    </v-breadcrumbs>
    <v-container>
      <v-row>
        <v-col>
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
        </v-col>
        <v-col>
          <!-- Environments -->
          <v-card class="mx-auto">
            <v-toolbar color="orange" density="comfortable">
              <v-icon icon="mdi-cloud-outline" class="ml-2"></v-icon>
              <v-toolbar-title class="whitespace-normal overflow-visible">Environments</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn variant="text" icon="mdi-block-helper" @click="confirmDisableAll = true"></v-btn>
              <v-btn variant="text" icon="mdi-check-all" @click="confirmEnableAll = true"></v-btn>
            </v-toolbar>
            <v-text-field label="Search environments" append-inner-icon="mdi-magnify" v-model="search" dense hide-details
              single-line></v-text-field>
            <v-expansion-panels variant="accordion" multiple>
              <v-expansion-panel v-for="env in filteredEnvironments" :key="env.id" :value="env.id"
                :expand-icon="getEvaluationStrategyIcon(env.evaluationStrategy)"
                :collapse-icon="getEvaluationStrategyIcon(env.evaluationStrategy)">
                <v-expansion-panel-title class="py-0 items-center">
                  <v-row no-gutters class="items-center">
                    <v-col cols="8" class="d-flex justify-start">
                      <span>{{ env.environment.name }}</span>
                    </v-col>
                    <v-col cols="2" class="d-flex justify-center">
                      <v-btn icon size="x-small" @click.stop="handleEnableEdit(env.environment.id)">
                        <v-icon>mdi-pencil-outline</v-icon>
                      </v-btn>
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
                    <v-list-item v-if="env.evaluationStrategy === 'USER' && env.allowedUsers!.length > 0">
                      <v-list-item-title class="flex">
                        <v-icon class="mr-1" size="small" color="green"
                          icon="mdi-account-multiple-check-outline"></v-icon>
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
                    <v-list-item v-if="env.evaluationStrategy === 'USER' && env.disallowedUsers!.length > 0">
                      <v-list-item-title class="flex">
                        <v-icon class="mr-1" size="small" color="red" icon="mdi-account-multiple-remove-outline"></v-icon>
                        <p class="text-sm whitespace-pre-wrap">Disallowed Users ({{ env.disallowedUsers!.length }}):</p>
                      </v-list-item-title>
                      <v-virtual-scroll :items="env.disallowedUsers" :item-height="32">
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
        </v-col>
      </v-row>
      <v-row>
        <!-- Recent Activity -->
        <RecentActivity :targetId="flagDetails.id" :linkToTarget="false" :key="logRefresher" />
      </v-row>
    </v-container>
  </div>
  <div v-else-if="!isLoadingGetFeatureFlagById">
    <v-container>
      <v-row>
        <v-spacer></v-spacer>
        <v-col sm="8">
          <v-card class="pa-4" color="red">
            <v-card-title class="text-h5">
              <div class="items-center text-center">
                <v-icon icon="mdi-alert-circle-outline" class="mr-2"></v-icon>
                <span>Feature flag not found</span>
              </div>
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 text-center">No feature flag with the id <strong>{{ flagId }}</strong> was found.</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
    </v-container>
  </div>
  <div v-if="isLoadingGetFeatureFlagById" class="fixed inset-0 flex items-center justify-center">
    <v-progress-circular indeterminate color="blue"></v-progress-circular>
  </div>
</template>
  

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import timeSince from '../utils/timeSince';
import formatDateTime from '../utils/formatDateTime';
import { evaluationStrategyIcon, getEvaluationStrategyIcon } from '../utils/evaluationStrategyIcon';
import { FeatureFlag, App, User } from 'src/types';
import router from '../router';
import RecentActivity from './RecentActivity.vue';
import { snackbarState } from '../utils/snackbarState';

export default defineComponent({
  props: {
    flagId: {
      type: String,
      required: true,
    },
  },
  components: {
    RecentActivity,
  },
  setup(props) {
    const { getFeatureFlagById, toggleFlag, enableFlag, disableFlag, deleteFlag, updateFlagMetadata, updateFlag, getApps, getUsers, isLoadingGetFeatureFlagById, isLoadingGetUsers, isLoadingToggleFlag } = useApi();
    const { user } = useAuth0();
    const flagDetails = ref({} as FeatureFlag)
    const originalFlagDetails = ref({} as FeatureFlag)
    const apps = ref([] as App[]);
    const users = ref([] as User[]);
    const userSearch = ref('');
    const editEnvironmentMode = ref(false);
    const environmentToEdit = ref('');
    const environmentToEditIndex = ref(0);
    const search = ref('');
    const breadcrumbs = ref([{}]);
    const panel = ref(['description'])
    const confirmDelete = ref(false);
    const confirmEnableAll = ref(false);
    const confirmDisableAll = ref(false);
    const editMetadata = ref(false);
    const logRefresher = ref(0);

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
    }, { deep: true });

    // watch for changes to environmentToEdit and set the index
    watch(environmentToEdit, (newVal, oldVal) => {
      if (newVal) {
        environmentToEditIndex.value = flagDetails.value.environments.findIndex(env => env.environment.id === newVal);
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
        snackbarState.showSnackbar(`Disabled ${flagDetails.value.name} for all environments`);
        logRefresher.value += 1;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
        snackbarState.showSnackbar(`🚨 Error disabling ${flagDetails.value.name} for all environments`);
      }
    }

    async function enableAllEnvironments() {
      try {
        const newFlag = await enableFlag(flagDetails.value.id, user.value.name ?? 'unknown');
        flagDetails.value = newFlag;
        confirmEnableAll.value = false;
        snackbarState.showSnackbar(`Enabled ${flagDetails.value.name} for all environments`);
        logRefresher.value += 1;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
        snackbarState.showSnackbar(`🚨 Error enabling ${flagDetails.value.name} for all environments`);
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
      }).sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        }
        return 1;
      })// sort users who are in the allowedUsers or disallowedUsers arrays to the top
        .sort((a, b) => {
          const allowedUsers = flagDetails.value.environments.find(env => env.environment.id === environmentToEdit.value)?.allowedUsers;
          const disallowedUsers = flagDetails.value.environments.find(env => env.environment.id === environmentToEdit.value)?.disallowedUsers;
          if (allowedUsers?.map(user => user.id).includes(a.id) && !allowedUsers?.map(user => user.id).includes(b.id)) {
            return -1;
          }
          if (!allowedUsers?.map(user => user.id).includes(a.id) && allowedUsers?.map(user => user.id).includes(b.id)) {
            return 1;
          }
          if (disallowedUsers?.map(user => user.id).includes(a.id) && !disallowedUsers?.map(user => user.id).includes(b.id)) {
            return -1;
          }
          if (!disallowedUsers?.map(user => user.id).includes(a.id) && disallowedUsers?.map(user => user.id).includes(b.id)) {
            return 1;
          }
          return 0;
        });
    });

    function addToAllowedUsers(envId: string, user: User) {
      let allowedUsers = flagDetails.value.environments.find(env => env.environment.id === envId)?.allowedUsers;
      let disallowedUsers = flagDetails.value.environments.find(env => env.environment.id === envId)?.disallowedUsers;
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
      flagDetails.value.environments.find(env => env.environment.id === envId)!.allowedUsers = allowedUsers;
      flagDetails.value.environments.find(env => env.environment.id === envId)!.disallowedUsers = disallowedUsers;
    }

    function addToDisallowedUsers(envId: string, user: User) {
      let allowedUsers = flagDetails.value.environments.find(env => env.environment.id === envId)?.allowedUsers;
      let disallowedUsers = flagDetails.value.environments.find(env => env.environment.id === envId)?.disallowedUsers;
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
      flagDetails.value.environments.find(env => env.environment.id === envId)!.allowedUsers = allowedUsers;
      flagDetails.value.environments.find(env => env.environment.id === envId)!.disallowedUsers = disallowedUsers;
    }

    async function handleToggle(envId: string) {
      try {
        const newFlag = await toggleFlag(flagDetails.value.id, envId, user.value.name ?? 'unknown');
        flagDetails.value = newFlag;
        logRefresher.value += 1;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
      }
    };

    async function handleCancelUpdate() {
      // reset the flag details to the original values
      flagDetails.value = JSON.parse(JSON.stringify(originalFlagDetails.value));
      // exit edit mode
      editMetadata.value = false;
      editEnvironmentMode.value = false;
    }

    async function handleUpdate() {
      try {
        // compare the original flag details with the new ones to see if anything has changed
        if (JSON.stringify(flagDetails.value) === JSON.stringify(originalFlagDetails.value)) {
          // nothing has changed
          snackbarState.showSnackbar('No changes were made');
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
        snackbarState.showSnackbar('Feature flag updated successfully');
        logRefresher.value += 1;
      } catch (err) {
        console.error('Error updating feature flag:', err);
        snackbarState.showSnackbar('Error updating feature flag');
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
        logRefresher.value += 1;
        snackbarState.showSnackbar('Feature flag updated successfully');
      } catch (err) {
        console.error('Error updating feature flag:', err);
      }
    };

    function handleEnableEdit(envId: string) {
      // set the original flag details to the current flag details
      originalFlagDetails.value = JSON.parse(JSON.stringify(flagDetails.value));
      // set the environment to edit
      environmentToEdit.value = envId;
      environmentToEditIndex.value = flagDetails.value.environments.findIndex(env => env.environment.id === envId);
      // enter edit mode
      editEnvironmentMode.value = true;
    }

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
        snackbarState.showSnackbar('ID copied to clipboard');
      }).catch((err) => {
        console.error('Failed to copy ID to clipboard:', err);
      });
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
      editEnvironment: editEnvironmentMode,
      expandedEnvironment,
      toggleRotation,
      evaluationStrategyIcon,
      getEvaluationStrategyIcon,
      filteredEnvironments,
      search,
      getUsersIfNeeded,
      users,
      userSearch,
      filteredUsers,
      addToAllowedUsers,
      addToDisallowedUsers,
      isLoadingGetFeatureFlagById,
      isLoadingToggleFlag,
      isLoadingGetUsers,
      disableAllEnvironments,
      enableAllEnvironments,
      breadcrumbs,
      panel,
      confirmDelete,
      confirmEnableAll,
      confirmDisableAll,
      editMetadata,
      handleCancelUpdate,
      logRefresher,
      timeSince,
      handleEnableEdit,
      environmentToEdit,
      environmentToEditIndex,
    };
  },
});
</script>
