<script setup>
import { computed } from 'vue';

const props = defineProps({
  iconName: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#409eff',
  },
  size: {
    type: String,
    default: '16px',
  },
  id: {
    type: String,
    default: 'icon'
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  }
});
// 图标在 iconfont 中的名字
const iconClassName = computed(() => {
  return `#${props.iconName}`;
});
// 给图标添加上类名
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`;
  }
  return 'svg-icon';
});
</script>
<template>
  <div>
    <svg :id="id" :class="svgClass" :style="customStyle" aria-hidden="true">
      <use :xlink:href="iconClassName" :fill="color" />
    </svg>
  </div>
</template>
<style scoped>
.svg-icon {
  width: v-bind('props.size');
  height: v-bind('props.size');
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}
</style>
