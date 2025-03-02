<script setup lang="ts">
import { onMounted, ref, toRaw, watch } from 'vue';
import type { MultipleChoiceQuestion } from '../../../types/question';
import { getOptionsPrefixByIndex } from '@/utils/question';

const props = defineProps<{
  question: MultipleChoiceQuestion,
  userAnswer: string[] | undefined,
  isSubmit: boolean
}>();

const selected = ref<string[]>([]);

function setUserAnswer() {
  // 有用户选项时填充
  if (props.userAnswer) {
    selected.value = props.userAnswer;
  } else {
    selected.value = [];
  }
}
// 重新挂载时
onMounted(setUserAnswer);
// 发生变更时
watch(() => props.userAnswer, setUserAnswer);


const emit = defineEmits(['answer']);

const submitAnswer = () => {
  emit('answer', toRaw(selected.value));
};

const getIcon = (option: string) => {
  if (props.isSubmit) {
    // 是正确选项，用户选了
    if (props.question.answer.indexOf(option) >= 0) {
      return props.userAnswer && props.userAnswer.indexOf(option) >= 0 ? 'success' : "error";
    }
    // 用户选了但不是正确选项
    if (props.userAnswer && props.userAnswer.indexOf(option) >= 0) {
      return 'error';
    }
  }

  return undefined;
};
</script>

<template>
  <el-checkbox-group v-model="selected" :onchange="submitAnswer">
    <div v-for="(option, index) in question.options" :key="option">
      <div class="option" :class="props.isSubmit && props.question.answer.indexOf(option) >= 0 ? 'option-success' : ''">
        <el-checkbox :value="option" :disabled="isSubmit">{{ getOptionsPrefixByIndex(index) + option }} </el-checkbox>
      </div>

      <el-result v-if="getIcon(option)" :icon="getIcon(option)" />
    </div>
  </el-checkbox-group>
</template>
