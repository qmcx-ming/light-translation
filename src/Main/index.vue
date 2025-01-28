<script lang="js" setup>
import { ref, computed, onMounted, watch } from 'vue';
import googleLangs from '../languages/google-language';
import { translate, audio } from '../translate';
import { getItem } from '../utils/db';
import { showMessage } from '../utils/common';

import SettingPage from '../components/SettingPage/index.vue';
import LangSelect from '../components/LangSelect/index.vue';
import MoreButton from '../components/MoreButton/index.vue';
import Quote from '../components/Quote/index.vue'

const props = defineProps({
  // 选中文本
  text: {
    type: String,
    default: ''
  },
  // 进来了
  show: {
    type: Boolean,
    default: false
  }
})

const textRef = ref();

onMounted(() => {
  if(props.text) {
    text.value = props.text;
    toTranslate();
  }
  if(props.show) {
    textRef.value.focus();
  }
})

const arrowLeft = ref();
const iptRows = ref(15);// 输入框默认行数
const autoFocus = ref(false);// 输入框是否自动获取焦点

const showPopover = () => {
  // 图标逆时针旋转90度
  arrowLeft.value.style.transform = 'rotate(-90deg)';
}

const hidePopover = () => {
  // 图标还原
  arrowLeft.value.style.transform = 'rotate(0deg)';
}

const engine = ref('google');

const engineList = ref([
  {
    id: 'google',
    name: '谷歌翻译',
  },
  {
    id: 'baidu',
    name: '百度翻译',
  },
  {
    id: 'tencent',
    name: '腾讯翻译',
  },
  {
    id: 'alibaba',
    name: '阿里翻译',
  }
]);

const changeEngine = (engineId) => {
  engine.value = engineId;
}

const settingOpen = ref(false);

const googleUrl = ref(getItem('config').googleUrl);

const text = ref('');
const result = ref('');
const from = ref('auto');
const to = ref('zh-CN');
const fromPhonetic = ref('');
const toPhonetic = ref('');
const detectLang = ref({
  name: '',
  code: ''
});
const dictAndExample = ref('');

const toLanguages = computed(() => {
  // 排除auto
  return googleLangs.filter(item => item.code !== 'auto');
})

const fromSelectChange = (val) => {
  from.value = val;
  if(val !== 'auto') {
    detectLang.value = {
      name: '',
      code: ''
    }
  }
};

const toSelectChange = (val) => {
  to.value = val;
}

const toTranslate = () => {
  if(!text.value) return;
  if(text.value.length > 5000) {
    showMessage('翻译内容不能超过5000字', 'error');
    return;
  }
  result.value = '正在翻译中...';
  autoChange();
  translate(text.value, engine.value, 'appId', 'secretKey',
  from.value, to.value, googleUrl.value)
  .then(res => {
    console.log(res);
    result.value = res.dst;
    fromPhonetic.value = res.detail.fromPhonetic;
    toPhonetic.value = res.detail.toPhonetic;
    if(from.value === 'auto')
      detectLang.value = googleLangs.find(item => item.code === res.from);
    handleDictAndExample(res.detail);
    soundEnable('from', true, fromSoundWrapper.value);
    soundEnable('to', true, toSoundWrapper.value);
  }).catch(err => {
    console.log(err);

    showMessage(err.error, 'error');
  })
}

// 一个简单的中英文语种自动切换
const autoChange = () => {
  // 判断text是否为中文
  if(/[\u4e00-\u9fa5]/gm.test(text.value) && to.value === 'zh-CN') {
    to.value = 'en';
  }
  // 判断text是否为英文
  if(!/[\u4e00-\u9fa5]/gm.test(text.value) && to.value === 'en') {
    to.value = 'zh-CN';
  }
}


// 处理词典和例句
const handleDictAndExample = (detail) => {
  const { dict, example } = detail;
  let str = '';
  if(dict.length > 0) {
    str = dict.map(item => `
      <div class="category-name">${item.category}</div>
      <div class="category-content">
          ${item.meaning.map(mean => `
              <div class="category-meaning">${mean[0]}</div>
              <div class="category-meaning">
                ${mean[1].join('<span class="comma">,</span> ')}
              </div>
          `).join('')}
      </div>`).join('');
  }
  if(example.length > 0) {
    str += `
    <div class="example-text">示例</div>
    ${example.map(item => `<p class="example-item">${item}</p>`).join('')}
    `;
  }

  dictAndExample.value = str;
}

