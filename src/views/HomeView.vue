<template>
  <el-container>
    <el-header>
      <h1>欢迎来到题库解析网站</h1>
    </el-header>
    <el-main>
      <p>本网站提供题库文本解析服务，支持单选、多选、判断、排序和复合题目。</p>
      <el-button type="primary" @click="goToAbout">了解更多</el-button>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()
    const goToAbout = () => {
      router.push('/about')
    }
    return { goToAbout }
  }
})
</script>

<style scoped>
.el-header {
  text-align: center;
  padding-top: 20px;
}

.el-main {
  text-align: center;
}
</style>
