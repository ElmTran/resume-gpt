<script setup lang="ts">
import { computed, ref } from "vue";
import { marked } from "marked";
import type {
  ResumeOptimizationResult,
  ResumeTemplateResult,
} from "../lib/gemini";
import { exportResumeToPDF } from "../lib/pdfExport";

interface Props {
  result: ResumeOptimizationResult | null;
  templateResult: ResumeTemplateResult | null;
  isProcessing: boolean;
  error: string;
  mode: "optimize" | "template";
}

const props = defineProps<Props>();
const emit = defineEmits<{
  generateTemplate: [];
  exportPDF: [];
}>();

// 响应式状态
const isExportingPDF = ref(false);
const exportError = ref<string>("");

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 渲染 markdown 内容
const renderedContent = computed(() => {
  const content =
    props.mode === "template"
      ? props.templateResult?.templateContent
      : props.result?.optimizedContent;

  if (!content) return "";
  return marked(content);
});

// 获取当前内容
const currentContent = computed(() => {
  return props.mode === "template"
    ? props.templateResult?.templateContent
    : props.result?.optimizedContent;
});

// 复制建议到剪贴板
const copyToClipboard = async () => {
  if (!currentContent.value) return;

  try {
    await navigator.clipboard.writeText(currentContent.value);
    console.log("复制成功");
  } catch (err) {
    console.error("复制失败:", err);
  }
};

