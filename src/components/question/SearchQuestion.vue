<script setup lang="ts">
import { computed } from 'vue';
import type { Question, SubQuestion } from '@/types/question';
import QuestionPage from './QuestionPage.vue';

// 定义 props
const props = defineProps<{
  questions: Question[];           // 题目数据
  searchContent: string;           // 搜索内容
  searchField?: 'title' | 'options' | 'all'; // 搜索位置
  useRegex: boolean;               // 是否启用正则
}>();

// 搜索结果
const searchResults = computed(() => {
  if (!props.searchContent) return []; // 如果搜索内容为空，则不进行搜索

  const searchFn = props.useRegex
    ? (text: string) => {
      try {
        const regex = new RegExp(props.searchContent, 'i'); // 'i' 表示忽略大小写
        return regex.test(text);
      } catch (e) {
        console.error('Invalid regular expression:', e);
        return text.includes(props.searchContent); // 正则错误时回退到普通匹配
      }
    }
    : (text: string) => text.toLowerCase().includes(props.searchContent.toLowerCase());

  return props.questions.filter((question) => {
    // 搜索标题
    const searchTitle = () => {
      return searchFn(question.title) || (question.type === "hasSubQuestion" && (question.options as SubQuestion[])?.some(sub => searchFn(sub.title)));
    }
    // 搜索选项
    const searchOptions = () => {
      return question.options?.some((option) => {
        if (question.type !== "hasSubQuestion") {
          option = option as string;
          return searchFn(option);
        } else {
          option = option as SubQuestion;
          return option.options?.some((subOption) => searchFn(subOption));
        }
      });
    }
    if (props.searchField === 'title') {
      // 标题或子标题中有匹配的内容
      return searchTitle();
    } else if (props.searchField === 'options') {
      return searchOptions();
    } else {
      return searchTitle() || searchOptions();
    }
  });
});
</script>

<template>
  <div class="search-page">
    <h2>搜索结果</h2>
    <div v-if="searchResults.length > 0">
      <QuestionPage :questions="searchResults" />
    </div>
    <p v-if="searchResults.length === 0">未找到匹配的结果</p>
  </div>
</template>

<style scoped></style>
