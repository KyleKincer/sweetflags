<template>
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>
    <div v-else-if="!isLoading && isAuthenticated" class="m-2">
      <header class="fixed top-0 w-full bg-white z-10">
        <nav>
          <Header />
        </nav>
      </header>

      <main class="pt-12">
        <router-view />
      </main>
    </div>
    <footer></footer>
</template>


<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import Header from './components/Header.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';

const { isAuthenticated, isLoading } = useAuth0();
</script>
