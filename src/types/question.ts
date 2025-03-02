// answer
export type Answer = string | string[] | boolean;
export type QuestionType = "single" | "multiple" | "truefalse" | "sorting" | "hasSubQuestion";
// 一道题可能有多个小题，定义小题的options类型
export interface SubQuestion extends Question {
  options?: string[];
  answer: Answer;
}

export type QuestionOption = string[] | SubQuestion[];

export interface Question {
  id?: number;
  type: QuestionType;
  title: string;
  options?: QuestionOption; //判断题可以没有选项
  answer?: Answer; // 单选 string，多选为 string[]，判断boolean， 排序题顺序排列。如果包含小题，对应的问题和答案应该在options中
}

export interface SingleChoiceQuestion extends Question {
  type: "single";
  options: string[];
  answer: string;
}

export interface MultipleChoiceQuestion extends Question {
  type: "multiple";
  options: string[];
  answer: string[];
}

export interface TrueFalseQuestion extends Question {
  type: "truefalse";
  answer: boolean; // 'true' 或 'false'
}

export interface SortingQuestion extends Question {
  type: "sorting";
  options: string[];
  answer: string[];
}
