<!-- App.vue -->
<template>
  <router-view />
</template>

<style>
/* 极简主义设计的一些基础变量或样式，如果需要 */
:root {
  --color-primary: 240 5.9% 10%; /* hsl(240 5.9% 10%) */
  --color-secondary: 240 4.8% 95.9%; /* hsl(240 4.8% 95.9%) */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

body {
  font-family: "Inter", sans-serif; /* 假设你使用 Inter 字体，如果没有，则使用系统默认 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
