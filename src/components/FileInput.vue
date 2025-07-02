<!-- src/components/FileInput.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { CloudUpload, Type, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// 定义组件属性
interface Props {
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// 定义组件事件，用于向父组件传递处理后的文件或文本
const emit = defineEmits<{
  (e: "file-processed", payload: File | string): void;
}>();

const inputMode = ref<"file" | "text">("file"); // 默认是文件上传模式
const uploadedFile = ref<File | null>(null);
const resumeText = ref<string>("");
const fileInputRef = ref<HTMLInputElement | null>(null);

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    uploadedFile.value = target.files[0];
  }
};

// 处理文本输入
const handleTextInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  resumeText.value = target.value;
};

// 提交处理
const handleSubmit = () => {
  if (inputMode.value === "file" && uploadedFile.value) {
    emit("file-processed", uploadedFile.value);
  } else if (inputMode.value === "text" && resumeText.value.trim() !== "") {
    emit("file-processed", resumeText.value.trim());
  }
};

// 切换输入模式
const toggleInputMode = () => {
  inputMode.value = inputMode.value === "file" ? "text" : "file";
  if (inputMode.value === "file") {
    resumeText.value = "";
  } else {
    uploadedFile.value = null;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const isSubmitDisabled = () => {
  return (
    props.disabled ||
    (!(inputMode.value === "file" && uploadedFile.value) &&
      !(inputMode.value === "text" && resumeText.value.trim() !== ""))
  );
};
</script>

<template>
  <div class="space-y-5">
    <!-- 模式切换 -->
    <div class="flex justify-center">
      <div class="glass-toggle-container">
        <button
          @click="toggleInputMode"
          :disabled="props.disabled"
          class="glass-toggle-button group"
        >
          <div class="flex items-center space-x-2">
            <div class="toggle-icon-wrapper">
              <CloudUpload
                v-if="inputMode === 'text'"
                class="w-4 h-4 text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
              />
              <Type
                v-else
                class="w-4 h-4 text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
              />
            </div>
            <span
              class="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 font-medium"
            >
              {{ inputMode === "file" ? "切换到文本输入" : "切换到文件上传" }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div v-if="inputMode === 'file'" class="upload-area-container">
      <div
        @click="!props.disabled && triggerFileInput()"
        :class="[
          'upload-area',
          {
            'upload-area-disabled': props.disabled,
            'upload-area-active': uploadedFile,
            'upload-area-hover': !props.disabled && !uploadedFile,
          },
        ]"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          @change="handleFileChange"
          :disabled="props.disabled"
          class="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div class="upload-content">
          <div class="upload-icon-container">
            <div class="upload-icon-bg"></div>
            <CloudUpload
              :class="[
                'upload-icon',
                uploadedFile ? 'text-gray-700' : 'text-gray-500',
              ]"
            />
          </div>

          <div class="upload-text-container">
            <p class="upload-main-text">
              {{ uploadedFile ? uploadedFile.name : "拖拽文件至此或点击上传" }}
            </p>
            <p class="upload-sub-text">支持 PDF、Word 或文本文件</p>
          </div>

          <div v-if="uploadedFile" class="upload-success-indicator">
            <div class="success-checkmark">
              <svg
                class="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文本输入区域 -->
    <div v-else class="text-input-container">
      <div class="relative">
        <Textarea
          v-model="resumeText"
          placeholder="在此粘贴您的简历内容..."
          :rows="12"
          :disabled="props.disabled"
          class="text-input"
        />
        <div class="text-counter">{{ resumeText.length }} 字符</div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-container">
      <button
        @click="handleSubmit"
        :disabled="isSubmitDisabled()"
        class="submit-button group"
      >
        <div class="submit-button-content">
          <div class="submit-icon-wrapper">
            <Sparkles
              class="w-4 h-4 text-white group-hover:text-white transition-colors duration-300"
            />
          </div>
          <span class="submit-text">开始 AI 优化</span>
        </div>
        <div class="submit-button-bg"></div>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 玻璃切换按钮 */
.glass-toggle-container {
  display: flex;
  justify-content: center;
}

.glass-toggle-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 0.625rem 1.25rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.04);
}

.glass-toggle-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.glass-toggle-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.glass-toggle-button:hover .toggle-icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
}

/* 上传区域 */
.upload-area-container {
  width: 100%;
}

.upload-area {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 2px dashed rgba(156, 163, 175, 0.3);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.upload-area-hover:hover {
  border-color: rgba(156, 163, 175, 0.5);
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
}

.upload-area-active {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.1);
}

.upload-area-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-content {
  padding: 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  space-y: 1.25rem;
}

.upload-icon-container {
  position: relative;
  margin-bottom: 1.25rem;
}

.upload-icon-bg {
  position: absolute;
  inset: -0.5rem;
  background: rgba(156, 163, 175, 0.1);
  border-radius: 50%;
  blur: 20px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.upload-area:hover .upload-icon-bg {
  opacity: 0.8;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.upload-text-container {
  margin-bottom: 1rem;
}

.upload-main-text {
  color: rgb(55, 65, 81);
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.upload-sub-text {
  color: rgb(107, 114, 128);
  font-size: 0.875rem;
}

.upload-success-indicator {
  margin-top: 0.75rem;
}

.success-checkmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 50%;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* 文本输入区域 */
.text-input-container {
  position: relative;
}

.text-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  padding: 1.25rem;
  color: rgb(55, 65, 81);
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.04);
}

.text-input::placeholder {
  color: rgb(156, 163, 175);
}

.text-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.text-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-counter {
  position: absolute;
  bottom: 0.875rem;
  right: 0.875rem;
  font-size: 0.75rem;
  color: rgb(156, 163, 175);
  background: rgba(255, 255, 255, 0.4);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

/* 提交按钮 */
.submit-container {
  width: 100%;
}

.submit-button {
  position: relative;
  width: 100%;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.submit-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.submit-button-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.submit-icon-wrapper {
  margin-right: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.submit-button:hover .submit-icon-wrapper {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.submit-text {
  color: white;
  font-weight: 600;
}

.submit-button-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.9),
    rgba(147, 51, 234, 0.9)
  );
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) .submit-button-bg {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 1),
    rgba(147, 51, 234, 1)
  );
}
</style>
