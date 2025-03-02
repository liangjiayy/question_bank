// 数组打乱顺序的方法
export const shuffle = <T>(arr: T[]) => {
  let i = arr.length;
  while (i) {
    const j = Math.floor(Math.random() * i--);
    [arr[j], arr[i]] = [arr[i], arr[j]];
  }
  return arr;
};
