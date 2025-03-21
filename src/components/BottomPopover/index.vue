<script setup>
import { ref } from 'vue';

const arrowRight = ref();
const popoverRef = ref();

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  dict: {
    type: Array,
    default: () => [],
  },
  example: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['handleMeanClick']);

const showPopover = () => {
  // 图标逆时针旋转90度
  arrowRight.value.style.transform = 'rotate(-90deg)';
};

const hidePopover = () => {
  // 图标还原
  arrowRight.value.style.transform = 'rotate(0deg)';
  exampleAll.value = false;
  dictAll.value = props.dict.map(() => false);
};

const handleMeanClick = (item) => {
  console.log(item);
  emit('handleMeanClick', item);
  // 手动关闭popover
  popoverRef.value.hide();
};

const dictAll = ref(props.dict.map(() => false));
const exampleAll = ref(false);

const dictMoreShow = (meaning) => {
  // 从第三个元素开始截取，截取三个
  const str = meaning.length <= 4 ? '' : ' ...'
  return (
    meaning
      .slice(3, 6)
      .map((item) => item[0])
      .join(', ') + str
  );
};
</script>
<template>
  <el-popover
    ref="popoverRef"
    placement="top"
    width="92%"
    :offset="0.5"
    trigger="click"
    :show-arrow="false"
    transition="el-zoom-in-bottom"
    @before-enter="showPopover"
    @before-leave="hidePopover"
    :disabled="dict.length === 0 && example.length === 0"
  >
    <template #reference>
      <div class="bottom-more">
        <svg-icon
          :class="isLoading ? 'loading-icon loading' : 'loading-icon'"
          icon-name="icon-loading"
          size="var(--icon-size)"
          color="var(--icon-color)"
        />
        <span
          ref="arrowRight"
          :style="{
            opacity: dict.length === 0 && example.length === 0 ? 0 : 1,
          }"
          class="arrow-right"
          >▶</span
        >
      </div>
    </template>
    <template #default>
      <div style="max-height: 300px; overflow: auto">
        <div v-if="dict && dict.length">
          <div v-for="(item, index) in dict" :key="index">
            <div class="category-name">{{ item.category }}</div>
            <div class="category-content">
              <div
                v-for="(mean, idx) in item.meaning"
                :key="idx"
                class="content-item"
              >
                <span
                  v-show="idx < 3 || dictAll[index]"
                  class="category-meaning mean"
                  @click="handleMeanClick(mean[0])"
                  >{{ mean[0] }}</span
                >
                <div
                  class="category-meaning"
                  v-show="idx < 3 || dictAll[index]"
                >
                  <span v-for="(m, i) in mean[1]" :key="i">
                    <span class="mean" @click="handleMeanClick(m)">{{
                      m
                    }}</span>
                    <span class="comma" v-if="i < mean[1].length - 1">,</span>
                  </span>
                </div>
              </div>
              <span
                class="more-show"
                title="展开"
                v-show="item.meaning.length > 3 && !dictAll[index]"
                @click="dictAll[index] = true"
              >
                <!-- 从meaning[3]开始显示三个 -->
                {{ dictMoreShow(item.meaning) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="example && example.length">
          <div class="example-text">示例</div>
          <p v-for="(item, index) in example" :key="index" class="example-item">
            <span v-html="'📚 ' + item" v-show="index < 1 || exampleAll"></span>
          </p>
          <span
            class="more-show"
            v-show="example.length > 1 && !exampleAll"
            @click="exampleAll = true"
          >
            显示全部{{ example.length }}个示例
          </span>
        </div>
      </div>
    </template>
  </el-popover>
</template>
<style scoped>
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
  transition: transform 0.3s;
}

/* 逗号 */
.comma {
  color: #2196f3;
  margin: 0 5px 0 2px;
  user-select: none;
}

.category-content,
.example-item {
  text-indent: 1em;
}

.category-name,
.example-text {
  font-weight: bold;
  font-style: italic;
  margin-top: 5px;
}

.example-item {
  margin: 10px 0;
}

.category-meaning {
  margin: 1px 0;
  cursor: pointer;
  transition: color 0.3s;
}

.mean:hover {
  color: #165dff;
}

.content-item {
  margin: 5px 0;
}

.more-show {
  padding: 5px 10px;
  background-color: var(--more-show-bg);
  color: var(--color-main);
  font-size: 12px;
  cursor: pointer;
  letter-spacing: 1px;
  margin-left: 1em;
  transition: opacity 0.3s;
}

.more-show:hover {
  opacity: 0.8;
}
</style>
