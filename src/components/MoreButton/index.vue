<script setup>
import { showMessage } from '../../utils/common';

const props = defineProps({
  text: {
    type: String,
    required: true,
    default: ''
  },
  from: {
    type: String,
    required: true,
    default: ''
  },
  to: {
    type: String,
    required: true,
    default: ''
  },
  googleUrl: {
    type: String,
    default: ''
  }
})

const openLink = (command) => {
  let url = 'https://translate.google.com';
  const { text, from, to, googleUrl } = props;
  if(!text) {
    showMessage('请先输入要翻译的内容', 'error');
    return;
  }
  switch (command) {
    case 'google':
      url = (googleUrl ? googleUrl : url) + `?sl=${from}&tl=${to}&text=${text}&op=translate`;
      break;
    case 'baidu':
    url = `https://fanyi.baidu.com/mtpe-individual/multimodal?query=${text}&lang=${from}2${to}`;
      break;
    case 'youdao':
      url = `https://www.youdao.com/result?word=${text}&lang=en`;
      break;
  }
  window.utools.ubrowser.goto(url).show().run({ width: 1000, height: 600 });
}
</script>
<template>
  <div class="more-button">
    <el-dropdown placement="top" @command="openLink">
      <el-button plain size="small" class="more-btn">更多</el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="baidu">百度</el-dropdown-item>
          <el-dropdown-item command="google">谷歌</el-dropdown-item>
          <el-dropdown-item command="youdao">有道</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<style scoped>
.more-btn {
  width: 30px;
  height: 30px;
  font-weight: bold;
}
</style>
