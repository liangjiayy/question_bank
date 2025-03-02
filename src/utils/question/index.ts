import type { Question } from "@/types/question";

const questionsSaveKey = "question-bank-questions-";

export interface QuestionsEntity {
  name: string;
  questions: Question[];
}

type QuestioneSaveEntity = Record<string, Question[]>;

export function save(entity: QuestionsEntity) {
  // 保存到本地存储
  const questions = list();
  questions[entity.name] = entity.questions;
  localStorage.setItem(questionsSaveKey, JSON.stringify(questions));
}

export function list(): QuestioneSaveEntity {
  const questions = localStorage.getItem(questionsSaveKey);
  if (questions) {
    return JSON.parse(questions);
  }
  return {};
}

export function get(name: string) {
  const questions = list();
  return questions && questions[name];
}

export function remove(name: string) {
  const questions = list();
  if (questions && questions[name]) {
    delete questions[name];
    localStorage.setItem(questionsSaveKey, JSON.stringify(questions));
  }
}

// 默认题库导入显示文本
export const defaultImportText = `下面是一分模版。你可以复制这份模版，然后根据自己的需求修改题目内容。
1. 单选题与多选题
单选题示例
下列哪座山是中国的五岳之一？
解释：题目是“下列哪座山是中国的五岳之一？”，选项A前有 "v"，表示泰山是正确答案。
v A. 泰山
B. 昆仑山
C. 长白山
D. 庐山

多选题示例
下列哪些动物属于哺乳动物？
解释：题目是“下列哪些动物属于哺乳动物？”，选项A和C前有 "v"，表示虎和鲸鱼是正确答案。
v A. 虎
B. 蟒蛇
v C. 鲸鱼
D. 乌龟

2. 判断题
判断题示例
解释：题目是“月球是地球的天然卫星。”，标记为 "vv"，表示该陈述正确。
示例1：月球是地球的天然卫星。
vv
示例2：地球是太阳系中最大的行星。
解释：题目是“地球是太阳系中最大的行星。”，标记为 "vx"，表示该陈述错误。
vx

3. 排序题
请将以下行星按离太阳的距离从近到远排序：
解释：题目是“请将以下行星按离太阳的距离从近到远排序：”，标记为 "v1"、"v2"、"v3"，表示正确顺序是水星 -> 地球 -> 火星。
v2 A. 地球
v1 B. 水星
v3 C. 火星

4. 包含多个小题的复合题目
请完成以下题目：
解释：
第一个小题：多选题，正确选项是法国和意大利。
第二个小题：判断题，标记为 "vv"，表示陈述正确。
第三个小题：排序题，正确顺序是轮子 -> 电灯 -> 互联网。
题目结束后有一个空行，表示与下一道题分隔。
x. 选出以下属于欧洲国家的选项：
v 法国
日本
v 意大利
巴西
x. 判断题：太平洋是世界上最大的海洋。
vv
x. 将以下发明按时间顺序排序：
v2 电灯
v1 轮子
v3 互联网
（复合题目后面必须有一空行，否则可能解析错误。）
`;

// 根据选项的索引获取选项的A、B、C、D
export const getOptionsPrefixByIndex = (index: number) => {
  index = index % 26;
  return String.fromCharCode(65 + index) + ". ";
};
