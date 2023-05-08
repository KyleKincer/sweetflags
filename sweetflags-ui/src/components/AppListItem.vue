<template>
  <router-link
    :to="{ name: 'AppDetail', params: { appId: app.id } }"
    >
  <div class="border p-4 rounded transition-colors duration-200 ease-in hover:border-blue-600 hover:bg-blue-100">
    <h2 class="text-xl font-semibold mb-2 text-black">{{ app.name }}</h2>
    <p class="text-gray-700 hover:text-gray-600">{{ app.description }}</p>
  </div>
</router-link>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import AppDetail from './AppDetail.vue';

  export default defineComponent({
    props: {
      app: {
        type: Object,
        required: true,
      },
    },
    components: {
      AppDetail,
    },
  });
</script>
