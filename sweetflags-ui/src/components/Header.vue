<template>
  <header class="border-b-2">
    <div class="flex justify-between">
      <div class="flex items-center justify-start p-2">
        <router-link to="/" class="text-xl font-bold mr-4">SweetFlags 🏁</router-link>
        <div class="relative group" @mouseenter="clearDropdownHideTimeout" @mouseleave="setDropdownHideTimeout">
          <router-link :to="{ name: 'AppList' }"
            class="bg-blue-500 text-white py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            @click="showAppsDropdown = false">
            Apps
          </router-link>
          <Collapse :when="showAppsDropdown"
            class="v-collapse absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-xl"
            @mouseover="showAppsDropdown = true" @mouseleave="showAppsDropdown = false">
            <router-link :to="{ name: 'AppList' }" class="block py-1 px-2 hover:bg-gray-200 rounded-md font-bold">
              All Apps
            </router-link>
            <router-link :to="{ name: 'AppCreate' }"
              class="block py-1 px-2 hover:bg-gray-200 rounded-md font-bold border-b-2">
              Create App
            </router-link>
            <router-link v-for="app in apps" :key="app.id" :to="{ name: 'AppDetail', params: { appId: app.id } }"
              class="block py-1 px-2 hover:bg-gray-200 rounded-md">
              {{ app.name }}
            </router-link>
          </Collapse>
        </div>
      </div>
      <div class="flex items-center justify-end p-2">
        <p class="text-s"></p>
        <div v-if="user.picture" class="mr-1">
          <img :src="user.picture" alt="User picture" class="w-7 h-7 mr-1 rounded-full" />
        </div>
        <div v-else
          class="flex items-center justify-center w-7 h-7 mr-1 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition duration-300">
          {{ userInitial }}
        </div>
        <button
          class="flex items-center justify-center w-6 h-6 mr-2 hover:text-red-600 text-black font-bold rounded-full transition duration-300"
          @click="performLogout">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import { App } from '../types';
import { Collapse } from 'vue-collapsed';

const { getApps } = useApi();
const { user, logout } = useAuth0();
const userInitial = computed(() => (user.value?.name ? user.value.name[0].toUpperCase() : ''));
const apps = ref<App[]>([]);
const showAppsDropdown = ref(false);
let hideDropdownTimeout: NodeJS.Timeout;

function clearDropdownHideTimeout() {
  clearTimeout(hideDropdownTimeout);
  showAppsDropdown.value = true;
}

function setDropdownHideTimeout() {
  hideDropdownTimeout = setTimeout(() => {
    showAppsDropdown.value = false;
  }, 300);
}

function performLogout() {
  if (confirm('Are you sure you want to log out?')) {
    logout();
  }
}

onMounted(async () => {
  apps.value = await getApps();
});
</script>
