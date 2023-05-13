<template>
  <div class="">
    <div class="text-h3 text-center">SweetFlags 🏁</div>
    <div class="text-lg text-center"> Hello, {{ user.given_name }}</div>
  </div>
  <v-container>
    <v-row>
      <v-col
      cols="12"
      sm="6">
        <v-card class="mx-auto">
          <v-card-title>Recent Activity
            <v-icon icon="mdi-clock-time-eight-outline" size=""></v-icon>
          </v-card-title>
          <v-list 
          lines="two"
          density="comfortable">
          <v-list-item
          v-for="log in logs"
          :key="log.id"
          :title="log.message"
          :subtitle="timeSince(new Date(log.createdAt))">
          
          <template v-slot:append>
            <v-btn
            icon="mdi-chevron-right"
            variant="text"
            :to="getLink(log)"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>
      <v-pagination
      v-model="logsPage"
      :length="logsTotalPages"
      rounded="circle"
      ></v-pagination>
    </v-card>
  </v-col>
  </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import useApi from '../composables/useApi';
import { useAuth0 } from '@auth0/auth0-vue';
import { Log } from '../types';
import timeSince from '../utils/timeSince';
const { user, isAuthenticated } = useAuth0();
const { getLogs, isLoadingGetLogs } = useApi();
const logs = ref<Log[]>([]);
const logsPage = ref(1);
const logsTotalPages = ref(1);

onMounted(async () => {
  if (isAuthenticated.value) {
    // console.log(user.value);
  }
  const logsResponse = await getLogs();
  logs.value = logsResponse.logs;
  logsTotalPages.value = logsResponse.totalPages;
  
});

watch(logsPage, async () => {
  logs.value = (await getLogs(logsPage.value)).logs;
});

function getLink(log: Log) {
  switch (log.targetType) {
    case 'FeatureFlag':
      return `/flags/${log.targetId}`;
    case 'App':
      return `/apps/${log.targetId}`;

    default:
      return '';
  }
}

</script>
