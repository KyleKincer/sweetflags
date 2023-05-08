<template>
    <div v-if="app">
        <div class="flex justify-center items-center mb-4">
            <div class="absolute right-2">
                <router-link :to="{ name: 'FeatureFlagCreate', params: { appId: app.id } }">
                    <button class="bg-blue-500 hover:bg-blue-700 text-black font-bold py-1 px-2 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                            <path fill-rule="evenodd"
                                d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </router-link>
                <router-link :to="{ name: 'AppManage', params: { appId: app.id } }">
                    <button class="bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-2 ml-2 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                            <path
                                d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 01-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 016.126 3.537zM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 010 .75l-1.732 3.001c-.229.396-.76.498-1.067.16A5.231 5.231 0 016.75 12c0-1.362.519-2.603 1.37-3.536zM10.878 17.13c-.447-.097-.623-.608-.394-1.003l1.733-3.003a.75.75 0 01.65-.375h3.465c.457 0 .81.408.672.843a5.252 5.252 0 01-6.126 3.538z" />
                            <path fill-rule="evenodd"
                                d="M21 12.75a.75.75 0 000-1.5h-.783a8.22 8.22 0 00-.237-1.357l.734-.267a.75.75 0 10-.513-1.41l-.735.268a8.24 8.24 0 00-.689-1.191l.6-.504a.75.75 0 10-.964-1.149l-.6.504a8.3 8.3 0 00-1.054-.885l.391-.678a.75.75 0 10-1.299-.75l-.39.677a8.188 8.188 0 00-1.295-.471l.136-.77a.75.75 0 00-1.477-.26l-.136.77a8.364 8.364 0 00-1.377 0l-.136-.77a.75.75 0 10-1.477.26l.136.77c-.448.121-.88.28-1.294.47l-.39-.676a.75.75 0 00-1.3.75l.392.678a8.29 8.29 0 00-1.054.885l-.6-.504a.75.75 0 00-.965 1.149l.6.503a8.243 8.243 0 00-.689 1.192L3.8 8.217a.75.75 0 10-.513 1.41l.735.267a8.222 8.222 0 00-.238 1.355h-.783a.75.75 0 000 1.5h.783c.042.464.122.917.238 1.356l-.735.268a.75.75 0 10.513 1.41l.735-.268c.197.417.428.816.69 1.192l-.6.504a.75.75 0 10.963 1.149l.601-.505c.326.323.679.62 1.054.885l-.392.68a.75.75 0 101.3.75l.39-.679c.414.192.847.35 1.294.471l-.136.771a.75.75 0 101.477.26l.137-.772a8.376 8.376 0 001.376 0l.136.773a.75.75 0 101.477-.26l-.136-.772a8.19 8.19 0 001.294-.47l.391.677a.75.75 0 101.3-.75l-.393-.679a8.282 8.282 0 001.054-.885l.601.504a.75.75 0 10.964-1.15l-.6-.503a8.24 8.24 0 00.69-1.191l.735.268a.75.75 0 10.512-1.41l-.734-.268c.115-.438.195-.892.237-1.356h.784zm-2.657-3.06a6.744 6.744 0 00-1.19-2.053 6.784 6.784 0 00-1.82-1.51A6.704 6.704 0 0012 5.25a6.801 6.801 0 00-1.225.111 6.7 6.7 0 00-2.15.792 6.784 6.784 0 00-2.952 3.489.758.758 0 01-.036.099A6.74 6.74 0 005.251 12a6.739 6.739 0 003.355 5.835l.01.006.01.005a6.706 6.706 0 002.203.802c.007 0 .014.002.021.004a6.792 6.792 0 002.301 0l.022-.004a6.707 6.707 0 002.228-.816 6.781 6.781 0 001.762-1.483l.009-.01.009-.012a6.744 6.744 0 001.18-2.064c.253-.708.39-1.47.39-2.264a6.74 6.74 0 00-.408-2.308z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </router-link>
            </div>
            <h2 class="text-2xl font-semibold">{{ app.name }}</h2>
        </div>
        <div class="text-center">
            <div class="inline-flex items-center mb-4 space-x-4 sm:flex-wrap md:flex-nowrap">
                <input v-model="search" type="text" placeholder="Search feature flags"
                    class="w-full p-1 border border-gray-300 rounded-md md:w-1/2 mb-4 md:mb-0" />
                <select v-model="selectedEvaluationStrategyFilter"
                    class="p-2 border border-gray-300 rounded-md w-full md:w-28 mb-4 md:mb-0">
                    <option value="">Evaluation</option>
                    <option value="BOOLEAN">Boolean</option>
                    <option value="USER">User list</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="PROBABALISTIC">Probabilistic</option>
                </select>

                <select v-model="selectedCreatedBy"
                    class="p-2 border border-gray-300 rounded-md w-full md:w-32 mb-4 md:mb-0">
                    <option value="">Created by</option>
                    <option v-for="user in uniqueCreatedBy" :key="user" :value="user">
                        {{ user }}
                    </option>
                </select>
                <select v-model="selectedEnvironment" class="p-2 border border-gray-300 rounded-md w-full md:w-28">
                    <option v-for="env in uniqueEnvironments" :key="env" :value="env">
                        {{ env }}
                    </option>
                </select>
            </div>
        </div>
        <div v-if="isLoading">
            <LoadingSpinner />
        </div>
        <div v-else-if="featureFlagCount > 0">
            <ul class="space-y-4">
                <li v-for="flag in filteredFlags" :key="flag.id"
                    class="p-2 bg-white shadow-md rounded-md flex items-center justify-between hover:bg-gray-200 transition-colors duration-200 ease-in">
                    <router-link :to="{
                        name: 'FeatureFlagDetail',
                        params: { flagId: flag.id },
                    }" class="w-full flex items-center justify-between">
                        <div>
                            <span class="mr-2 whitespace-nowrap">{{ flag.name }}</span>
                            <div class="flex items-center text-gray-500 text-xs mt-1">
                                <svg class="h-3 w-3 mr-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24">
                                    <path
                                        d="M12 14.016c3.328 0 6-2.672 6-6s-2.672-6-6-6-6 2.672-6 6 2.672 6 6 6zm0 1.969c-3.891 0-11.531 1.969-11.531 5.016v2.016h23.062v-2.016c0-3.047-7.641-5.016-11.531-5.016z" />
                                </svg>
                                <span class="truncate">{{ flag.createdBy }}</span>
                            </div>
                        </div>
                        <span class="text-gray-500 truncate w-3/4 text-xs">{{ flag.description }}</span>
                        <span v-html="evaluationStrategyIcon(selectedEvaluationStrategy(flag))"
                            class="w-6 h-6 mr-2 md:scale-75"></span>
                        <span :class="[
                            'px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-100 ease-in',
                            isEnabled(flag)
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                        ]" @click.prevent="handleToggle(flag)">
                            {{ isEnabled(flag) ? 'Enabled' : 'Disabled' }}
                        </span>
                    </router-link>
                </li>
            </ul>
        </div>
        <div v-else class="flex items-center justify-center h-full mt-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                class="w-5 h-5 mr-1 text-gray-600">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div class="text-gray-600 text-lg mr-4">
                No feature flags yet.
            </div>
            <router-link :to="{ name: 'FeatureFlagCreate', params: { appId: app.id } }">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Create one?
                </button>
            </router-link>
        </div>
    </div>
