<template>
    <div>
      <h2 class="text-2xl font-semibold text-center mb-4">Apps</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppListItem v-for="app in apps" :key="app.id" :app="app" />
      </div>
    </div>
  </template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { App } from '../types'
  import useApi from '../composables/useApi';
  import AppListItem from './AppListItem.vue';

  const apps = ref<App[]>([]);
  const { getApps } = useApi();

  onMounted(async () => {
    apps.value = await getApps();
  });
</script>
