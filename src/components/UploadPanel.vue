<script setup lang="ts">
import { ref } from "vue";
import FileInput from "./FileInput.vue";

interface Props {
  isProcessing: boolean;
}

interface Emits {
  (e: "file-uploaded", file: File | string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 处理文件上传
const handleFileProcessed = (file: File | string) => {
  emit("file-uploaded", file);
};

// 示例简历数据
const sampleResumes = [
  {
    title: "前端开发工程师",
    description: "包含 React、Vue.js 技术栈的简历示例",
    content: `# 张三 - 前端开发工程师

## 联系方式
- 邮箱: zhangsan@example.com
- 电话: 138-0000-0000
- GitHub: github.com/zhangsan

## 工作经验

### 前端开发工程师 | ABC科技公司 | 2022.06 - 至今
- 负责公司主要产品的前端开发工作
- 使用 React、Vue.js 开发响应式 Web 应用
- 参与项目架构设计，提升开发效率 30%

### 初级前端开发 | XYZ创业公司 | 2021.03 - 2022.05  
- 独立完成 3 个项目的前端开发
- 学习并应用现代前端技术栈
- 与后端团队协作，确保接口对接顺畅

## 技能
- **前端技术**: HTML5, CSS3, JavaScript, TypeScript
- **框架**: React, Vue.js, Angular
- **工具**: Webpack, Vite, Git
- **其他**: Node.js, 小程序开发`,
  },
  {
    title: "后端开发工程师",
    description: "包含 Java、Spring Boot 的简历示例",
    content: `# 李四 - 后端开发工程师

## 个人信息
- 姓名: 李四
- 邮箱: lisi@example.com  
- 电话: 139-0000-0000

## 工作经历

### 高级后端开发工程师 | 大型互联网公司 | 2020.08 - 至今
- 负责核心业务系统的后端开发和维护
- 使用 Java、Spring Boot 构建微服务架构
- 优化数据库查询，提升系统性能 50%
- 参与系统架构设计，支撑日活千万用户

### 后端开发工程师 | 中型科技公司 | 2019.03 - 2020.07
- 开发和维护公司主要产品的后端 API
- 参与数据库设计和优化
- 协助团队完成技术选型和架构升级

## 技术栈
- **编程语言**: Java, Python, Go
- **框架**: Spring Boot, MyBatis, Hibernate  
- **数据库**: MySQL, Redis, MongoDB
- **中间件**: RabbitMQ, Kafka, Elasticsearch
- **工具**: Docker, Kubernetes, Jenkins`,
  },
];

// 使用示例简历
const useSampleResume = (resume: (typeof sampleResumes)[0]) => {
  handleFileProcessed(resume.content);
};
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 头部区域 -->
    <div class="flex-shrink-0 p-4 text-center">
      <div
        class="inline-flex items-center justify-center w-10 h-10 bg-blue-100/60 backdrop-blur-xl rounded-xl mb-3 shadow-sm border border-gray-200/50"
      >
        <svg
          class="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <h2 class="text-lg font-bold text-gray-700 mb-1">上传简历</h2>
      <p class="text-gray-500 text-sm">支持 PDF、Word 或直接输入文本</p>
    </div>

    <!-- 上传区域 -->
    <div class="flex-1 px-4 overflow-y-auto">
      <FileInput
        @file-processed="handleFileProcessed"
        :disabled="isProcessing"
      />

      <!-- 示例简历区域 -->
      <div class="mt-6">
        <div class="flex items-center mb-4">
          <div
            class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/40 to-transparent"
          ></div>
          <span class="px-4 text-gray-500 text-sm font-medium">示例简历</span>
          <div
            class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/40 to-transparent"
          ></div>
        </div>

        <div class="space-y-3">
          <div
            v-for="(resume, index) in sampleResumes"
            :key="index"
            class="sample-card group cursor-pointer"
            @click="useSampleResume(resume)"
          >
            <div class="flex items-center space-x-3">
              <div
                class="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-100/60 to-purple-100/60 backdrop-blur-xl rounded-lg flex items-center justify-center border border-gray-200/50 group-hover:border-gray-300/60 transition-all duration-300"
              >
                <svg
                  class="w-4 h-4 text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h4
                  class="text-gray-700 font-medium group-hover:text-blue-600 transition-colors duration-300"
                >
                  {{ resume.title }}
                </h4>
                <p
                  class="text-gray-500 text-sm group-hover:text-gray-600 transition-colors duration-300"
                >
                  {{ resume.description }}
                </p>
              </div>
              <div class="flex-shrink-0">
                <svg
                  class="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="flex-shrink-0 p-4">
      <div class="glass-tip">
        <div class="flex items-start space-x-3">
          <div
            class="flex-shrink-0 w-7 h-7 bg-blue-100/60 backdrop-blur-xl rounded-lg flex items-center justify-center border border-blue-200/50"
          >
            <svg
              class="w-3 h-3 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-gray-600 text-sm leading-relaxed">
              AI
              将深度分析您的简历结构、内容质量和匹配度，提供个性化的优化建议和改进方案
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 示例卡片样式 */
.sample-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.875rem;
  transition: all 0.3s ease;
}

.sample-card:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

/* 玻璃提示框样式 */
.glass-tip {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.875rem;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.04);
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(156, 163, 175, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* 禁用状态样式 */
.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
