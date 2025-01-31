<script setup>
import { ref, watch, reactive } from 'vue';
import { init } from '../../utils/db';
import { getConfig, setConfig, engineList } from '../../utils/config';
import { showMessage } from '../../utils/common';

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
      pattern: /^(http|https):\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/,
    }
  ],
  historyMax: [
    {
      required: true,
      message: '请输入翻译记录最大条数',
      trigger: 'blur'
    }
  ]
});

const closeDrawer = () => {
  emit('update:settingOpen', false);
};

const form = ref(getConfig());

const saveData = (formEl) => {
  if(!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      setConfig(form.value);
      emit('update:settingOpen', false);
      emit('update:config', form.value);
      showMessage('保存成功');
    } else {
      console.log('error submit!')
    }
  })
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

const speedTest = async () => {
  const loading = ElLoading.service({ fullscreen: true, text: '测试中...' });
  let url = new URL(form.value.googleUrl);
  url.pathname = '/translate_a/element.js';
  try {
    const startTime = performance.now(); // 开始时间
    const res = await fetch(url);
    const endTime = performance.now(); // 结束时间
    const responseTime = (endTime - startTime).toFixed(2); // 响应时间
    let color = '';
    if (responseTime < 500) {
      color = '#67c23a';
    } else {
      color = '#e6a23c';
    }
    const msg = res.ok
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
</script>
<template>
  <div class="setting-page">
    <div class="setting-page-content">
      <el-form :model="form" :rules="rules" ref="ruleFormRef">
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
          <el-input
            class="config-google-url"
            v-model="form.googleUrl"
            placeholder="请输入谷歌翻译地址"
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
          <el-text size="small"
            >如果翻译地址无法访问，请及时更换其他可用地址。</el-text
          >
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
        <div class="engine-desc" v-show="form.translateEngine !== 'google'">
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
            最多保留翻译记录数，0为不保留，超出将自动删除最旧记录
          </el-text>
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
  max-height: 400px;
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
