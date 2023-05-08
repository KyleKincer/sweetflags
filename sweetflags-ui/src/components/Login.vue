<template>
    <div class="h-screen flex justify-center items-center bg-gray-100">
      <div
        class="bg-white p-10 rounded-lg shadow-md transition-opacity duration-1000"
        :class="{ 'opacity-100': fadeIn, 'opacity-0': !fadeIn }"
      >
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold mb-2">SweetFlags 🏁</h1>
          <p class="text-gray-500">Please log in to continue.</p>
        </div>
        <div>
          <button
            class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out"
            @click="login"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { useAuth0 } from "@auth0/auth0-vue";
  import { ref, onMounted } from "vue";
  
  export default {
    setup() {
      const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
      const fadeIn = ref(false);
  
      const login = () => {
        loginWithRedirect();
      };
  
      const performLogout = () => {
        logout();
      };
  
      onMounted(() => {
        setTimeout(() => {
          fadeIn.value = true;
        }, 0);
      });
  
      return {
        login,
        logout: performLogout,
        user,
        isAuthenticated,
        fadeIn,
      };
    },
  };
  </script>
  