const clearText = () => {
  text.value = '';
  result.value = '';
  fromPhonetic.value = '';
  toPhonetic.value = '';
  dictAndExample.value = '';
  detectLang.value = {
    name: '',
    code: ''
  };
  resetSound();
}

const handleKeydown = (e) => {
  // 回车翻译，不换行 shift + enter 换行
  if (!e.shiftKey && e.keyCode == 13) {
		e.preventDefault();
		toTranslate();
	}
}

const exchangeLang = () => {
  // 获取当前 from 和 to 的语种
  const currentFrom = from.value;
  const currentTo = to.value;

  // 交换 from 和 to 语种
  from.value = currentTo;
  to.value = currentFrom;

  // 确保 to 语种不是 "auto"
  if (to.value === 'auto') {
    // 如果 to 语种是 "auto"，则切换到第一个非 "auto" 语种
    to.value = toLanguages.value[0].code;
  }

  // 检查交换后 from 和 to 是否相同
  if (from.value === to.value) {
    // 如果相同，切换到 toLanguages 中的下一个语种
    const toLangList = toLanguages.value;
    const currentIndex = toLangList.findIndex(item => item.code === to.value);
    const nextIndex = (currentIndex + 1) % toLangList.length;
    to.value = toLangList[nextIndex].code;
  }
}

const copyResult = () => {
  if(!result.value) {
    showMessage('请先翻译一下', 'error');
    return;
  }
  window.utools.copyText(result.value);
  showMessage('已复制到剪切板');
}

window.addEventListener('keydown', (e) => {
  // Ctrl + C 复制结果
  if (e.ctrlKey && e.key === 'c') {
    copyResult();
  }
})

const translateQuote = (quote) => {
  text.value = quote;
  toTranslate();
}

const fromSound = ref(false);
const toSound = ref(false);
const fromSoundWrapper = ref();//包装fromSound
const toSoundWrapper = ref();//包装toSound
const ctx = new AudioContext();
const audioSources = [{}, {}];// 0: from, 1: to
const isPlaying = ref([false, false]); // 跟踪每个音频的播放状态

// 音频状态可用
const soundEnable = (audio, status, wrapper) => {
  if(audio === 'from') {
    fromSound.value = status;
  } else {
    toSound.value = status;
  }
  wrapper.style.cursor = status ? 'pointer' : 'not-allowed';
}

const stopAllAudios = () => {
  audioSources.forEach((source, index) => {
    if (source  && typeof source.stop === 'function') {
      source.stop();
      source.onended = null; // 清除事件监听器
      audioSources[index] = null;
      isPlaying.value[index] = false;
    }
  });
}

const stopAudio = (audioId) => {
  if (audioSources[audioId - 1]) {
    audioSources[audioId - 1].stop();
    audioSources[audioId - 1].onended = null; // 清除事件监听器
    audioSources[audioId - 1] = null;
    isPlaying.value[audioId - 1] = false;
  }
};

const resetSound = () => {
  stopAllAudios();
  const sound = ['from', 'to'];
  sound.forEach(item => {
    soundEnable(item, false, item === 'from' ? fromSoundWrapper.value : toSoundWrapper.value);
  });
}

const toggleSound = async (audioId) => {
  if (isPlaying.value[audioId - 1]) {
    stopAudio(audioId);
  } else {
    playAudio(audioId);
  }
};

const playAudio = async (id) => {
  stopAllAudios();
  const txt = id === 1 ? text.value : result.value;
  const lang = id === 1 ? (from.value === 'auto' ? detectLang.value.code : from.value) : to.value;
  // 播放中
  isPlaying.value[id - 1] = true;
  // 获取音频数据
  audio(txt, lang)
    .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
    .then(ad => {
      const player = ctx.createBufferSource();
      player.buffer = ad;
      player.connect(ctx.destination);
      player.start();

      // 当音频播放结束时清除引用并更新播放状态
      player.onended = () => {
        audioSources[id - 1] = null;
        isPlaying.value[id - 1] = false;
      }
      // 保存播放器
      audioSources[id - 1] = player;
    })
    .catch(err => {
      showMessage(err.error, 'error');
    });
}

