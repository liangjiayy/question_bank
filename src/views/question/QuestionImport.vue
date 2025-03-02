<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import type { Answer, Question, QuestionType, SubQuestion } from '@/types/question';
import QuestionPage from '@/components/question/QuestionPage.vue';
import { defaultImportText, get, save, type QuestionsEntity } from '@/utils/question';
import { useRouter } from 'vue-router';

// 输入内容的响应式引用
const inputContent = ref(defaultImportText);
// 解析内容的计算属性（当前无特殊解析逻辑，直接使用输入内容）
const parsedContent = computed(() => parseQuestion(inputContent.value));

// 文件上传前的处理函数
const beforeUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    // 将文件内容设置为 inputContent
    inputContent.value = e.target?.result as string;
  };
  reader.readAsText(file);
  return false; // 阻止默认上传行为
};

// 对话框相关逻辑
const dialogVisible = ref(false);
const questionSaveForm = ref({
  name: '',
});
const questionSaveFormRef = ref<FormInstance | null>(null); // 用于表单校验
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在 1 到 50 个字符', trigger: 'blur' },
  ],
};

// 打开保存对话框
const openSaveDialog = () => {
  dialogVisible.value = true;
  questionSaveForm.value.name = ''; // 重置输入框
};

// 关闭对话框前的处理
const handleClose = (done: () => void) => {
  questionSaveFormRef.value?.resetFields();
  done();
};

// 确认保存
const confirmSave = () => {
  questionSaveFormRef.value?.validate((valid) => {
    if (valid) {
      saveContent();
    }
  });
};

// 保存内容到 localStorage
const saveContent = () => {
  const name = questionSaveForm.value.name;
  if (name) {
    const toSave = (questions: QuestionsEntity) => {
      save(questions);
      ElMessage.success('内容保存成功');
      // 关闭form
      dialogVisible.value = false;
    }

    const questions = get(name);
    // 检查本地存储中是否存在该名称？
    if (questions) {
      ElMessageBox.confirm(
        `名称【${name}】已存在，是否覆盖？`,
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
      )
        .then(() => {
          toSave({ name, questions: parsedContent.value });
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: '取消保存！',
          });
        });

    } else {
      toSave({ name, questions: parsedContent.value });
    }
  }
};

