<script setup>
import { ref } from 'vue';
import { getHistory, setHistory } from '../../utils/history';
import { showMessage } from '../../utils/common';

const emit = defineEmits(['translate']);

const hPopover = ref();
const history = ref([]);

const showPopover = () => {
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
  hPopover.value.hide();
};
</script>
<template>
  <div class="translate-history">
    <el-popover
      ref="hPopover"
      placement="top-start"
      width="250"
      trigger="click"
      transition="el-zoom-in-top"
      popper-style="padding: 5px;"
      @before-enter="showPopover"
    >
      <template #reference>
        <svg-icon
          class-name="clock-icon"
          icon-name="icon-clock"
          size="var(--icon-size)"
          color="var(--icon-color)"
        />
      </template>
      <template #default>
        <div class="history-list">
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
              >×</span
            >
          </div>
          <div v-show="!history.length" class="no-history">暂无数据</div>
        </div>
      </template>
    </el-popover>
  </div>
</template>
<style scoped>
.history-list {
  max-height: 302px;
  overflow: auto;
}
.history-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
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
  color: var(--color);
  cursor: pointer;
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
}
</style>
