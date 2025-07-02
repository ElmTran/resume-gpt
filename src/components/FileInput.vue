<!-- src/components/FileInput.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { CloudUpload, Type, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
    !(inputMode.value === "file" && uploadedFile.value) &&
    !(inputMode.value === "text" && resumeText.value.trim() !== "")
  );
};
</script>

<template>
  <div class="space-y-6">
    <!-- Mode Toggle -->
    <div class="flex justify-center">
      <Button
        @click="toggleInputMode"
        variant="ghost"
        size="sm"
        class="backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-foreground/80 hover:text-foreground transition-all duration-300"
      >
        <CloudUpload v-if="inputMode === 'text'" class="h-4 w-4" />
        <Type v-else class="h-4 w-4" />
        {{ inputMode === "file" ? "Text" : "Upload" }}
      </Button>
    </div>

    <!-- File Upload Area -->
    <div
      v-if="inputMode === 'file'"
      @click="triggerFileInput"
      :class="
        cn(
          'relative overflow-hidden rounded-2xl border-2 border-dashed border-white/30 bg-white/5 backdrop-blur-md transition-all duration-300 cursor-pointer group',
          'hover:border-white/50 hover:bg-white/10',
          uploadedFile && 'border-white/50 bg-white/10',
        )
      "
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        @change="handleFileChange"
        class="absolute inset-0 opacity-0 cursor-pointer"
      />

      <div class="p-12 text-center">
        <div class="flex flex-col items-center space-y-4">
          <div class="relative">
            <CloudUpload
              :class="
                cn(
                  'h-16 w-16 transition-all duration-300',
                  uploadedFile
                    ? 'text-white'
                    : 'text-white/60 group-hover:text-white/80',
                )
              "
            />
            <div
              class="absolute -inset-2 bg-white/10 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"
            />
          </div>

          <div class="space-y-2">
            <p class="text-white/90 font-medium">
              {{ uploadedFile ? uploadedFile.name : "Drop or click to upload" }}
            </p>
            <p class="text-white/60 text-sm">PDF, Word, or Text files</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Input Area -->
    <div v-else class="relative">
      <Textarea
        v-model="resumeText"
        placeholder="Paste your resume content here..."
        :rows="12"
        class="backdrop-blur-md bg-white/5 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/10 transition-all duration-300 resize-none"
      />
      <div class="absolute bottom-3 right-3 text-xs text-white/40">
        {{ resumeText.length }}
      </div>
    </div>

    <!-- Submit Button -->
    <Button
      @click="handleSubmit"
      :disabled="isSubmitDisabled()"
      size="lg"
      class="w-full backdrop-blur-md bg-white/90 hover:bg-white text-black hover:text-black border-0 shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
    >
      <Sparkles class="h-5 w-5" />
      Optimize Resume
    </Button>
  </div>
</template>
