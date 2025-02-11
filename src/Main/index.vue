<script lang="js" setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { translate, audio, detectLanguageZh } from '../translate';
import { getConfig, setConfig, engineList, getEngineName } from '../utils/config';
import { getHistory, setHistory } from '../utils/history';
import { showMessage, $ } from '../utils/common';

import SettingPage from '../components/SettingPage/index.vue';
import LangSelect from '../components/LangSelect/index.vue';
import MoreButton from '../components/MoreButton/index.vue';
import Quote from '../components/Quote/index.vue';
import BottomPopover from '../components/BottomPopover/index.vue';
import TranslateHistory from '../components/TranslateHistory/index.vue';

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
const languages = ref([]);
let config = ref(getConfig());

onMounted(async () => {
  await setLanguage();
  to.value = languages.value[1].code;
  if(props.text) {
    text.value = props.text;
    toTranslate();
  }
  if(props.show) {
    textRef.value.focus();
  }
  window.utools.setExpendHeight(550);
  copyKeyListen();
})

onBeforeUnmount(() => {
  window.removeEventListener('copy', copyResult);
})

const setLanguage = async () => {
  // 动态导入语言包
  const module = await import(`../languages/${engine.value}-language.json`);
  languages.value = module.default;
}

const iptRows = ref(15);// 输入框默认行数

const engine = ref(config.value.translateEngine);

const changeEngine = async (engineId) => {
  engine.value = engineId;
  config.value.translateEngine = engineId;
  console.log(config.value);

  setConfig(config.value);
  await setLanguage();
  from.value = languages.value[0].code;
  to.value = languages.value[1].code;
}

const settingOpen = ref(false);

const settingUpdate = async (cfg) => {
  engine.value = cfg.translateEngine;
  await setLanguage();
  from.value = languages.value[0].code;
  to.value = languages.value[1].code;
  googleUrl.value = cfg.googleUrl;
  config.value = cfg;
}

const copyKeyListen = () => {
  window.removeEventListener('copy', copyResult); // 先清除已存在的监听
  if (config.value.copyKey) {
    window.addEventListener('copy', copyResult);
  }
};

watch(settingOpen, (val) => {
  if(val) {
    window.removeEventListener('copy', copyResult);
  } else {
    copyKeyListen();
  }
});

const googleUrl = ref(config.value.googleUrl);
const isLoading = ref(false);

const text = ref('');
const result = ref('');
const from = ref('auto');
const to = ref('');
const fromPhonetic = ref('');
const toPhonetic = ref('');
const detectLang = ref({
  name: '',
  code: ''
});
const dict = ref([]);
const example = ref([]);

