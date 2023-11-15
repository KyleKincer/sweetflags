import { createApp } from 'vue'
import './index.css';
import App from './App.vue'
import router from './router'
import { Collapse } from 'vue-collapsed';
import { auth0 } from './auth/auth';
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

loadFonts()

const app = createApp(App)
    .component('Collapse', Collapse)
    .use(router)
    .use(auth0)
    .use(vuetify);

app.mount('#app');
