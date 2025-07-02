// API 配置
export const GEMINI_CONFIG = {
  // 从环境变量获取 API Key，如果没有则使用默认值（需要用户设置）
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // 默认模型
  DEFAULT_MODEL: 'gemini-2.5-pro',
  
  // 备用模型
  FALLBACK_MODEL: 'gemini-2.5-flash',
  
  // API 配置
  MAX_RETRIES: 3,
  TIMEOUT: 30000, // 30秒超时
} as const;

// 验证 API Key 是否已配置
export function validateApiKey(): boolean {
  return Boolean(GEMINI_CONFIG.API_KEY && GEMINI_CONFIG.API_KEY.trim().length > 0);
}

// 获取 API Key（如果未配置则抛出错误）
export function getApiKey(): string {
  if (!validateApiKey()) {
    throw new Error('Gemini API Key 未配置，请在环境变量中设置 VITE_GEMINI_API_KEY');
  }
  return GEMINI_CONFIG.API_KEY;
} 