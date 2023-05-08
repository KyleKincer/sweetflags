<template>
  <div v-if="flagDetails && flagDetails.app && flagDetails.app.name">
    <div class="bg-white shadow-md rounded-lg p-2">
      <div class="flex flex-col md:flex-row md:space-x-8">
        <div class="md:w-1/2 md:border-r md:border-gray-200 md:pr-8">
          <div class="flex items-center justify-between">
            <div v-if="!editMode" class="w-full overflow-hidden">
              <h2 class="text-2xl font-semibold mr-2 truncate">{{ flagDetails.name }}</h2>
            </div>
            <div v-if="editMode">
              <input v-model="flagDetails.name"
                class="text-2xl w-full font-semibold mr-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <button @click="handleDelete"
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-0.5 px-2 mr-2 rounded" v-if="!editMode">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
            <div v-if="!editMode">
              <button @click="editMode = true"
                class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-0.5 px-3 rounded">
                Edit
              </button>
            </div>
            <div v-if="editMode">
              <button @click="handleUpdate"
                class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-0.5 px-3 rounded">
                Save
              </button>
            </div>
          </div>
          <div class="mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="h-3 w-3 mr-1 text-black">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
            <div v-if="!editMode">
              <router-link :to="{ name: 'AppDetail', params: { appId: flagDetails.app.id } }">
                <p class="text-s pr-4">{{ flagDetails.app.name }}</p>
              </router-link>
            </div>
            <div v-if="editMode">
              <select v-model="flagDetails.app.id"
                class="text-gray-500 text-s pr-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option v-for="app in apps" :key="app.id" :value="app.id">{{ app.name }}</option>
              </select>
            </div>
          </div>
          <!-- ID -->
          <div class="mt-4 border p-1 rounded-md">
            <h3 class="text-lg font-semibold">ID</h3>
            <div class="flex items-center">
              <p class="mr-2 font-mono">{{ flagDetails.id }}</p>
              <button @click="copyToClipboard"
                class="text-gray-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
              </button>
            </div>
          </div>
          <!-- Description -->
          <div class="mt-4 border p-2 rounded-md" v-if="!editMode">
            <h3 class="text-lg font-semibold">Description</h3>
            <p class="max-h-6lines overflow-auto whitespace-pre-wrap md:max-h-none md:overflow-visible">{{
              flagDetails.description
            }}</p>
          </div>
          <div class="mt-4 border p-1 rounded-md" v-if="editMode">
            <h3 class="text-lg font-semibold">Description</h3>
            <textarea v-model="flagDetails.description" rows="4"
              class="w-full p-2 border border-gray-300 rounded-md"></textarea>
          </div>
          <!-- Created -->
          <div class="mt-4 border p-1 rounded-md">
            <h3 class="text-lg font-semibold">Created</h3>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-1">
                <path fill-rule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clip-rule="evenodd" />
              </svg>
              <p>{{ flagDetails.createdBy }}</p>
            </div>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-4 h-4 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              <p>{{ formatDateTime(flagDetails.createdAt) }}</p>
            </div>
          </div>
          <!-- Updated -->
          <div class="mt-4 border p-1 rounded-md">
            <h3 class="text-lg font-semibold">Updated</h3>
            <p>{{ formatDateTime(flagDetails.updatedAt) }}</p>
          </div>
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
                </div>
                <h4 class="font-semibold">Evaluation Strategy:</h4>
                <div class="flex items-center">
                  <div v-html="evaluationStrategyIcon(env.evaluationStrategy)" class="w-4 h-4 mr-1"></div>
                  <p>{{ env.evaluationStrategy }}</p>
                </div>
                <div v-if="env.evaluationStrategy === 'USER'">
                  <h4 class="font-semibold">Allowed Users:</h4>
                  <ul>
                    <li v-for="user in env.allowedUsers" :key="user.id">{{ user.name }}</li>
                  </ul>
                  <h4 class="font-semibold">Disallowed Users:</h4>
                  <ul>
                    <li v-for="user in env.disallowedUsers" :key="user.id">{{ user.name }}</li>
                  </ul>
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
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import { evaluationStrategyIcon } from '../utils/evaluationStrategyIcon';
import { FeatureFlag, App } from 'src/types';
import router from '../router';

export default defineComponent({
  props: {
    flagId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { getFeatureFlagById, toggleFlag, enableFlag, disableFlag, deleteFlag, updateFlag, getApps } = useApi();
    const { user } = useAuth0();
    const flagDetails = ref({} as FeatureFlag)
    const apps = ref([] as App[]);
    const editMode = ref(false);
    const editEnvironmentMode = ref(false);
    const search = ref('');

    var expandedEnvironment = ref('')

    onMounted(async () => {
      await fetchFeatureFlagDetails(props.flagId);
      apps.value = await getApps();
    });

    async function fetchFeatureFlagDetails(id: string) {
      try {
        const data = await getFeatureFlagById(id);
        flagDetails.value = data;
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


    async function handleToggle(envId: string) {
      try {
        const newFlag = await toggleFlag(flagDetails.value.id, envId, user.value.name ?? 'unknown');
        flagDetails.value = newFlag;
      } catch (err) {
        console.error('Error toggling feature flag:', err);
      }
    };

    async function handleUpdate() {
      try {
        const newFlag = await updateFlag(flagDetails.value.id, flagDetails.value.name, flagDetails.value.description, flagDetails.value.app.id, user.value.name ?? 'unknown');
        flagDetails.value = newFlag;
        editMode.value = false;
      } catch (err) {
        console.error('Error updating feature flag:', err);
      }
    };

    async function handleDelete() {
      if (window.confirm('Are you sure you want to delete this feature flag?')) {
        try {
          await deleteFlag(flagDetails.value.id);
          router.push(`/apps/${flagDetails.value.app.id}`);
        } catch (err) {
          console.error('Error deleting feature flag:', err);
        }
      }
    }

    function copyToClipboard() {
      navigator.clipboard.writeText(flagDetails.value.id).then(() => {
        console.log('ID copied to clipboard');
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
      handleDelete,
      editMode,
      editEnvironmentMode,
      expandedEnvironment,
      toggleRotation,
      evaluationStrategyIcon,
      filteredEnvironments,
      search,
      disableAllEnvironments,
      enableAllEnvironments,
    };
  },
});
</script>