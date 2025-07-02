<!-- src/views/HomePage.vue -->
<script setup lang="ts">
import FileInput from "../components/FileInput.vue";

// 可以在这里定义首页的逻辑，例如处理文件上传后的操作
const handleFileUploaded = (file: File | string) => {
  console.log("文件或文本已处理:", file);
  // 未来这里会触发AI优化流程
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4"
  >
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"
      ></div>
    </div>

    <!-- Main Content -->
    <div class="relative w-full max-w-2xl">
      <!-- Glass Card -->
      <div
        class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12"
      >
        <!-- Header -->
        <div class="text-center mb-12">
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md mb-6"
          >
            <svg
              class="w-8 h-8 text-white"
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
          <h1
            class="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Resume AI
          </h1>
          <p class="text-white/70 text-lg">Optimize your resume with AI</p>
        </div>

        <!-- File Input Component -->
        <FileInput @file-processed="handleFileUploaded" />
      </div>
    </div>
  </div>
</template>
