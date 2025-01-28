<script setup>
import { ref } from 'vue';
import { getItem, setItem } from '../../utils/db';

const quote = ref('');
const isHovering = ref(false);

const getDate = () => {
  let oDate = new Date();
  let year = oDate.getFullYear();
  let month =
    oDate.getMonth() < 9 ? '0' + (oDate.getMonth() + 1) : oDate.getMonth() + 1;
  let date = oDate.getDate() < 10 ? '0' + oDate.getDate() : oDate.getDate();
  return year + '-' + month + '-' + date;
};

// 判断今天是否是新的一天
const isNewDay = (yesterday) => {
  return getDate() !== yesterday;
};

async function fetchHitokoto() {
  const response = await fetch('https://v1.hitokoto.cn');
  const { hitokoto, from_who } = await response.json();
  console.log(hitokoto);

  quote.value = hitokoto + (from_who ? ' - ' + from_who : '');
  setItem('quote', quote.value);
}

const copyQuote = () => {
  window.utools.copyText(quote.value);
  ElMessage({
    message: '已复制到剪切板',
    type: 'success',
    plain: true,
  });
};

if (isNewDay(getItem('yesterday'))) {
  fetchHitokoto();
  setItem('yesterday', getDate());
} else {
  quote.value = getItem('quote');
}

const emit = defineEmits(['translateQuote']);

const translate = () => {
  emit('translateQuote', quote.value);
};
</script>
<template>
  <div class="quote-container">
    <el-tooltip placement="right" effect="light">
      <template #content>
        <div class="quote-tool">
          <svg-icon
            class="tool-icon"
            icon-name="icon-search"
            size="var(--icon-size)"
            color="var(--icon-color)"
            title="翻译试试？"
            @click="translate"
          />
          <svg-icon
            class="tool-icon refresh-icon"
            icon-name="icon-refresh"
            size="var(--icon-size)"
            color="var(--icon-color)"
            title="切换"
            @click="fetchHitokoto"
          />
          <svg-icon
            class="tool-icon"
            icon-name="icon-copy"
            size="var(--icon-size)"
            color="var(--icon-color)"
            title="复制"
            @click="copyQuote"
          />
        </div>
      </template>
      <div class="quote">「 {{ quote }} 」</div>
    </el-tooltip>
  </div>
</template>
<style scoped>
.quote-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 12px;
}

.quote-tool {
  display: flex;
  padding-top: 3px;
}

.quote-tool .refresh-icon {
  margin: 0 5px;
}

.quote-tool .tool-icon:hover {
  cursor: pointer;
  opacity: 0.7;
}
</style>
