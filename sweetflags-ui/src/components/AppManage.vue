<template>
    <div v-if="app">
        <div class="flex justify-center items-center mb-4">
            <div class="flex flex-col items-center">
                <h2 class="text-2xl font-semibold">{{ app?.name }}</h2>
                <h1 class="text-md font-light italic">{{ app?.description }}</h1>
            </div>
        </div>
        <div class="bg-white shadow-md rounded-lg p-2">
            <div class="flex flex-col md:flex-row md:space-x-8">
                <div class="md:w-1/2 md:border-r md:border-gray-200 md:pr-8">
                    <!-- Environments -->
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-xl font-semibold">Environments</h3>
                        <router-link :to="{ name: 'EnvironmentCreate', params: { appId: app.id } }">
                            <button class="bg-blue-500 hover:bg-blue-700 text-black font-bold py-1 px-2 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                    class="w-6 h-6">
                                    <path fill-rule="evenodd"
                                        d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                        </router-link>
                    </div>
                    <div class="mb-4">
                        <input type="text" placeholder="Search environments..." v-model="environmentSearchQuery"
                            class="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                    <ul class="space-y-2">
                        <li v-for="environment in filteredEnvironments" :key="environment.id"
                            class="p-2 border bg-white shadow-md rounded-md flex items-center justify-between hover:bg-gray-200 transition-colors duration-200 ease-in">
                            <div class="w-full flex">
                                <span class="flex-grow pr-2">{{ environment.name }}</span>
                                <span class="text-gray-500 text-xs truncate w-3/4">{{ environment.description }}</span>
                            </div>
                            <div v-if="!(environment.name === 'Production')">
                                <button class="" @click.stop="handleDelete(environment.id)">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="red" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="md:w-1/2 md:border-r md:border-gray-200 md:pr-8">
                    <!-- Users -->
                    <div class="flex items-center mb-4">
                        <h3 class="text-xl font-semibold mr-1">Users</h3>
                        <span class="text-grey text-xs text-gray-500">({{ filteredUsers?.length }})</span>
                    </div>
                    <div class="mb-4">
                        <input type="text" placeholder="Search users..." v-model="userSearchQuery"
                            class="w-full px-3 py-2 border border-gray-300 rounded" />
                    </div>
                    <div class="h-64 overflow-y-auto">
                        <ul class="space-y-2">
                            <li v-for="user in filteredUsers" :key="user.id"
                                class="p-2 border bg-white shadow-md rounded-md flex items-center hover:bg-gray-200 transition-colors duration-200 ease-in">
                                <div class="flex justify-between w-full">
                                    <div>
                                        <span>{{ user.name }}</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-gray-500 text-xs mr-1 truncate">{{ user.externalId }}</span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import useApi from '../composables/useApi';
import { App, Environment, User } from '../types';

const props = defineProps({
    appId: {
        type: String,
        required: true,
    },
});

const { getAppById, getEnvironments, deleteEnvironment, getUsers } = useApi();
const app = ref<App>();
const environments = ref<Environment[]>();
const users = ref<User[]>();
const userSearchQuery = ref('');
const environmentSearchQuery = ref('');

const filteredUsers = computed(() => {
    return users.value?.filter(user => {
        const nameMatches = !userSearchQuery.value || user.name.toLowerCase().includes(userSearchQuery.value.toLowerCase());
        const externalIdMatches = !userSearchQuery.value || user.externalId.toLowerCase().includes(userSearchQuery.value.toLowerCase());
        const isActive = user.isActive;
        return (nameMatches || externalIdMatches) && isActive;
    });
});

const filteredEnvironments = computed(() => {
    return environments.value?.filter(environment => {
        const nameMatches = !environmentSearchQuery.value || environment.name.toLowerCase().includes(environmentSearchQuery.value.toLowerCase());
        const descriptionMatches = !environmentSearchQuery.value || environment.description.toLowerCase().includes(environmentSearchQuery.value.toLowerCase());
        return nameMatches || descriptionMatches;
    });
});

async function handleDelete(environmentId: string) {
    if (window.confirm('Are you sure you want to delete this environment?')) {
        const deletedEnvironment = await deleteEnvironment(environmentId);
        environments.value = environments.value?.filter((environment) => environment.id !== deletedEnvironment.id);
    }
}

onMounted(async () => {
    app.value = await getAppById(props.appId);
    environments.value = await getEnvironments(props.appId);
    users.value = await getUsers(props.appId);
});
</script>