<script setup>
import { computed } from 'vue';

const props = defineProps({
  from: {
    type: String,
    required: true,
    default: 'auto'
  },
  to: {
    type: String,
    required: true,
    default: 'zh'
  },
  langs: {
    type: Array,
    required: true,
    default: () => []
  },
  detectLang: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      code: ''
    })
  }
})

const emit = defineEmits([
  'from-select-change',
  'to-select-change',
  'exchange'
])

const fromChange = (val) => {
  emit('from-select-change', val)
}

const toChange = (val) => {
  emit('to-select-change', val)
}

const exchange = () => {
  emit('exchange')
}

const toLanguages = computed(() => {
  // 排除auto
  return props.langs.filter(item => item.code !== 'auto');
})
</script>
<template>
  <div class="lang-container">
    <el-select
      :model-value="from"
      placeholder="Select"
      size="large"
      :offset="0"
      :show-arrow="false"
      @change="fromChange"
    >
      <el-option
        v-for="item in langs"
        :key="item.code"
        :label="item.name"
        :value="item.code"
      />
    </el-select>
    <div class="exchange" @click="exchange">⇄</div>
    <el-select
      :model-value="to"
      placeholder="Select"
      size="large"
      :offset="0"
      :show-arrow="false"
      @change="toChange"
    >
      <el-option
        v-for="item in toLanguages"
        :key="item.code"
        :label="item.name"
        :value="item.code"
      />
    </el-select>
    <div class="detect-language">{{ detectLang.name }}</div>
  </div>
</template>
<style scoped>
.lang-container {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.lang-container .detect-language {
  position: absolute;
  left: 85px;
  top: 25%;
  font-size: 13px;
  color: #6d6e71;
  transform: translateY(10%);
  user-select: none;
}

.exchange {
  min-width: var(--common-wh);
  margin: 0 15px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
</style>
