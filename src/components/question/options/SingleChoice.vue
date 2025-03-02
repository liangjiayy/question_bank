<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { SingleChoiceQuestion } from '../../../types/question';
import { getOptionsPrefixByIndex } from '@/utils/question';

const props = defineProps<{
  question: SingleChoiceQuestion,
  userAnswer: string | undefined,
  isSubmit: boolean
}>();

const selected = ref<string>();

function setUserAnswer() {
  // 有用户选项时填充
  if (props.userAnswer) {
    selected.value = props.userAnswer;
  } else {
    selected.value = undefined;
  }
}
// 重新挂载时
onMounted(setUserAnswer);
// 发生变更时
watch(() => props.userAnswer, setUserAnswer);

const emit = defineEmits(['answer']);

const submitAnswer = () => {
  emit('answer', selected.value);
};

const getIcon = (option: string) => {
  if (props.isSubmit) {
    // 是正确选项，用户选了
    if (option === props.question.answer) {
      return props.userAnswer && option === props.userAnswer ? 'success' : 'error';
    }
    // 用户选了但不是正确选项
    if (props.userAnswer && option === props.userAnswer) {
      return 'error';
    }
  }

  return undefined;
};
</script>

<template>
  <el-radio-group v-model="selected" :onchange="submitAnswer">
    <div v-for="(option, index) in question.options" :key="option">
      <div class="option" :class="props.isSubmit && props.question.answer === option ? 'option-success' : ''">
        <el-radio :value="option" :disabled="isSubmit"> {{ getOptionsPrefixByIndex(index) + option }} </el-radio>
      </div>

      <el-result v-if="getIcon(option)" :icon="getIcon(option)" />
    </div>
  </el-radio-group>
</template>
