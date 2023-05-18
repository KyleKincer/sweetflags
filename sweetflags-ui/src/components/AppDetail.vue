<template>
    <div v-if="app">
        <v-breadcrumbs class="text-sm whitespace-nowrap truncate overflow-ellipsis" :items="(breadcrumbs as any)">
        </v-breadcrumbs>
        <v-container>
            <v-row>
                <v-col>
                    <v-card class="mx-auto">
                        <v-toolbar color="blue">
                            <v-btn :disabled="isLoadingGetFeatureFlagsByAppId" icon><v-icon
                                    icon="mdi-filter-variant"></v-icon>
                                <v-menu activator="parent" width="300">
                                    <v-list>
                                        <v-list-subheader>Filters</v-list-subheader>
                                        <v-list-item @click.stop>
                                            <div class="items-center">
                                                <v-select v-model="selectedCreatedBy" :items="uniqueCreatedBy"
                                                    label="Created By" dense outlined clearable>Any</v-select>
                                            </div>
                                        </v-list-item>
                                        <v-list-item @click.stop>
                                            <v-btn-toggle color="grey" v-model="selectedEvaluationStrategyFilter">
                                                <v-btn value="BOOLEAN" :icon="getEvaluationStrategyIcon('BOOLEAN')"></v-btn>
                                                <v-btn value="USER" :icon="getEvaluationStrategyIcon('USER')"></v-btn>
                                                <v-btn value="PERCENTAGE"
                                                    :icon="getEvaluationStrategyIcon('PERCENTAGE')"></v-btn>
                                                <v-btn value="PROBABALISTIC"
                                                    :icon="getEvaluationStrategyIcon('PROBABALISTIC')"></v-btn>
                                            </v-btn-toggle>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-btn>
                            <v-toolbar-title>
                                <div class="flex items-center">
                                    {{ app.name }}
                                    <p v-if="!isLoadingGetFeatureFlagsByAppId" class="text-sm ml-2 text-gray-200">({{
                                        featureFlagCount }})</p>
                                </div>
                            </v-toolbar-title>
                            <v-progress-linear :active="isLoadingGetFeatureFlagsByAppId"
                                :indeterminate="isLoadingGetFeatureFlagsByAppId" absolute bottom
                                color="white"></v-progress-linear>
                            <v-btn :disabled="isLoadingGetFeatureFlagsByAppId" icon="mdi-plus" :to="`/apps/${appId}/flags/create`"></v-btn>
                            <v-btn :disabled="isLoadingGetFeatureFlagsByAppId" icon="mdi-cog" :to="`/apps/manage/${appId}`"></v-btn>
                        </v-toolbar>
                        <v-list v-if="!isLoadingGetFeatureFlagsByAppId">
                            <v-list-item>
                                <div>
                                    <v-container>
                                        <v-row>
                                            <v-col cols="12" sm="9">
                                                <v-text-field v-model="search" prepend-inner-icon="mdi-magnify"
                                                    label="Search flags" single-line hide-details></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="3">
                                                <v-select v-model="selectedEnvironmentId" :items="environments"
                                                    item-title="name" item-value="id" label="Environment"
                                                    outlined></v-select>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </div>
                            </v-list-item>
                            <v-list-item v-for="flag in filteredFlags" :key="flag.id" :value="flag.name"
                                :to="`/flags/${flag.id}`">
                                <v-list-item-title>{{ flag.name }}</v-list-item-title>
                                <v-list-item-subtitle>{{ flag.description }}</v-list-item-subtitle>
                                <template v-slot:append>
                                    <v-icon
                                        :icon="getEvaluationStrategyIcon(flag.environments[selectedEnvironmentIndex].evaluationStrategy)"
                                        size="small" class="mr-2"></v-icon>
                                    <v-switch v-model="flag.environments[selectedEnvironmentIndex].isActive" color="blue"
                                        hide-details density="compact" @click.prevent="handleToggle(flag)"
                                        :loading="isLoadingToggleFlag"></v-switch>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

  
<script lang="ts">
import { ref, onMounted, computed, defineComponent, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useApi from '../composables/useApi';
import { evaluationStrategyIcon, getEvaluationStrategyIcon } from '../utils/evaluationStrategyIcon';
import { FeatureFlag, Environment, App } from '../types';
import LoadingSpinner from './LoadingSpinner.vue';
import { snackbarState } from '../utils/snackbarState';

export default defineComponent({
    props: {
        appId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { getAppById, getFeatureFlagsByAppId, getEnvironments, toggleFlag, isLoading, isLoadingGetFeatureFlagsByAppId, isLoadingToggleFlag, error } = useApi();
        const { user } = useAuth0();
        const app = ref<App>();
        const featureFlags = ref<FeatureFlag[]>([]);
        const environments = ref<Environment[]>([]);
        const search = ref("");
        const selectedCreatedBy = ref("");
        const selectedEnvironmentId = ref("");
        const selectedEnvironmentIndex = ref(0);
        const selectedEvaluationStrategyFilter = ref("");
        const breadcrumbs = ref([
            {
                title: "Home",
                disabled: false,
                to: "/",
            }
        ]);

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
                selectedEnvironmentId.value = environments.value[0].id;
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
                const newFlag = await toggleFlag(featureFlag.id, selectedEnvironmentId.value, user.value.name ?? 'unknown');
                const index = featureFlags.value.findIndex((flag) => flag.id === newFlag.id);
                featureFlags.value.splice(index, 1, newFlag);
                snackbarState.showSnackbar(`Feature flag ${newFlag.name} ${newFlag.environments[selectedEnvironmentIndex.value].isActive ? 'enabled' : 'disabled'} for environment ${environments.value[selectedEnvironmentIndex.value].name}!`);
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
                const env = flag.environments.find((environment) => environment.environment.id === selectedEnvironmentId.value);
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
            const env = featureFlag.environments.find((environment) => environment.environment.name === selectedEnvironmentId.value);
            return env ? env.isActive : false;
        };

        function selectedEvaluationStrategy(featureFlag: FeatureFlag) {
            const env = featureFlag.environments.find((environment) => environment.environment.name === selectedEnvironmentId.value);
            return env ? env.evaluationStrategy : "";
        };

        onMounted(async () => {
            await fetchApp(props.appId);
            await fetchFeatureFlags(props.appId);
            await fetchEnvironments(props.appId);

            breadcrumbs.value = [
                {
                    title: 'Home',
                    disabled: false,
                    to: '/',
                },
                {
                    title: app.value!.name,
                    disabled: true,
                    to: `/apps/${app.value!.id}`,
                }
            ];
        });

        watch(
            () => selectedEnvironmentId.value,
            (newSelectedEnvironmentId) => {
                const index = environments.value.findIndex((env) => env.id === newSelectedEnvironmentId);
                selectedEnvironmentIndex.value = index;
            }
        );

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
            isLoadingToggleFlag,
            isLoadingGetFeatureFlagsByAppId,
            error,
            search,
            filteredFlags,
            featureFlagCount,
            selectedCreatedBy,
            uniqueCreatedBy,
            uniqueEnvironments,
            selectedEnvironmentId,
            selectedEnvironmentIndex,
            isEnabled,
            handleToggle,
            selectedEvaluationStrategy,
            evaluationStrategyIcon,
            getEvaluationStrategyIcon,
            selectedEvaluationStrategyFilter,
            breadcrumbs,
            environments,
        };
    },
    components: {
        LoadingSpinner
    }
});
</script>
  