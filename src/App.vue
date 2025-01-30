<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Main from './Main/index.vue'
import { init } from './utils/db';

const route = ref('')
const enterAction = ref({})
const text = ref('');
const autoFocus = ref(false);

onMounted(() => {
  window.utools.onPluginEnter((action) => {
    route.value = action.code
    enterAction.value = action
    autoFocus.value = true;
    if(action.type === 'over' && action.payload) {
      text.value = action.payload;
    }
    let theme;
    // 是否深色主题
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme = isDark ? 'dark' : ''
    // 监听主题切换
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      theme = e.matches ? 'dark' : '';
      // 判断是否是暗黑模式
      document.documentElement.className = utools.isDarkColors() ? "dark" : "";
    })
    // 判断是否是暗黑模式
    document.documentElement.className = utools.isDarkColors() ? "dark" : "";
    init();
  })
  window.utools.onPluginOut((isKill) => {
    route.value = ''
    // 清空
    text.value = '';
    autoFocus.value = false;
  })
})
</script>

<template>
  <template v-if="route === 'qy'">
    <Main :text="text" :show="autoFocus"></Main>
  </template>
</template>
