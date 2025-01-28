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
</script>
<template>
  <div class="setting-page">
    <div class="setting-page-content">
      <el-form :model="form">
        <p>翻译配置</p>
        <el-form-item label="谷歌翻译">
          <el-input
            v-model="form.googleUrl"
            placeholder="请输入谷歌翻译地址"
          ></el-input>
          <el-text class="mx-1" size="small"
            >如果翻译地址无法访问，请及时更换其他可用地址。</el-text
          >
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
<style>
.drawer-footer {
  position: fixed;
  bottom: 0;
  padding: 10px;
  right: 10px;
}

.el-drawer__header {
  margin-bottom: 0;
}

.el-drawer__body {
  padding-top: 0px;
}
</style>