</template>

  
<script lang="ts">
import { ref, onMounted, computed, defineComponent, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import { evaluationStrategyIcon } from '../utils/evaluationStrategyIcon';
import { FeatureFlag, Environment, App } from '../types';
import LoadingSpinner from './LoadingSpinner.vue';

export default defineComponent({
    props: {
        appId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { getAppById, getFeatureFlagsByAppId, getEnvironments, toggleFlag, isLoading, error } = useApi();
        const { user } = useAuth0();
        const app = ref<App>();
        const featureFlags = ref<FeatureFlag[]>([]);
        const environments = ref<Environment[]>([]);
        const search = ref("");
        const selectedCreatedBy = ref("");
        const selectedEnvironment = ref("Production");
        const selectedEvaluationStrategyFilter = ref("");

        async function fetchApp(appId: string) {
            try {
                const data = await getAppById(appId);
                app.value = data;
            }
            catch (err) {
                console.error("Error fetching app:", err);
            }
        }

        async function fetchEnvironments(appId: string) {
            try {
                const data = await getEnvironments(appId);
                environments.value = data;
            }
            catch (err) {
                console.error("Error fetching environments:", err);
            }
        }

        async function fetchFeatureFlags(appId: string) {
            try {
                const data = await getFeatureFlagsByAppId(appId);
                featureFlags.value = data;
            }
            catch (err) {
                console.error("Error fetching feature flags:", err);
            }
        }

        async function handleToggle(featureFlag: FeatureFlag) {
            try {
                const selectedEnvironmentId = environments.value.find((env) => env.name === selectedEnvironment.value)?.id;
                if (!selectedEnvironmentId) {
                    throw new Error("No environment found");
                }
                const newFlag = await toggleFlag(featureFlag.id, selectedEnvironmentId, user.value.name ?? 'unknown');
                const index = featureFlags.value.findIndex((flag) => flag.id === newFlag.id);
                featureFlags.value.splice(index, 1, newFlag);
            }
            catch (err) {
                console.error("Error toggling feature flag:", err);
            }
        };

        const filteredFlags = computed(() => {
            return featureFlags.value.filter((flag) => {
                const nameMatch = flag.name.toLowerCase().includes(search.value.toLowerCase());
                const descriptionMatch = flag.description && flag.description.toLowerCase().includes(search.value.toLowerCase());
                const createdByMatch = !selectedCreatedBy.value || flag.createdBy === selectedCreatedBy.value;
                const env = flag.environments.find((environment) => environment.environment.name === selectedEnvironment.value);
                const evaluationStrategyMatch = !selectedEvaluationStrategyFilter.value || (env && env.evaluationStrategy === selectedEvaluationStrategyFilter.value);
                return (nameMatch || descriptionMatch) && createdByMatch && evaluationStrategyMatch;
            })
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });

        const featureFlagCount = computed(() => {
            return filteredFlags.value.length;
        });

        const uniqueCreatedBy = computed(() => {
            const createdBySet = new Set(featureFlags.value.map((flag) => flag.createdBy));
            return Array.from(createdBySet).sort();
        });

        const uniqueEnvironments = computed(() => {
            return environments.value.map(env => env.name).sort();
        });

        const isEnabled = (featureFlag: FeatureFlag) => {
            const env = featureFlag.environments.find((environment) => environment.environment.name === selectedEnvironment.value);
            return env ? env.isActive : false;
        };

        function selectedEvaluationStrategy(featureFlag: FeatureFlag) {
            const env = featureFlag.environments.find((environment) => environment.environment.name === selectedEnvironment.value);
            return env ? env.evaluationStrategy : "";
        };

        onMounted(async () => {
            await fetchApp(props.appId);
            await fetchFeatureFlags(props.appId);
            await fetchEnvironments(props.appId);
        });

        watch(
            () => props.appId,
            async (newAppId, oldAppId) => {
                if (newAppId !== oldAppId) {
                    await fetchApp(newAppId);
                    await fetchFeatureFlags(newAppId);
                    await fetchEnvironments(newAppId);
                }
            }
        );


        return {
            app,
            appId: props.appId,
            featureFlags,
            isLoading,
            error,
            search,
            filteredFlags,
            featureFlagCount,
            selectedCreatedBy,
            uniqueCreatedBy,
            uniqueEnvironments,
            selectedEnvironment,
            isEnabled,
            handleToggle,
            selectedEvaluationStrategy,
            evaluationStrategyIcon,
            selectedEvaluationStrategyFilter,
        };
    },
    components: {
        LoadingSpinner
    }
});
</script>
  