const toLanguages = computed(() => {
  // 排除auto
  return languages.value.filter(item => item.code !== 'auto');
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
  isLoading.value = true;
  to.value = autoChange(text.value, from.value, to.value, languages.value);
  const { id, key } = config.value[engine.value] || { id: 'xxx', key: 'xxx' };
  if(!id || !key) {
    showMessage(`请先检查「${getEngineName(engine.value)}」配置是否完善`, 'error');
    clearText(false);
    isLoading.value = false;
    return;
  }
  translate(text.value, engine.value, id, key,
  from.value, to.value, googleUrl.value)
  .then(res => {
    console.log(res);
    result.value = res.dst;
    if(engine.value === 'google') {
      fromPhonetic.value = res.detail.fromPhonetic;
      toPhonetic.value = res.detail.toPhonetic;
      dict.value = res.detail.dict;
      example.value = res.detail.example;
    } else {
      fromPhonetic.value = '';
      toPhonetic.value = '';
      dict.value = [];
      example.value = [];
    }
    if(from.value === 'auto')
      detectLang.value = languages.value.find(item => item.code === res.from);
    soundEnable('from', true, fromSoundWrapper.value);
    soundEnable('to', true, toSoundWrapper.value);
    changeHistory({ name: text.value });
  }).catch(err => {
    console.log(err);
    showMessage(err.error, 'error');
    clearText(false);
  }).finally(() => isLoading.value = false);
}

// 一个简单的中英文语种自动切换
const autoChange = (text, from, to, languages) => {
  // 在语言表中，索引为1的是中文，索引为2的是英文
  // 判断text是否为中文
  if(detectLanguageZh(text) && to === languages[1].code && from !== 'wyw') {
    return languages[2].code;
  }
  // 判断text是否为英文
  if(!detectLanguageZh(text) && to === languages[2].code) {
    return languages[1].code;
  }
  return to;
}

const clearText = (isText = true) => {
  if(isText) {
    text.value = '';
  }
  result.value = '';
  fromPhonetic.value = '';
  toPhonetic.value = '';
  dict.value = [];
  example.value = [];
  detectLang.value = {
    name: '',
    code: ''
  };
  resetSound();
}

const handleKeydown = (e) => {
  // 回车翻译，不换行 shift + enter 换行
  if (!e.shiftKey && e.keyCode == 13 && !config.value.autoTranslate) {
		e.preventDefault();
		toTranslate();
	}
}

let timeout = null;

const handleInput = (text) => {
  if(config.value.autoTranslate) {
    clearTimeout(timeout);
    // 去除空格
    text = text.replace(/\s+/g, '');
    timeout = setTimeout(() => {
      if (text) {
        console.log(text);
        toTranslate();
      }
    }, 500);
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

// 点击词典触发
const handleMeanClick = (item) => {
  text.value = item;
  toTranslate();
}

const copyResult = () => {
  if(!result.value) {
    return;
  }
  window.utools.copyText(result.value);
  showMessage('已复制到剪切板');
}

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
      // 重置
      resetSound();
      isPlaying.value[id - 1] = false;
    });
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

const changeHistory = (history) => {
  // 不保存历史记录
  if(config.value.historyMax === 0) {
    return;
  }
  const historyList = getHistory() || [];
  const index = historyList.findIndex(item => item.name === history.name);
  // 如果找到相同，清除旧的历史记录
  if (index !== -1) {
    historyList.splice(index, 1);
  }
  // 如果超过n条，删除最后一条
  if (historyList.length >= config.value.historyMax) {
    historyList.pop();
  }
  historyList.unshift(history);
  setHistory(historyList);
}

const handlerHistory = (history) => {
  text.value = history.name;
  toTranslate();
}

// 判断翻译引擎是否可用(id或key是否不为空)
const isEngineIdKey = (engine) => {
  if(engine === 'google' || engine === 'microsoft') return true;
  const cfg = config.value;
  // 判断翻译引擎的id或key是否不为空
  return cfg[engine] && cfg[engine].id && cfg[engine].key;
}

const processedEngineList = computed(() => {
  return engineList.map(item => ({
    ...item,
    isDisabled: !isEngineIdKey(item.id),
    titleText: !isEngineIdKey(item.id) ? item.name + '未激活' : '',
    opacityStyle: !isEngineIdKey(item.id) ? 0.5 : 1
  }));
});
</script>

<template>
  <div class="main">
    <!-- 顶部语种选择区 -->
    <lang-select
      :from="from"
      :to="to"
      :langs="languages"
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
          @input="handleInput"
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
                  pointerEvents: fromSound ? 'auto' : 'none',
                }"
                :custom-style="{ opacity: fromSound ? 1 : 0.6 }"
              />
            </div>

            <el-tooltip :content="fromPhonetic" placement="top" effect="light" popper-class="tooltip-class">
              <div class="from-phonetic">{{ fromPhonetic }}</div>
            </el-tooltip>
          </div>
          <div class="textarea-toolbar-right">
            <translate-history @translate="handlerHistory" />
            <svg-icon
              class-name="delete-icon"
              icon-name="icon-delete"
              size="var(--icon-size)"
              color="var(--icon-color)"
              @click="clearText"
            />
          </div>
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
                  pointerEvents: toSound ? 'auto' : 'none',
                }"
                :custom-style="{ opacity: toSound ? 1 : 0.6 }"
              />
            </div>
            <el-tooltip :content="toPhonetic" placement="top" effect="light" popper-class="tooltip-class">
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
    <bottom-popover
      :is-loading="isLoading"
      :dict="dict"
      :example="example"
      @handle-mean-click="handleMeanClick"
    />
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
              v-for="(item, index) in processedEngineList"
              :key="index"
              :class="{
                'engine-item': true,
                'engine-selected': item.id === engine,
              }"
              @click="changeEngine(item.id)"
              :disabled="item.isDisabled"
              :title="item.titleText"
            >
              <img
                class="icon"
                :src="`./icons/engine/${item.id}.svg`"
                alt="图标"
                :style="{ opacity: item.opacityStyle }"
              />
              <span class="text">{{ item.name }}</span>
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
        @update:config="settingUpdate"
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

.textarea-toolbar-left, .textarea-toolbar-right {
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

.tooltip-class {
  max-width: 200px;
}

.from-sound-wrapper,
.to-sound-wrapper {
  /* 消除多余高度 */
  font-size: 0;
  cursor: not-allowed;
}

.sound-icon {
  margin-left: 8px;
  pointer-events: none;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  /* 弹性曲线 */
  transform: scale(1);
  user-select: none;
}

.delete-icon, .clock-icon {
  margin-right: 6px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.delete-icon:hover {
  opacity: 0.7;
}

.clock-icon:hover {
  opacity: 0.7;
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

.engine-selected .text {
  color: var(--el-color-primary);
}
</style>
