<template>
    <div class="max-w-md mx-auto">
        <h1 class="text-2xl font-bold mb-4">Create Feature Flag</h1>
        <form @submit.prevent="submit">
            <div class="mb-4">
                <label for="flagName" class="block text-sm mb-2">Name:</label>
                <input type="text" id="flagName" v-model="flagName"
                    class="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div class="mb-4">
                <label for="flagDescription" class="block text-sm mb-2">Description:</label>
                <textarea id="flagDescription" v-model="flagDescription" rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded"></textarea>
            </div>
            <div class="mb-4">
                <label for="appId" class="block text-sm mb-2">App:</label>
                <select id="appId" v-model="appId" class="w-full px-3 py-2 mb-2 border border-gray-300 rounded">
                    <option v-for="app in apps" :key="app.id" :value="app.id">
                        {{ app.name }}
                    </option>
                </select>
            </div>
            <div class="mb-4">
                <input type="checkbox" id="isActive" v-model="isActive" class="mr-2">
                <label for="isActive" class="text-sm">Enabled</label>
            </div>
            <div class="mb-4">
                <label for="evaluationStrategy" class="block text-sm mb-2">
                    Evaluation Strategy:
                    <span class="inline-flex items-center ml-1">
                        <i class="text-gray-500 text-sm material-icons"
                            title="BOOLEAN: A simple on/off switch for the feature.
PERCENTAGE: Enable the feature for a percentage of users. Always evaluates to the same value for a given user.
USER: Enable/disable the feature for specific users.
PROBABILISTIC: Enable the feature for a percentage of users. Evaluates to a different value each time regardless of the user.">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>

                        </i>
                    </span>
                </label>
                <select id="evaluationStrategy" v-model="evaluationStrategy"
                    class="w-full px-3 py-2 mb-2 border border-gray-300 rounded">
                    <option value="BOOLEAN">Boolean</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="USER">User</option>
                    <option value="PROBABILISTIC">Probabilistic</option>
                </select>
                <div v-if="evaluationStrategy === 'USER'" class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">User Evaluation</h3>
                    <label for="userSearch" class="block text-sm mb-2">Search Users: ({{ filteredUsers.length }})</label>
                    <input type="text" id="userSearch" v-model="userSearch"
                        class="w-full px-3 py-2 mb-4 border border-gray-300 rounded" placeholder="Search for users..." />
                    <div class="relative mb-4 h-64 overflow-y-auto">
                        <ul v-show="!isLoading">
                            <li v-for="user in filteredUsers" :key="user.id"
                                class="p-2 border bg-white shadow-md rounded-md flex items-center justify-between whitespace-nowrap hover:bg-gray-200 transition-colors duration-200 ease-in">
                                <span class="flex-grow text whitespace-nowrap truncate">{{ user.name }}</span>
                                <div v-if="allowedUsers.includes(user)" class="ml-4 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        class="w-5 h-5 mr-2">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div v-if="disallowedUsers.includes(user)" class="ml-4 text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        class="w-5 h-5 mr-2">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <button @click.prevent="addToAllowedUsers(user)"
                                        class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2">
                                        Allow
                                    </button>
                                    <button @click.prevent="addToDisallowedUsers(user)"
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
                                <li v-for="user in allowedUsers" :key="user.id" class="mb-2 truncate">
                                    <span class="text whitespace-nowrap truncate">
                                        {{ user.name }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <div class="w-1/2 ml-2">
                            <h3 class="text-lg font-semibold mb-2">Disallowed Users</h3>
                            <ul>
                                <li v-for="user in disallowedUsers" :key="user.id" class="mb-2">
                                    {{ user.name }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div v-if="['PERCENTAGE', 'PROBABILISTIC'].includes(evaluationStrategy)">
                    <label for="evaluationPercentage" class="block text-sm mb-2">Evaluation Percentage:</label>
                    <input type="number" id="evaluationPercentage" v-model="evaluationPercentage" min="0" max="100" step="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>
            </div>
            <div class="text-center">
                <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded">Create</button>
            </div>
        </form>
    </div>
</template>
  
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import { FeatureFlagCreatePayload, App, User } from '../types';
import router from '../router';
import LoadingSpinner from './LoadingSpinner.vue';

const components = {
    LoadingSpinner,
};

const props = defineProps({
    appId: {
        type: String,
        required: true,
    },
});

const { createFeatureFlag, getApps, getUsers, isLoading } = useApi();
const { user } = useAuth0();
const flagName = ref('');
const flagDescription = ref('');
const isActive = ref(false);
const evaluationStrategy = ref('BOOLEAN');
const evaluationPercentage = ref(0);
const createdBy = ref('');
const apps = ref<App[]>([]);
const users = ref<User[]>([]);
const allowedUsers = ref<User[]>([]);
const disallowedUsers = ref<User[]>([]);
const userSearch = ref('');
const appId = ref('');

const filteredUsers = computed(() => {
    return users.value?.filter(user => {
        const nameMatches = !userSearch.value || user.name.toLowerCase().includes(userSearch.value.toLowerCase());
        const externalIdMatches = !userSearch.value || user.externalId.toLowerCase().includes(userSearch.value.toLowerCase());
        const isActive = user.isActive;
        return (nameMatches || externalIdMatches) && isActive;
    });
});

onMounted(async () => {
    apps.value = await getApps();
    if (props.appId) {
        appId.value = props.appId;
    } else {
        appId.value = apps.value[0]?.id;
    }
});

watch(evaluationStrategy, async (newStrategy) => {
    if (newStrategy === 'USER') {
        users.value = await getUsers(appId.value);
    }
});

async function submit() {
    const payload: FeatureFlagCreatePayload = {
        name: flagName.value,
        description: flagDescription.value,
        appId: appId.value,
        isActive: isActive.value,
        evaluationStrategy: evaluationStrategy.value,
        evaluationPercentage: evaluationPercentage.value,
        allowedUsers: allowedUsers.value.map(user => user.id),
        disallowedUsers: disallowedUsers.value.map(user => user.id),
        createdBy: user.value.name ?? 'unknown',
    };

    const newFeatureFlag = await createFeatureFlag(payload);
    router.push({ name: 'FeatureFlagDetail', params: { flagId: newFeatureFlag.id, appName: newFeatureFlag.app.name } });
}

function addToAllowedUsers(user: User) {
    if (!allowedUsers.value.includes(user)) {
        allowedUsers.value.push(user);
        if (disallowedUsers.value.includes(user)) {
            disallowedUsers.value = disallowedUsers.value.filter(disallowedUser => disallowedUser.id !== user.id);
        }
    } else {
        allowedUsers.value = allowedUsers.value.filter(allowedUser => allowedUser.id !== user.id);
    }
}

function addToDisallowedUsers(user: User) {
    if (!disallowedUsers.value.includes(user)) {
        disallowedUsers.value.push(user);
        if (allowedUsers.value.includes(user)) {
            allowedUsers.value = allowedUsers.value.filter(allowedUser => allowedUser.id !== user.id);
        }
    } else {
        disallowedUsers.value = disallowedUsers.value.filter(disallowedUser => disallowedUser.id !== user.id);
    }
}
</script>
