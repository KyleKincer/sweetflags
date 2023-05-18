<template>
    <v-card class="mx-auto">
        <v-toolbar color="gray" density="comfortable">
            <v-icon icon="mdi-clock-time-eight-outline" class="ml-2"></v-icon>
            <v-toolbar-title>Recent Activity</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>
        <v-list lines="two" density="comfortable">
            <v-list-item v-for="log in logs" :key="log.id" class="hover:bg-gray-300 transition duration-300">
                <v-list-item-title>
                    <div class="flex items-center justify-between">
                        <div class="whitespace-normal max-h-6lines">
                            {{ log.message }}
                        </div>
                        <div>
                            <v-chip size="small" color="blue" class="mr-2 text-sm" :text="log.user" prepend-icon="mdi-account-outline">
                            </v-chip>
                        </div>
                    </div>
                </v-list-item-title>
                <v-list-item-subtitle v-if="showTimeSince">
                    <div @click.stop="showTimeSince = !showTimeSince" class="cursor-pointer select-none">
                        {{ timeSince(new Date(log.createdAt)) }}
                    </div>
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="!showTimeSince">
                    <div @click.stop="showTimeSince = !showTimeSince" class="cursor-pointer select-none">
                        {{ formatDateTime(log.createdAt) }}
                    </div>
                </v-list-item-subtitle>
                <template v-slot:append>
                    <v-btn icon="mdi-chevron-right" variant="text" :to="getLink(log)" v-if="linkToTarget"></v-btn>
                </template>
                <v-divider></v-divider>
            </v-list-item>
        </v-list>
        <v-pagination v-model="logsPage" :length="logsTotalPages" rounded="circle"></v-pagination>
    </v-card>
</template>
  
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import useApi from '../composables/useApi';
import { Log } from '../types';
import timeSince from '../utils/timeSince';
import formatDateTime from '../utils/formatDateTime';

const { getLogs, getLogsByTarget, isLoadingGetLogs } = useApi();
const logs = ref<Log[]>([]);
const logsPage = ref(1);
const logsTotalPages = ref(1);
const showTimeSince = ref(true);

const props = defineProps({
  targetId: String,
  linkToTarget: Boolean
});

onMounted(async () => {
    await getNewLogs();
});

watch(logsPage, async () => {
    await getNewLogs();
});

async function getNewLogs() {
    console.log(props.targetId);
    
    const logsResponse = props.targetId != null
        ? await getLogsByTarget(props.targetId, logsPage.value)
        : await getLogs(logsPage.value);
    logs.value = logsResponse.logs;
    logsTotalPages.value = logsResponse.totalPages;
}

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
