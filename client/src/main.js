
import template from '../index.html'
import Vue from 'vue'
import App from './App.vue';
// import 'babel-polyfill'

new Vue({
    el: '#app',
    template: '<App/>',
    components: { App },
})