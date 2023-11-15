<template>
    <div class="max-w-md mx-auto">
        <h1 class="text-2xl font-bold mb-4">Create an Environment</h1>
        <form @submit.prevent="submit">
            <div class="mb-4">
                <label for="environmentName" class="block text-sm mb-2">Name:</label>
                <input type="text" id="environmentName" v-model="environmentName"
                    class="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div class="mb-4">
                <label for="environmentDescription" class="block text-sm mb-2">Description:</label>
                <textarea id="environmentDescription" v-model="environmentDescription" rows="3"
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
                <label for="isActive" class="text-sm">Active</label>
            </div>
            <div class="text-center">
                <button type="submit"
                    class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded items-center text-center inline-flex transition-all duration-300"
                    :disabled="isLoading" :class="{ 'bg-gray-400': isLoading }">
                    Create
                    <svg v-if="isLoading" aria-hidden="true" role="status" class="inline w-4 h-4 ml-2 text-white animate-spin"
                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="#E5E7EB" />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentColor" />
                    </svg>
                </button>
            </div>
        </form>
    </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import { EnvironmentCreatePayload, App } from '../types';
import router from '../router';

const props = defineProps({
    appId: {
        type: String,
        required: true,
    },
});

const { createEnvironment, getApps, isLoading } = useApi();
const { user } = useAuth0();
const environmentName = ref('');
const environmentDescription = ref('');
const isActive = ref(true);
const createdBy = ref('');
const apps = ref<App[]>([]);
const appId = ref('');

onMounted(async () => {
    apps.value = await getApps();
    if (props.appId) {
        appId.value = props.appId;
    } else {
        appId.value = apps.value[0]?.id;
    }
});

async function submit() {
    const payload: EnvironmentCreatePayload = {
        name: environmentName.value,
        description: environmentDescription.value,
        appId: props.appId,
        isActive: isActive.value,
        createdBy: user.value.name ?? 'unknown',
    };

    const newEnvironment = await createEnvironment(payload);
    router.push({ name: 'AppManage', params: { appId: props.appId } });
}
</script>