const $ = (el) => {
  return document.querySelector(el);
}

// 监听isPlaying变化
watch(isPlaying.value, (newVal) => {
  newVal.forEach((item, index) => {
    if (item) {
      const elementId = index === 0 ? 'fromSound' : 'toSound';
      const style = $(`#${elementId}`).style;
      style.transform = 'scale(1.4)';// 放大
      setTimeout(() => {
        style.transform = 'scale(1)';// 恢复
      }, 500);
    }
  })
})

</script>

<template>
  <div class="main">
    <!-- 顶部语种选择区 -->
    <lang-select
      :from="from"
      :to="to"
      :google-langs="googleLangs"
      :detect-lang="detectLang"
      @from-select-change="fromSelectChange"
      @to-select-change="toSelectChange"
      @exchange="exchangeLang"
    />
    <!-- 中间输入区 -->
    <div class="center-container">
      <div class="mh text-content">
        <el-input
          ref="textRef"
          v-model="text"
          :rows="iptRows"
          type="textarea"
          placeholder="请输入要翻译的内容"
          resize="none"
          :input-style="{ paddingBottom: '30px' }"
          @keydown="handleKeydown"
          :autofocus="autoFocus"
        />
        <div class="textarea-toolbar">
          <div class="textarea-toolbar-left">
            <div ref="fromSoundWrapper" class="from-sound-wrapper">
              <svg-icon
                id="fromSound"
                class-name="sound-icon"
                :icon-name="isPlaying[0] ? 'icon-end' : 'icon-sound'"
                size="var(--icon-size)"
                color="var(--icon-color)"
                @click="toggleSound(1)"
                :style="{
                  pointerEvents: fromSound ? 'auto' : 'none'
                }"
                :custom-style="{ opacity: fromSound ? 1 : 0.6 }"
              />
            </div>

            <el-tooltip :content="fromPhonetic" placement="top">
              <div class="from-phonetic">{{ fromPhonetic }}</div>
            </el-tooltip>
          </div>
          <svg-icon
            class-name="delete-icon"
            icon-name="icon-delete"
            size="var(--icon-size)"
            color="var(--icon-color)"
            @click="clearText"
          />
        </div>
      </div>
      <div class="mh center-feture">
        <el-button size="large" type="primary" @click="toTranslate"
          >翻译</el-button
        >
        <svg-icon
          icon-name="icon-fanyi"
          size="var(--common-wh)"
          color="var(--icon-color)"
        />
        <el-button size="large" plain @click="copyResult">复制</el-button>
      </div>
      <div class="mh result-content">
        <el-input
          v-model="result"
          :rows="iptRows"
          type="textarea"
          placeholder="🚀 回车(Enter)：翻译&#10;↩️ Shift + 回车：换行&#10;📋️ Ctrl + C：复制结果"
          resize="none"
          readonly
          :input-style="{ paddingBottom: '30px' }"
        />
        <div class="textarea-toolbar">
          <div class="textarea-toolbar-left">
            <div ref="toSoundWrapper" class="to-sound-wrapper">
              <svg-icon
                id="toSound"
                class-name="sound-icon"
                :icon-name="isPlaying[1] ? 'icon-end' : 'icon-sound'"
                size="var(--icon-size)"
                color="var(--icon-color)"
                @click="toggleSound(2)"
                :style="{
                  pointerEvents: toSound ? 'auto' : 'none'
                }"
                :custom-style="{ opacity: toSound ? 1 : 0.6 }"
              />
            </div>
            <el-tooltip :content="toPhonetic" placement="top">
              <div class="to-phonetic">{{ toPhonetic }}</div>
            </el-tooltip>
          </div>
          <more-button
            :text="text"
            :from="from"
            :to="to"
            :google-url="googleUrl"
          />
        </div>
      </div>
    </div>
    <!-- 底部更多 -->
    <el-popover
      placement="top"
      :width="740"
      trigger="click"
      :show-arrow="false"
      @before-enter="showPopover"
      @before-leave="hidePopover"
      :disabled="dictAndExample.length === 0"
    >
      <template #reference>
        <div class="bottom-more">
          <el-text style="opacity: 0" class="message"
            >音频正在加载中...</el-text
          >
          <span
            ref="arrowLeft"
            :style="{ opacity: dictAndExample.length === 0 ? 0 : 1 }"
            class="arrow-left"
            >▶</span
          >
        </div>
      </template>
      <template #default>
        <div
          style="max-height: 300px; overflow: auto"
          v-html="dictAndExample"
        ></div>
      </template>
    </el-popover>
    <!-- 一言 -->
    <quote @translate-quote="translateQuote" />

    <div class="footer-toolbar">
      <el-dropdown placement="top" trigger="click">
        <img
          class="engine-icon"
          :src="`./icons/engine/${engine}.svg`"
          alt="图标"
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in engineList"
              :key="index"
              :class="{
                'engine-item': true,
                'engine-selected': item.id === engine,
              }"
              :disabled="item.id !== 'google'"
              @click="changeEngine(item.id)"
              :title="item.id !== 'google' ? '暂未开发🚀' : ''"
            >
              <img
                :style="{ opacity: item.id === 'google' ? 1 : 0.5 }"
                class="icon"
                :src="`./icons/engine/${item.id}.svg`"
                alt="图标"
              />
              <span>{{ item.name }}</span>
            </el-dropdown-item>
            <el-dropdown-item
              class="engine-item"
              divided
              @click="settingOpen = true"
            >
              <svg-icon
                class="icon"
                icon-name="icon-settings"
                size="var(--icon-size)"
                color="var(--icon-color)"
              />
              <el-text>设置</el-text>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 设置 -->
    <el-drawer v-model="settingOpen" title="设置" size="100%">
      <setting-page
        :settingOpen="settingOpen"
        @update:settingOpen="settingOpen = $event"
        @update:config="googleUrl = $event.googleUrl"
      ></setting-page>
    </el-drawer>
  </div>
