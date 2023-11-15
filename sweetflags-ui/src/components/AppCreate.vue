<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Create App</h1>
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label for="name" class="block mb-2">App Name</label>
        <input id="name" v-model="app.name" type="text" class="w-full border p-2" required />
      </div>
      <div class="mb-4">
        <label for="description" class="block mb-2">Description</label>
        <textarea id="description" v-model="app.description" class="w-full border p-2" rows="4"></textarea>
      </div>
      <div class="flex items-center mb-4">
        <input id="isActive" v-model="app.isActive" type="checkbox" class="mr-2" />
        <label for="isActive" class="cursor-pointer">Is Active</label>
      </div>
      <div class="text-center">
        <button class="bg-blue-500 text-white px-4 py-2 rounded-md" type="submit">
          Create
        </button>
      </div>
    </form>
  </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import { AppCreatePayload } from '../types';
import router from '../router';

const { createApp } = useApi();
const { user } = useAuth0();
const app = ref<AppCreatePayload>({
  name: '',
  description: '',
  isActive: true,
  createdBy: user.value.name ?? 'unknown',
});

async function handleSubmit() {
  try {
    console.log('Creating app:', app.value);
    const createdApp = await createApp(app.value);
    router.push({ name: 'AppDetail', params: { appId: createdApp.id } })
  } catch (error) {
    console.error('Error creating app:', error);
  }
}
</script>
  