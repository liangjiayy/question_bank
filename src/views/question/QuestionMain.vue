<script setup lang="ts">
import QuestionPage from '@/components/question/QuestionPage.vue';
import type { Question } from '../../types/question';
import { ref } from 'vue';
import { list } from '@/utils/question';
import { ElMessage, ElMessageBox } from 'element-plus';
import { shuffle } from '@/utils/array';
import { onBeforeRouteLeave } from 'vue-router';

const questions = ref([] as Question[]);

// 题库下拉框
// 对话框相关逻辑
const dialogVisible = ref(false);
const questionBankSelectForm = ref({
  // 题库名称
  name: '',
  // 是否打乱顺序
  isRandom: false
});
// 打开保存对话框
const openSaveDialog = () => {
  dialogVisible.value = true;
  questionBankSelectForm.value.name = ''; // 重置输入框
};

openSaveDialog();

// 关闭对话框前的处理
const handleClose = (done: () => void) => {
  done();
};

// 获取所有题库
const questionBankOptions = ref([] as string[]);
const getAllQuestionBank = () => {
  const all = list();
  if (all) {
    questionBankOptions.value = Object.keys(all);
  }
};
getAllQuestionBank();

// 题库下拉框选项
// 确认选择
const confirmSelect = () => {
  const all = list();
  const value = all[questionBankSelectForm.value.name];
  if (all && value) {
    // 是否打乱顺序
    if (questionBankSelectForm.value.isRandom) {
      shuffle(value);
    }
    questions.value = value;
    dialogVisible.value = false;
  } else {
    // 题库不存在
    ElMessage.error("题库不存在，请重新选择！");
    getAllQuestionBank();
  }
};

// 页面路由发生切换时，提示用户是否保存进度？
// 导航守卫：离开当前路由前触发
onBeforeRouteLeave((to, from, next) => {
  ElMessageBox.confirm('数据尚未保存，确定要离开吗？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => {
      next(); // 用户点击“确定”，继续路由切换
    })
    .catch(() => {
      next(false); // 用户点击“取消”，阻止路由切换
    });
});
</script>

<template>
  <QuestionPage v-if="questions.length > 0" :questions="questions" class="quesstioin-page" :show-search-tools="true" />
  <!-- 显示未选择题库的默认消息 -->
  <div v-else class="default-message">
    <p>请选择题库!</p>
    <el-button @click="openSaveDialog">选择</el-button>
  </div>
  <!-- 题库下拉框 -->
  <el-dialog title="选择题库" v-model="dialogVisible" width="30%" :before-close="handleClose">
    <el-form :model="questionBankSelectForm">
      <el-form-item label="名称" prop="name">
        <!-- <el-input v-model="questionBankSelectForm.name" placeholder="请输入保存名称"></el-input> -->
        <!-- 下拉框 -->
        <el-select v-model="questionBankSelectForm.name" placeholder="请选择题库">
          <el-option v-for="item in questionBankOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <!-- 是否打乱顺序 -->
      <el-form-item label="是否打乱顺序" prop="isRandom">
        <el-switch v-model="questionBankSelectForm.isRandom"></el-switch>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelect">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