</template>

<style>
body {
  box-sizing: border-box;
}

.el-popper[data-popper-placement^='top'] > .el-popper__arrow {
  display: none;
}
.main {
  padding: 30px 30px 0 30px;
  display: flex;
  flex-direction: column;
}

.icon {
  width: 18px;
  height: 18px;
}

.mh {
  min-height: 250px;
}

/* 中间区域 */
.center-feture {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 15px;
}

.center-container {
  display: flex;
  justify-content: space-between;
}

.text-content,
.result-content {
  flex: 1;
  position: relative;
}

.textarea-toolbar {
  width: 100%;
  height: 30px;
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.textarea-toolbar-left {
  display: flex;
}

.from-phonetic,
.to-phonetic {
  /* flex: 1; */
  margin: 0 8px;
  max-width: 200px;
  font-size: 13px;
  /* 超出显示... */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.from-sound-wrapper,
.to-sound-wrapper {
  /* 消除多余高度 */
  font-size: 0;
  cursor: not-allowed;
}

.sound-icon {
  margin-left: 8px;
  opacity: 0.6;
  pointer-events: none;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  /* 弹性曲线 */
  transform: scale(1);
  user-select: none;
}

.delete-icon {
  margin-right: 6px;
  cursor: pointer;
}

.logo {
  width: var(--common-wh);
  height: var(--common-wh);
}

.top-center-feture {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 底部更多区域 */
.bottom-more {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid var(--el-border-color);
  cursor: pointer;
  /* 不可选中 */
  user-select: none;
}

.arrow-right {
  transition: all 0.3s;
}

.footer-toolbar {
  position: fixed;
  bottom: 5px;
  right: 5px;
}

.footer-toolbar .engine-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.engine-item .icon {
  margin-right: 5px;
}

.engine-selected {
  background-color: var(--el-color-primary-light-9);
}

.engine-selected .el-text {
  color: var(--el-color-primary);
}

/* 词典和例句 */
/* 逗号 */
.comma {
  color: #2196f3;
  margin: 0 5px 0 2px;
}

.category-content,
.example-item {
  text-indent: 1em;
}

.category-name,
.example-text {
  font-weight: bold;
  font-style: italic;
}
</style>
