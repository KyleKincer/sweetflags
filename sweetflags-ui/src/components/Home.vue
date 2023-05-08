<template>
  <div class="h-screen w-full flex items-center justify-center">
    <div v-if="isAuthenticated">
      <p>
        Howdy, {{ user.name }}! 🤠
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
const { user, isAuthenticated } = useAuth0();
</script>
