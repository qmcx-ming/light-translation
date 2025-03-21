<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getHistory, setHistory } from '../../utils/history';
import { showMessage } from '../../utils/common';

const emit = defineEmits(['translate']);

const hPopover = ref();
const history = ref([]);
const hPopoverVisible = ref(false);

const showPopover = (event) => {
  event.stopPropagation();
  hPopoverVisible.value = !hPopoverVisible.value;
  history.value = getHistory() || [];
};

// 鼠标移入显示x
const showClose = ref([]);
const handleMouseEnter = (index) => {
  showClose.value[index] = true;
};
const handleMouseLeave = (index) => {
  showClose.value[index] = false;
};

const delHistory = (index) => {
  history.value.splice(index, 1);
  setHistory(history.value);
  showMessage('删除成功');
};

const handleClick = (item) => {
  emit('translate', item);
};

const searchText = ref('');

const clearAll = (event) => {
  // 阻止 popconfirm 默认的关闭行为
  event.stopPropagation();
  history.value = [];
  setHistory(history.value);
  showMessage('清空成功');
  hPopoverVisible.value = true;
};

const handleCancel = (event) => {
  // 阻止 popconfirm 默认的关闭行为
  event.stopPropagation();

  // 保持popover显示
  hPopoverVisible.value = true;
};

const searchHistory = () => {
  if (searchText.value) {
    history.value = history.value.filter((item) => {
      return item.name.includes(searchText.value);
    });
  } else {
    history.value = getHistory() || [];
  }
}

// 监听点击事件，点击外部关闭popover
const handleClickOutside = (event) => {
  // 判断点击的是否是删除图标或popover内部元素
  const target = event.target;
  if (
    hPopover.value &&
    !hPopover.value.$el.contains(target) &&
    !target.closest('.history-toolbar') &&
    !target.closest('.el-input__clear') &&
    !target.closest('.del') &&
    !target.closest('.no-history') &&
    !target.closest('.history-length')
  ) {
    hPopoverVisible.value = false;
  }
};

// 在组件挂载时添加监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 在组件卸载时移除监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="translate-history">
    <el-popover
      :visible="hPopoverVisible"
      ref="hPopover"
      placement="top-start"
      width="250"
      trigger="click"
      transition="el-zoom-in-top"
      popper-style="padding: 5px;"
    >
      <template #reference>
        <svg-icon
          class-name="clock-icon"
          icon-name="icon-clock"
          size="var(--icon-size)"
          color="var(--icon-color)"
          @click="showPopover"
        />
      </template>
      <template #default>
        <div class="history-list">
          <div class="history-toolbar">
            <el-input
              class="search-input"
              v-model="searchText"
              size="small"
              clearable
              placeholder="回车搜索"
              @keyup.enter="searchHistory"
            />
            <el-popconfirm
              title="确定清空历史记录吗？"
              cancel-button-text="取消"
              confirm-button-text="确定"
              @confirm="clearAll"
              @cancel="handleCancel"
            >
              <template #reference>
                <svg-icon
                  class="del-all"
                  icon-name="icon-delete"
                  size="var(--icon-size)"
                  color="var(--icon-color)"
                  v-show="history.length"
                  title="清空"
                />
              </template>
            </el-popconfirm>
          </div>
          <div
            class="history-item"
            v-for="(item, index) in history"
            :key="index"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave(index)"
          >
            <span
              class="history-text"
              :title="item.name"
              @click="handleClick(item)"
              >{{ item.name }}</span
            >
            <span
              class="del"
              v-show="showClose[index]"
              @click="delHistory(index)"
              title="删除"
              >×</span
            >
          </div>
          <div v-show="!history.length" class="no-history">暂无数据</div>
        </div>
        <div v-show="history.length" class="history-length">{{ history.length }}条记录</div>
      </template>
    </el-popover>
  </div>
</template>
<style scoped>
.history-list {
  max-height: 285px;
  overflow: auto;
}

/* 隐藏滚动条 */
.history-list::-webkit-scrollbar {
  display: none;
}

.history-toolbar {
  padding: 5px 10px;
  background-color: var(--el-popover-bg-color);
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.history-toolbar .del-all {
  cursor: pointer;
  /* margin-right: -4px; */
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  transition: all 0.3s;
  letter-spacing: 1px;
}

.history-item .history-text {
  width: 200px;
  /* 超出显示... */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.del {
  width: 18px;
  height: 18px;
  font-size: 18px;
  text-align: center;
  line-height: 18px;
  border-radius: 50%;
  color: var(--color-main);
  cursor: pointer;
  letter-spacing: normal;
  transition: background-color 0.3s;
}

.del:hover {
  background-color: var(--el-color-info-light-7);
}

.history-item:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.no-history {
  text-align: center;
  font-size: 12px;
  user-select: none;
}

.history-length {
  position: sticky;
  text-align: right;
  font-size: 10px;
  letter-spacing: 1px;
  margin-top: 2px;
  user-select: none;
}
</style>