function parseQuestion(str: string): Question[] {
  str = str.trim();
  // ---------- 1. 解析文本，拆分成一道一道的题 ----------
  // 通用正确选项示例：
  // "vA. "
  // "vA) "
  // "v1A. "
  // "v1A) "
  // "vv "
  // "vx "
  const optionRegs = {
    // 选择、排序
    select: /^[vV]?(\d)?\s?[A-Z][\.\)]\s(.*)/,
    // 正确选项(必须以V开头)
    correctSelect: /^[vV](\d)?\s?[A-Z][\.\)]\s(.*)/,
    // 判断
    truefalse: /^v[vx]\s*/i,
    // 判断题是正确的
    correctTruefalse: /^vv\s*/i,
  };

  // 子选项的答案。支持上面列出的所有类型，外加下面三种（去掉选项前的ABCD）
  // "x. "
  // "v "
  // "v1 "
  const subOptionRegs = {
    // 子问题起始行需要满足的条件
    startLine: /^x.\s.*/i,
    // 选择、排序(支持去掉选项前的ABCD)
    select: /^[vV]?(\d)?\s?(?![A-Z][\.\)])?\s?(.*)/,
    // 正确选项(必须以V开头)
    correctSelect: /^[vV](\d)?\s?(?![A-Z][\.\)])?\s?(.*)/,
    // 判断
    truefalse: optionRegs.truefalse,
    correctTruefalse: optionRegs.correctTruefalse,
  };

  const getDefaultStrQuestion = (): { type: QuestionType, title: string[], options: string[] } => {
    return {
      // 总是认为是多选。后续步骤改类型。
      type: 'multiple',
      title: [],
      options: []
    }
  }

  const strQuestions = [];
  let currStrQuestion = getDefaultStrQuestion();
  const sps = str.split("\n");
  for (let i = 0; i < sps.length; i++) {
    const sp = sps[i];
    // 是否为小题
    if (subOptionRegs.startLine.test(sp)) {
      currStrQuestion.type = "hasSubQuestion";
      currStrQuestion.options.push(sp);
      // 将小题遍历完
      for (i++; i < sps.length; i++) {
        const s = sps[i];
        if (!s.trim()) {
          break;
        }
        currStrQuestion.options.push(s);
      }
      // 多余的空行
      for (; i < sps.length && !sps[i].trim(); i++) { }
      i--;
    }
    else if (optionRegs.truefalse.test(sp)) {
      currStrQuestion.type = "truefalse";
      currStrQuestion.options.push(sp);
    }
    // 是否为选项
    else if (optionRegs.select.test(sp)) {
      currStrQuestion.options.push(sp);
      // 解析出剩下的选项
      for (i++; i < sps.length; i++) {
        const s = sps[i];
        // 空行跳过
        if (!s.trim()) {
          continue;
        }
        // 判断是否为选项
        if (!optionRegs.select.test(s)) {
          break;
        }
        currStrQuestion.options.push(s);
      }
      i--;
    }
    // 是题目
    else {
      // 如果有选项，则认为是一道新题
      if (currStrQuestion.options.length > 0) {
        strQuestions.push(currStrQuestion);
        currStrQuestion = getDefaultStrQuestion();
        currStrQuestion.title.push(sp);
      } else {
        currStrQuestion.title.push(sp);
      }
    }
  }
  // 最后一次的题通常没有加入
  strQuestions.push(currStrQuestion);

  // ---------- 2. 解析成Question ----------
  const msgList = [] as string[];
  const parseOptions = (opts: string[]): ({ type: QuestionType, options?: string[], answer: Answer }) => {
    opts = opts.filter(item => item.trim());
    // 判断？
    if (opts.length === 1 && (optionRegs.truefalse.test(opts[0]) || subOptionRegs.truefalse.test(opts[0]))) {
      return {
        type: "truefalse",
        answer: optionRegs.correctTruefalse.test(opts[0]) || subOptionRegs.correctTruefalse.test(opts[0])
      }
    }
    // 其它题型
    const optsRes = [] as string[];
    let ansRes = [] as string[];
    let type = "multiple" as QuestionType;
    opts.forEach(item => {
      const r = optionRegs.select.exec(item) || subOptionRegs.select.exec(item);
      if (!r) {
        throw Error(`选项不符合要求：${item}`);
      }
      const no = r[1];
      const value = r[2];
      if (no && no.length) {
        // 是排序题
        type = "sorting"
      }
      optsRes.push(value);
      if (optionRegs.correctSelect.test(item) || subOptionRegs.correctSelect.test(item)) {
        if (type === "sorting") {
          // 排序题
          ansRes[+no] = value;
        } else {
          ansRes.push(value);
        }
      }
    });
    // 如果是排序题，清空无用的选项
    ansRes = ansRes.filter(item => item);
    // 如果选项只有一个，设置为单选题
    if (ansRes.length === 1) {
      type = "single";
    }
    return {
      type, options: optsRes, answer: type === "single" ? ansRes[0] : ansRes
    }
  }

  // 解析出的问题
  const questions = [] as Question[];
  // 第三个参数，当且仅当有小题时指定。表示大标题是什么。
  const addQuestion = (title: string, options: string[], bigTitle?: string) => {
    try {
      const q = parseOptions(options);

      if (bigTitle) {
        title = title.replace(/^x.\s*/i, "");
        // questions中是否存在该标题？
        if (questions.length && questions[questions.length - 1].title === bigTitle) {
          (questions[questions.length - 1].options as SubQuestion[]).push({ ...q, title } as SubQuestion);
        } else {
          questions.push({ title: bigTitle, type: "hasSubQuestion", options: [{ ...q, title } as SubQuestion] });
        }
      } else {
        questions.push({ ...q, title });
      }
    } catch (error) {
      // 解析error
      console.log(error);
      if (error instanceof Error) {
        error = error.message;
      }
      // 添加到msgList中
      msgList.push(`title: ${title}\noptions: ${options.join("\n")}\n错误：${error}`);
    }

  };

  strQuestions.forEach(item => {
    // 是否含有子标题?
    if (item.type === 'hasSubQuestion') {
      // 大标题
      const title = item.title.join("\n");
      // 解析出每个部分，然后解析选项。
      for (let i = 0; i < item.options.length;) {
        const op = item.options[i];
        if (subOptionRegs.startLine.test(op) || optionRegs.select.test(op)) {
          // 是子标题
          const start = i + 1;
          // 解析选项
          for (i++; i < item.options.length && !subOptionRegs.startLine.test(item.options[i]); i++) { }
          addQuestion(op, item.options.slice(start, i), title);
        } else {
          // 解析子选项忽略的行：
          msgList.push(`忽略的行：${op}`);
          i++;
        }
      }
    } else {
      addQuestion(item.title.join("\n"), item.options);
    }
  });

  console.log("error:", msgList);
  console.log("questions:", questions);
  return questions;
}

// 跳转到说明页
const router = useRouter()
const goToAbout = () => {
  router.push('/about')
}
</script>

<template>
  <div class="main">
    <div class="row">
      <div class="input">
        <el-button type="primary" @click="goToAbout" style="align-self: start;margin-bottom: 5px;">查看文档</el-button>

        <el-input class="input-textarea" type="textarea" v-model="inputContent" placeholder="请输入文本或上传文件"
          :rows="10"></el-input>
        <el-upload action="#" :show-file-list="false" :before-upload="beforeUpload">
          <el-button size="small" type="primary">上传文件</el-button>
        </el-upload>
      </div>
      <div>
        <QuestionPage :questions="parsedContent" class="quesstioin-page" />
      </div>
    </div>
    <el-button class="sava-btn" type="primary" @click="openSaveDialog">保存</el-button>
  </div>

  <!-- 保存名称的对话框 -->
  <el-dialog title="保存内容" v-model="dialogVisible" width="30%" :before-close="handleClose">
    <el-form :model="questionSaveForm" ref="questionSaveFormRef" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="questionSaveForm.name" placeholder="请输入保存名称"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSave">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  height: 100%;

  .row {
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 10px;

    &>div {
      flex: 1 1 0;

      &.input {
        display: flex;
        flex-direction: column;

        .input-textarea {
          flex: 1 1 0;

          /* textarea */
          &>* {
            height: 100%;
          }
        }
      }
    }
  }

  .sava-btn {
    width: 100px;
    align-self: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
