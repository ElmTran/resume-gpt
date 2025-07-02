<!-- src/views/HomePage.vue -->
<script setup lang="ts">
import { ref } from "vue";
import UploadPanel from "../components/UploadPanel.vue";
import ResultDisplay from "../components/ResultDisplay.vue";
import {
  createGeminiService,
  type ResumeOptimizationResult,
  type ResumeTemplateResult,
} from "../lib/gemini";
import { getApiKey, validateApiKey } from "../lib/config";

// 响应式状态
const isProcessing = ref(false);
const optimizationResult = ref<ResumeOptimizationResult | null>(null);
const templateResult = ref<ResumeTemplateResult | null>(null);
const errorMessage = ref<string>("");
const displayMode = ref<"optimize" | "template">("optimize");
const currentFile = ref<File | string | null>(null);

// 处理文件上传后的AI优化流程
const handleFileUploaded = async (file: File | string) => {
  console.log("文件或文本已处理:", file);

  // 保存当前文件引用
  currentFile.value = file;

  // 清空之前的结果
  optimizationResult.value = null;
  templateResult.value = null;
  errorMessage.value = "";
  displayMode.value = "optimize";

  // 检查 API Key 配置
  if (!validateApiKey()) {
    errorMessage.value =
      "Gemini API Key 未配置，请在 .env 文件中设置 VITE_GEMINI_API_KEY";
    return;
  }

  try {
    isProcessing.value = true;

    // 创建 Gemini 服务并优化简历
    const geminiService = createGeminiService(getApiKey());
    const result = await geminiService.optimizeResume(file);

    if (result.success) {
      optimizationResult.value = result;
      console.log("简历优化成功:", result);
    } else {
      errorMessage.value = result.error || "优化失败";
    }
  } catch (error) {
    console.error("处理过程中出错:", error);
    errorMessage.value = error instanceof Error ? error.message : "未知错误";
  } finally {
    isProcessing.value = false;
  }
};

// 生成简历模板
const handleGenerateTemplate = async () => {
  if (!currentFile.value) {
    errorMessage.value = "请先上传简历文件";
    return;
  }

  // 检查 API Key 配置
  if (!validateApiKey()) {
    errorMessage.value =
      "Gemini API Key 未配置，请在 .env 文件中设置 VITE_GEMINI_API_KEY";
    return;
  }

  try {
    isProcessing.value = true;
    errorMessage.value = "";
    displayMode.value = "template";

    // 创建 Gemini 服务并生成模板
    const geminiService = createGeminiService(getApiKey());
    const result = await geminiService.generateResumeTemplate(
      currentFile.value,
    );

    if (result.success) {
      templateResult.value = result;
      console.log("简历模板生成成功:", result);
    } else {
      errorMessage.value = result.error || "模板生成失败";
      displayMode.value = "optimize"; // 失败时回到优化模式
    }
  } catch (error) {
    console.error("模板生成过程中出错:", error);
    errorMessage.value = error instanceof Error ? error.message : "未知错误";
    displayMode.value = "optimize"; // 失败时回到优化模式
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen relative overflow-hidden flex flex-col">
    <!-- 更淡的渐变背景 -->
    <div
      class="fixed inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50"
    ></div>

    <!-- 动态背景装饰 - 调整透明度 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float-slow"
      ></div>
      <div
        class="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-200/15 rounded-full blur-3xl animate-float-reverse"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/10 rounded-full blur-2xl animate-pulse-slow"
      ></div>
    </div>

    <!-- 磨砂玻璃容器 -->
    <div class="relative z-10 flex-1 backdrop-blur-sm flex flex-col">
      <!-- 主要内容区域 - 调整布局和间距 -->
      <div class="flex-1 max-w-full mx-auto px-4 py-12 flex flex-col">
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          <!-- 左侧上传面板 - 减少宽度 -->
          <div class="lg:col-span-3 flex flex-col min-h-0">
            <div class="flex-1 glass-panel flex flex-col">
              <UploadPanel
                :is-processing="isProcessing"
                @file-uploaded="handleFileUploaded"
              />
            </div>
          </div>

          <!-- 右侧结果展示 - 增加宽度 -->
          <div class="lg:col-span-9 flex flex-col min-h-0">
            <div class="flex-1 glass-panel flex flex-col">
              <ResultDisplay
                :result="optimizationResult"
                :template-result="templateResult"
                :is-processing="isProcessing"
                :error="errorMessage"
                :mode="displayMode"
                @generate-template="handleGenerateTemplate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 磨砂玻璃面板样式 - 调整透明度 */
.glass-panel {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  min-height: 0;
}

.glass-panel:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* 动画效果 */
@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes float-reverse {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(20px) rotate(-180deg);
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-reverse {
  animation: float-reverse 10s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .h-\[calc\(100vh-10rem\)\] {
    height: auto;
    min-height: calc(100vh - 10rem);
  }
}
</style>