// 导出为文本文件
const exportReport = () => {
  if (!currentContent.value) return;

  const content = currentContent.value;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const filename =
    props.mode === "template" ? "resume-template" : "resume-optimization";
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 生成简历模板
const handleGenerateTemplate = () => {
  emit("generateTemplate");
};

// 导出PDF
const handleExportPDF = async () => {
  if (!currentContent.value) return;

  try {
    isExportingPDF.value = true;
    exportError.value = "";

    const filename = `resume-${new Date().toISOString().split("T")[0]}`;
    await exportResumeToPDF(currentContent.value, filename);

    console.log("PDF导出成功");
  } catch (error) {
    console.error("PDF导出失败:", error);
    exportError.value = error instanceof Error ? error.message : "PDF导出失败";
  } finally {
    isExportingPDF.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 头部区域 -->
    <div class="flex-shrink-0 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-100/60 to-purple-100/60 backdrop-blur-xl rounded-xl flex items-center justify-center border border-gray-200/50 shadow-sm"
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-700">
              {{ mode === "template" ? "简历模板" : "AI 优化建议" }}
            </h2>
            <p class="text-gray-500 text-sm">
              {{
                mode === "template"
                  ? "标准格式 · 一键导出"
                  : "智能分析 · 专业建议"
              }}
            </p>
          </div>
        </div>

        <!-- 模式切换按钮 -->
        <div v-if="result?.success && !isProcessing" class="flex space-x-2">
          <button
            v-if="mode === 'optimize'"
            @click="handleGenerateTemplate"
            class="px-4 py-2 bg-gradient-to-r from-green-100/60 to-emerald-100/60 hover:from-green-200/60 hover:to-emerald-200/60 border border-green-200/60 hover:border-green-300/60 text-green-700 font-medium rounded-lg transition-all duration-200 text-sm"
          >
            生成模板
          </button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 px-4 pb-4 min-h-0">
      <!-- 处理中状态 -->
      <div v-if="isProcessing" class="h-full flex items-center justify-center">
        <div class="text-center">
          <div class="processing-container mb-6">
            <div class="processing-circle">
              <div class="processing-dot"></div>
              <div class="processing-dot"></div>
              <div class="processing-dot"></div>
            </div>
          </div>
          <h3 class="text-xl font-bold text-gray-700 mb-2">
            {{
              mode === "template"
                ? "AI 正在生成简历模板"
                : "AI 正在分析您的简历"
            }}
          </h3>
          <p class="text-gray-500 text-base mb-4">
            {{
              mode === "template"
                ? "格式化简历内容中"
                : "深度解析简历结构与内容"
            }}
          </p>
          <div class="flex items-center justify-center space-x-2 text-gray-400">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 0.1s"
            ></div>
            <div
              class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style="animation-delay: 0.2s"
            ></div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="h-full flex items-center justify-center">
        <div class="text-center max-w-md">
          <div class="error-container mb-6">
            <div
              class="w-16 h-16 bg-red-100/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-red-200/60 shadow-sm"
            >
              <svg
                class="w-8 h-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-bold text-red-600 mb-3">处理失败</h3>
          <p class="text-red-500/80 leading-relaxed">{{ error }}</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!result && !templateResult"
        class="h-full flex items-center justify-center"
      >
        <div class="text-center max-w-lg">
          <div class="empty-container mb-6 flex justify-center">
            <div
              class="w-16 h-16 bg-gray-100/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-gray-200/60 shadow-sm"
            >
              <svg
                class="w-8 h-8 text-gray-400"
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
          </div>
          <h3 class="text-xl font-bold text-gray-600 mb-3">等待简历上传</h3>
          <p class="text-gray-500 leading-relaxed">
            上传您的简历文件或选择示例简历，AI
            将为您提供专业的优化建议和改进方案
          </p>
        </div>
      </div>

      <!-- 成功状态 -->
      <div
        v-else-if="
          (result?.success && mode === 'optimize') ||
          (templateResult?.success && mode === 'template')
        "
        class="h-full flex flex-col"
      >
        <div class="content-container flex-1 overflow-y-auto">
          <div class="markdown-content" v-html="renderedContent"></div>
        </div>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div
      v-if="
        (result?.success && mode === 'optimize') ||
        (templateResult?.success && mode === 'template')
      "
      class="flex-shrink-0 p-4"
    >
      <!-- PDF导出错误提示 -->
      <div
        v-if="exportError"
        class="mb-3 p-3 bg-red-50/80 border border-red-200 rounded-lg"
      >
        <p class="text-red-600 text-sm">{{ exportError }}</p>
      </div>

      <div class="flex space-x-3">
        <button
          @click="copyToClipboard"
          class="action-button flex-1 bg-gradient-to-r from-blue-100/60 to-cyan-100/60 hover:from-blue-200/60 hover:to-cyan-200/60 border border-blue-200/60 hover:border-blue-300/60"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          复制内容
        </button>

        <button
          @click="exportReport"
          class="action-button flex-1 bg-gradient-to-r from-purple-100/60 to-pink-100/60 hover:from-purple-200/60 hover:to-pink-200/60 border border-purple-200/60 hover:border-purple-300/60"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          导出文档
        </button>

        <!-- PDF导出按钮 - 仅在模板模式下显示 -->
        <button
          v-if="mode === 'template'"
          @click="handleExportPDF"
          :disabled="isExportingPDF"
          class="action-button flex-1 bg-gradient-to-r from-green-100/60 to-emerald-100/60 hover:from-green-200/60 hover:to-emerald-200/60 border border-green-200/60 hover:border-green-300/60 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="!isExportingPDF"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <div
            v-else
            class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          ></div>
          {{ isExportingPDF ? "导出中..." : "导出PDF" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 处理中动画 */
.processing-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.processing-circle {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  border-radius: 50%;
  border: 2px solid rgba(156, 163, 175, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  animation: rotate 2s linear infinite;
}

.processing-dot {
  width: 6px;
  height: 6px;
  background: rgba(107, 114, 128, 0.8);
  border-radius: 50%;
  position: absolute;
  animation: pulse 1.5s ease-in-out infinite;
}

.processing-dot:nth-child(1) {
  top: 8px;
  animation-delay: 0s;
}

.processing-dot:nth-child(2) {
  right: 8px;
  animation-delay: 0.5s;
}

.processing-dot:nth-child(3) {
  bottom: 8px;
  animation-delay: 1s;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 内容容器 - 修复滚动 */
.content-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  min-height: 0; /* 关键：允许flex子元素收缩 */
}

/* 操作按钮 */
.action-button {
  backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  color: rgb(55, 65, 81);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  font-size: 0.875rem;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.action-button svg {
  margin-right: 0.5rem;
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(156, 163, 175, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Markdown 内容样式 - 深色文字适配白色背景 */
.markdown-content {
  color: #1f2937 !important;
  line-height: 1.7;
  font-size: 16px;
}

.markdown-content h1 {
  color: #111827 !important;
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  margin-bottom: 1.25rem !important;
  margin-top: 2rem !important;
  padding-bottom: 0.5rem !important;
  border-bottom: 2px solid #6b7280 !important;
}

.markdown-content h2 {
  color: #111827 !important;
  font-size: 1.375rem !important;
  font-weight: 600 !important;
  margin-bottom: 1rem !important;
  margin-top: 1.75rem !important;
  position: relative;
}

.markdown-content h2::before {
  content: "";
  position: absolute;
  left: -1rem;
  top: 0.5rem;
  width: 4px;
  height: 1.25rem;
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 2px;
}

.markdown-content h3 {
  color: #111827 !important;
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  margin-bottom: 0.75rem !important;
  margin-top: 1.25rem !important;
}

.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  color: #111827 !important;
  font-weight: 600 !important;
  margin-bottom: 0.5rem !important;
  margin-top: 1rem !important;
}

.markdown-content p {
  margin-bottom: 1rem !important;
  color: #374151 !important;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 1.25rem !important;
  padding-left: 1.75rem !important;
}

.markdown-content li {
  margin-bottom: 0.5rem !important;
  color: #374151 !important;
}

.markdown-content ul li::marker {
  color: #3b82f6 !important;
}

.markdown-content ol li::marker {
  color: #3b82f6 !important;
}

.markdown-content strong,
.markdown-content b {
  color: #111827 !important;
  font-weight: 600 !important;
}

.markdown-content em,
.markdown-content i {
  color: #1f2937 !important;
  font-style: italic !important;
}

.markdown-content blockquote {
  border-left: 4px solid #3b82f6 !important;
  padding-left: 1.25rem !important;
  margin: 1.25rem 0 !important;
  color: #374151 !important;
  background: #f3f4f6 !important;
  border-radius: 0.5rem !important;
  padding: 1.25rem !important;
}

.markdown-content code {
  background: #f3f4f6 !important;
  padding: 0.25rem 0.5rem !important;
  border-radius: 0.375rem !important;
  font-size: 0.875rem !important;
  color: #111827 !important;
  border: 1px solid #d1d5db !important;
  font-weight: 500 !important;
  font-family: "Courier New", Courier, monospace !important;
}

.markdown-content pre {
  background: #f9fafb !important;
  padding: 1.25rem !important;
  border-radius: 0.75rem !important;
  overflow-x: auto !important;
  margin: 1.25rem 0 !important;
  border: 1px solid #e5e7eb !important;
}

.markdown-content pre code {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  color: #1f2937 !important;
  font-weight: 400 !important;
}

.markdown-content a {
  color: #3b82f6 !important;
  text-decoration: underline !important;
}

.markdown-content a:hover {
  color: #1d4ed8 !important;
}

.markdown-content table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 1rem 0 !important;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #d1d5db !important;
  padding: 0.5rem !important;
  text-align: left !important;
  color: #374151 !important;
}

.markdown-content th {
  background: #f9fafb !important;
  font-weight: 600 !important;
  color: #111827 !important;
}
</style>
