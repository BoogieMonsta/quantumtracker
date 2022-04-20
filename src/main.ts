import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
    .directive("color", {
        mounted(el, binding ) {
            el.style.color = binding.value;
        }
    })
    .mount('#app')
