<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { SortingQuestion } from '../../../types/question';
import { getOptionsPrefixByIndex } from '@/utils/question';

const props = defineProps<{
  question: SortingQuestion;
  userAnswer: string[] | undefined,
  isSubmit: boolean
}>();

const emit = defineEmits(['answer']);

// 定义用户选择顺序数组
const sortedOptions = ref<number[]>([]);
// 定义每个选项用户第几个选中
const indexSelectIndex = ref<Record<number, number | ''>>({});
props.question.options.forEach((_, index) => {
  indexSelectIndex.value[index] = '';
});


function setUserAnswer() {
  // 重置选中的内容(因为换题了)
  sortedOptions.value = [];
  indexSelectIndex.value = [];

  // 有用户选项时填充
  if (props.userAnswer) {
    const map = {} as Record<string, number>;
    props.question.options.forEach((item, index) => {
      map[item] = index;
    });

    props.userAnswer.forEach((item, index) => {
      sortedOptions.value.push(map[item]);
      indexSelectIndex.value[map[item]] = index + 1;
    });
  }
}
// 重新挂载时
onMounted(setUserAnswer);
// 发生变更时
watch(() => props.userAnswer, setUserAnswer);

const submitAnswer = () => {
  emit('answer', sortedOptions.value.map(i => props.question.options[i]));
};

// 有用户选项时填充
if (props.userAnswer) {
  const map = {} as Record<string, number>;
  props.question.options.forEach((item, index) => {
    map[item] = index;
  });
  props.userAnswer.forEach((item, index) => {
    sortedOptions.value.push(map[item]);
    indexSelectIndex.value[map[item]] = index + 1;
  });
}

// 点击时触发排序
const sort = (index: number) => {
  // 是否已经排序？
  if (indexSelectIndex.value[index]) {
    // 删除用户选中
    sortedOptions.value = sortedOptions.value.filter(item => item !== index);
    // 重新排序答案
    indexSelectIndex.value[index] = '';
    sortedOptions.value.forEach((item, index) => {
      indexSelectIndex.value[item] = index + 1;
    });
  } else {
    sortedOptions.value.push(index);
    indexSelectIndex.value[index] = sortedOptions.value.length;
  }
  // 提交新答案
  submitAnswer();
}

const getIcon = (option: string) => {
  if (props.isSubmit) {
    // 是正确选项，用户选了
    if (props.question.answer.indexOf(option) >= 0) {
      return props.question.answer.indexOf(option) === props.userAnswer?.indexOf(option) ? 'success' : 'error';
    }
    // 用户选了但不是正确选项
    else if (props.userAnswer && props.userAnswer.indexOf(option) >= 0) {
      return 'error';
    }
  }

  return undefined;
};
</script>

<template>
  <div>
    <div v-for="(option, index) in props.question.options" :key="index" style="margin-top: 5px;">
      <el-badge :value="indexSelectIndex[+index]" class="item"
        :color="getIcon(option) === 'error' ? '#f56c6c' : '#67c23a'">
        <div class="option">
          <el-button @click="sort(+index)" :disabled="isSubmit">
            <span>{{ getOptionsPrefixByIndex(index) + option }} </span>
          </el-button>
        </div>
      </el-badge>

      <!-- <el-result v-if="getIcon(option)" :icon="getIcon(option)" /> -->
      <el-badge v-if="getIcon(option) === 'error' && question.answer.indexOf(option) >= 0"
        :value="question.answer.indexOf(option) + 1" class="item" color="#67c23a">
        <span style="color: red;margin-left: 10px;">正确顺序：</span>
      </el-badge>
    </div>
  </div>
</template>
