<template>
    <div class="fixed inset-0 flex items-center justify-center">
      <div class="loading-spinner">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'LoadingSpinner',
  });
  </script>
  