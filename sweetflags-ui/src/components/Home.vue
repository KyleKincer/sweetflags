<template>
  <div v-if="!isAuthenticated">
    <Login></Login>
  </div>
  <div class="">
    <div class="text-h3 text-center">SweetFlags 🏁</div>
    <div class="text-lg text-center"> Hello, {{ user.given_name }}</div>
  </div>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- Recent Activity -->
        <RecentActivity :linkToTarget="true" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import RecentActivity from './RecentActivity.vue';
import Login from './Login.vue';
const { user, isAuthenticated } = useAuth0();

onMounted(async () => {
  if (isAuthenticated.value) {
    // console.log(user.value);
  }
});

</script>
