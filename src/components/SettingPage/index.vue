<script setup>
import { ref, watch, reactive } from 'vue';
import { init } from '../../utils/db';
import { getConfig, setConfig, engineList } from '../../utils/config';
import { showMessage, openURL, removeLastSlash } from '../../utils/common';
import { translate } from '../../translate';
import { getItem, setItem } from '../../utils/db';

const props = defineProps({
  settingOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:settingOpen', 'update:config']);

const ruleFormRef = ref();
const rules = reactive({
  googleUrl: [
    {
      required: true,
      message: '请输入谷歌翻译服务器地址',
      trigger: 'blur',
    },
    {
      message: '谷歌翻译服务器格式错误',
      trigger: 'blur',
      pattern:
        /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i,
    },
  ],
  historyMax: [
    {
      required: true,
      message: '请输入翻译记录最大条数',
      trigger: 'blur',
    },
  ],
  ttsUrl: [
    {
      required: true,
      message: '请输入语音朗读服务器地址',
      trigger: 'blur',
    },
    {
      message: '语音朗读服务器格式错误',
      trigger: 'blur',
      pattern:
        /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i,
    },
  ],
});

const closeDrawer = () => {
  emit('update:settingOpen', false);
  ruleFormRef.value.resetFields();
};

const form = ref(getConfig());

const saveData = (formEl) => {
  if (!formEl) return;
  // 当前使用的翻译引擎的id和key不为空
  const engine = form.value.translateEngine;
  if (engine !== 'google' && engine !== 'microsoft') {
    if (!form.value[engine].id || !form.value[engine].key) {
      showMessage('当前使用的翻译引擎id和key不能为空', 'error');
      return;
    }
  }
  form.value.googleUrl = removeLastSlash(form.value.googleUrl);
  form.value.ttsUrl = removeLastSlash(form.value.ttsUrl);
  formEl.validate((valid) => {
    if (valid) {
      setConfig(form.value);
      emit('update:settingOpen', false);
      emit('update:config', form.value);
      showMessage('保存成功');
    } else {
      console.log('error submit!');
    }
  });
};

const openMessageBox = () => {
  ElMessageBox.confirm('确定要重置所有数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    init(true);
    form.value = getConfig();
    emit('update:config', form.value);
    showMessage('重置成功');
  });
};

// 监听 settingOpen 变化
watch(
  () => props.settingOpen,
  (val) => {
    if (val) {
      form.value = getConfig();
    }
  }
);

const idKeys = ref({
  google: { id: 'API Key', key: 'API Secret' },
  microsoft: { id: 'Client ID', key: 'Client Secret' },
  baidu: { id: 'APP ID', key: '密钥' },
  alibaba: { id: 'AccessKey ID', key: 'AccessKey Secret' },
  tencent: { id: 'SecretId', key: 'SecretKey' },
});

const openLink = (id) => {
  const url = {
    baidu: 'https://api.fanyi.baidu.com/product/11',
    alibaba:
      'https://www.aliyun.com/product/ai/base_alimt?source=5176.11533457&userCode=wsnup3vv',
    tencent: 'https://cloud.tencent.com/product/tmt',
    other: 'https://blog.csdn.net/weixin_44253490/article/details/126365385',
  }[id];
  window.utools.shellOpenExternal(url);
};

// 随机返回一个数组中的元素
const randomText = () => {
  const arr = [
    'Hello',
    'Hi',
    'Nice',
    'Good',
    'Hey',
    'Hiya',
    'World',
    'Sing',
    'Dance',
    'Rap',
    'Basketball',
  ];
  return arr[Math.floor(Math.random() * arr.length)];
};

const speedTest = async () => {
  const loading = ElLoading.service({ fullscreen: true, text: '测试中...' });
  isShowServer.value = false;
  let url = new URL(form.value.googleUrl);
  try {
    const startTime = performance.now(); // 开始时间
    const res = await translate(
      randomText(),
      'google',
      'appId',
      'secretKey',
      'auto',
      'zh-CN',
      url.href
    );
    const endTime = performance.now(); // 结束时间
    const responseTime = (endTime - startTime).toFixed(2); // 响应时间
    let color = '';
    if (responseTime < 500) {
      color = '#67c23a';
    } else {
      color = '#e6a23c';
    }
    const msg = res
      ? `测试成功 <font color="${color}">${responseTime}ms</font>`
      : '测试失败';
    confirmSpeedTest(msg);
  } catch (err) {
    confirmSpeedTest(
      '测试失败，无法连接到服务器 <font color="red">Error</font>'
    );
  } finally {
    loading.close();
  }
};

const confirmSpeedTest = (msg) => {
  ElMessageBox.confirm(msg, '谷歌翻译服务器', {
    confirmButtonText: '确定',
    type: 'info',
    showCancelButton: false,
    dangerouslyUseHTMLString: true,
  }).catch(() => {});
};

const serverList = ref([]);
const isShowServer = ref(false);

const getServerList = async () => {
  isShowServer.value = true;
  if (!serverList.value.length) {
    const list = getItem('serverList');
    if (list) {
      serverList.value = list;
      console.log('从本地获取服务器列表');
    } else {
      await getServerApi();
    }
  }
};

const fetchNewServerList = async () => {
  const loading = ElLoading.service({ fullscreen: true, text: '测试中...' });
  await getServerApi();
  showMessage('更新服务器列表成功');
  loading.close();
};

const getServerApi = async () => {
  try {
    const res = await fetch(
      'https://mock.presstime.cn/mock/67a988796dcf57b17b1d37b9/translate-google-proxy/list'
    );
    const data = await res.json();
    serverList.value = data.data;
    setItem('serverList', serverList.value);
    console.log('从服务器获取服务器列表');
  } catch (err) {
    showMessage('获取服务器列表失败，请稍后重试', 'error');
  }
};
</script>
<template>
  <div class="setting-page">
    <div class="setting-page-content">
      <el-form
        :model="form"
        :rules="rules"
        ref="ruleFormRef"
        :hide-required-asterisk="true"
      >
        <h4>翻译配置</h4>
        <el-form-item label="翻译引擎">
          <el-select
            v-model="form.translateEngine"
            placeholder=""
            :offset="0"
            :show-arrow="false"
          >
            <el-option
              v-for="item in engineList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="谷歌翻译"
          v-show="form.translateEngine === 'google'"
          prop="googleUrl"
        >
          <el-dropdown trigger="click" max-height="300" style="width: 100%">
            <el-input
              class="config-google-url"
              v-model="form.googleUrl"
              placeholder="请输入谷歌翻译地址"
              clearable
              @focus="getServerList"
            >
              <template #prepend>
                <img
                  class="engine-icon"
                  src="/icons/engine/google.svg"
                  alt="图标"
                />
              </template>
              <template #append>
                <button class="test-btn" @click="speedTest">测试</button>
              </template>
            </el-input>
            <template #dropdown>
              <el-dropdown-menu v-show="isShowServer">
                <el-dropdown-item
                  v-for="(item, index) in serverList"
                  :key="index"
                  @click="form.googleUrl = item"
                  :class="{ 'dropdown_selected': item === form.googleUrl }"
                >
                  {{ item }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-text size="small"
            >如果翻译地址无法访问，请及时更换其他可用地址。</el-text
          >
          <el-popconfirm
            title="确定要同步最新服务吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="fetchNewServerList"
          >
            <template #reference>
              <el-text
                class="cusor-pointer"
                size="small"
                type="primary"
                title="点击拉取最新服务地址列表"
              >
                同步最新服务
              </el-text>
            </template>
          </el-popconfirm>
        </el-form-item>
        <el-form-item
          label="百度翻译"
          v-show="form.translateEngine === 'baidu'"
        >
          <el-input
            type="password"
            v-model="form.baidu.id"
            placeholder="APP ID"
            show-password
            clearable
          >
            <template #prepend>
              <img
                class="engine-icon"
                src="/icons/engine/baidu.svg"
                alt="图标"
              />
            </template>
            <template #append>
              <el-input
                v-model="form.baidu.key"
                type="password"
                placeholder="密钥"
                show-password
                clearable
              ></el-input>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="阿里翻译"
          v-show="form.translateEngine === 'alibaba'"
        >
          <el-input
            type="password"
            v-model="form.alibaba.id"
            placeholder="AccessKey ID"
            show-password
            clearable
          >
            <template #prepend>
              <img
                class="engine-icon"
                src="/icons/engine/alibaba.svg"
                alt="图标"
              />
            </template>
            <template #append>
              <el-input
                v-model="form.alibaba.key"
                type="password"
                placeholder="AccessKey Secret"
                show-password
                clearable
              ></el-input>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="腾讯翻译"
          v-show="form.translateEngine === 'tencent'"
        >
          <el-input
            type="password"
            v-model="form.tencent.id"
            placeholder="SecretId"
            show-password
            clearable
          >
            <template #prepend>
              <img
                class="engine-icon"
                src="/icons/engine/tencent.svg"
                alt="图标"
              />
            </template>
            <template #append>
              <el-input
                v-model="form.tencent.key"
                type="password"
                placeholder="SecretKey"
                show-password
                clearable
              ></el-input>
            </template>
          </el-input>
        </el-form-item>
        <div
          class="engine-desc"
          v-show="
            form.translateEngine !== 'google' &&
            form.translateEngine !== 'microsoft'
          "
        >
          <div class="desc-left">
            <el-text size="small" class="ik-tip">
              {{ idKeys[form.translateEngine].id }}
            </el-text>
            <el-text size="small" class="ik-tip">
              {{ idKeys[form.translateEngine].key }}
            </el-text>
          </div>
          <div class="desc-right">
            <el-link class="info-link" @click="openLink('other')">
              不会申请怎么办？👈
            </el-link>
            <el-link class="info-link" @click="openLink(form.translateEngine)">
              还没有翻译API？👈
            </el-link>
          </div>
        </div>
        <h4>全局配置</h4>
        <el-form-item label="快捷复制">
          <el-radio-group v-model="form.copyKey">
            <el-radio :value="true">开启</el-radio>
            <el-radio :value="false">关闭</el-radio>
            <el-text size="small"
              >开启后，按下<b>Ctrl + C</b>，将实现全局复制翻译结果</el-text
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="翻译记录" prop="historyMax">
          <el-input-number
            v-model="form.historyMax"
            controls-position="right"
            :min="0"
          ></el-input-number>
          <el-text style="margin-left: 10px" size="small">
            最多保留翻译记录数，超出将自动删除最旧记录，0为不保留
          </el-text>
        </el-form-item>
        <el-form-item label="自动翻译">
          <el-radio-group v-model="form.autoTranslate">
            <el-radio :value="true">开启</el-radio>
            <el-radio :value="false">关闭</el-radio>
            <el-text size="small">
              开启后，将<el-tooltip
                content="🔖 自动翻译开启后，回车键翻译功能将不再生效"
                placement="top"
              >
                <b>自动翻译</b> </el-tooltip
              >输入的内容，否则需要手动点击翻译按钮或使用快捷键(Enter)
            </el-text>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="语音朗读" prop="ttsUrl">
          <el-input
            class="tts-url"
            v-model="form.ttsUrl"
            placeholder="请输入语音朗读服务地址"
            clearable
          >
            <template #append>
              <el-input
                class="tts-url-token"
                v-model="form.ttsToken"
                placeholder="密钥(若未设置，留空即可)"
                clearable
              ></el-input>
            </template>
          </el-input>
          <el-text size="small"
            >语音朗读功能依托于开源项目
            <el-text
              size="small"
              class="cusor-pointer"
              type="primary"
              @click="openURL('https://github.com/wxxxcxx/ms-ra-forwarder')"
            >
              ms-ra-forwarder
            </el-text>
            实现，您可根据需求自行部署到 Vercel &nbsp;
          </el-text>
          <el-tooltip
            content="🚀 点击恢复默认TTS地址"
            placement="top"
          >
            <el-text
              size="small"
              class="cusor-pointer"
              type="primary"
              @click="form.ttsUrl = 'https://ms-tts.qmcx-ming.top'"
            >
              恢复默认
            </el-text>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button @click="openMessageBox" type="danger">重置所有数据</el-button>
      <el-button @click="closeDrawer" plain>关闭</el-button>
      <el-button type="primary" @click="saveData(ruleFormRef)">保存</el-button>
    </div>
  </div>
</template>
<style scoped>
.drawer-footer {
  position: fixed;
  bottom: 0;
  padding: 10px;
  right: 10px;
}

.setting-page-content {
  max-height: 460px;
  overflow: auto;
}

.engine-icon {
  width: 16px;
  height: 16px;
}

.engine-desc {
  display: flex;
  justify-content: flex-end;
  position: relative;
}

.engine-desc .desc-left {
  width: calc(100% - 108px - 40px);
  display: flex;
  position: absolute;
  top: -12px;
  left: 108px;
}

.desc-left .ik-tip {
  flex: 1;
}

.engine-desc .desc-right {
  display: flex;
  gap: 10px;
}

.engine-desc .info-link {
  font-size: 12px;
}

.test-btn {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  border: none;
  background-color: #409eff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}

.test-btn:hover {
  background-color: #66b1ff;
}
</style>
