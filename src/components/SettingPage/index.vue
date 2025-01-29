<script setup>
import { ref, watch } from 'vue';
import { getItem, setItem, init } from '../../utils/db';
import { showMessage } from '../../utils/common';

const props = defineProps({
  settingOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:settingOpen', 'update:config']);

const closeDrawer = () => {
  emit('update:settingOpen', false);
};

const form = ref(getItem('config'));

const saveData = () => {
  console.log('保存数据');
  setItem('config', form.value);
  emit('update:settingOpen', false);
  emit('update:config', form.value);
  showMessage('保存成功');
};

const openMessageBox = () => {
  ElMessageBox.confirm('确定要重置所有数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    init(true);
    form.value = getItem('config');
    emit('update:config', form.value);
    showMessage('重置成功');
  });
};

// 监听 settingOpen 变化
watch(
  () => props.settingOpen,
  (val) => {
    if (val) {
      form.value = getItem('config');
    }
  }
);

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
    id: 'alibaba',
    name: '阿里翻译',
  },
  {
    id: 'tencent',
    name: '腾讯翻译',
  },
]);

const openLink = (id) => {
  const url = {
    baidu: 'https://api.fanyi.baidu.com/product/11',
    alibaba: 'https://www.aliyun.com/product/ai/base_alimt?source=5176.11533457&userCode=wsnup3vv',
    tencent: 'https://cloud.tencent.com/product/tmt',
    other: 'https://blog.csdn.net/weixin_44253490/article/details/126365385'
  }[id];
  window.utools.shellOpenExternal(url);
}
</script>
<template>
  <div class="setting-page">
    <div class="setting-page-content">
      <el-form :model="form">
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
        >
          <el-input v-model="form.googleUrl" placeholder="请输入谷歌翻译地址">
            <template #prepend>
              <img
                class="engine-icon"
                src="/icons/engine/google.svg"
                alt="图标"
              />
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
            placeholder="AccessKeyID"
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
                placeholder="AccessKeySecret"
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
        <el-text class="engine-desc" size="small" v-show="form.translateEngine !== 'google'">
          <el-link class="info-link" @click="openLink('other')">
            不会申请怎么办？👈
          </el-link>
          <el-link class="info-link" @click="openLink(form.translateEngine)">
            还没有翻译API？👈
          </el-link>
        </el-text>
        <h4>全局配置</h4>
        <el-form-item label="快捷复制">
          <el-radio-group v-model="form.copyKey">
            <el-radio :value="true">开启</el-radio>
            <el-radio :value="false">关闭</el-radio>
            <el-text class="mx-1" size="small"
              >开启后，将实现全局复制翻译结果</el-text
            >
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    <div class="drawer-footer">
      <el-button @click="openMessageBox" type="danger">重置所有数据</el-button>
      <el-button @click="closeDrawer" plain>关闭</el-button>
      <el-button type="primary" @click="saveData">保存</el-button>
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
  gap: 10px;
}

.engine-desc .info-link {
  font-size: 12px;
}
</style>
