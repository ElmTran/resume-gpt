import { GoogleGenAI } from "@google/genai";

// 配置接口
interface GeminiConfig {
  apiKey: string;
  model?: string;
}

// 简历优化结果接口
export interface ResumeOptimizationResult {
  success: boolean;
  optimizedContent?: string;
  suggestions?: string[];
  error?: string;
}

// 简历模板结果接口
export interface ResumeTemplateResult {
  success: boolean;
  templateContent?: string;
  variables?: Record<string, string>;
  error?: string;
}

// 文件处理结果接口
interface FileProcessResult {
  success: boolean;
  base64Data?: string;
  mimeType?: string;
  error?: string;
}

/**
 * Gemini AI 工具类
 */
export class GeminiService {
  private ai: GoogleGenAI;
  private model: string;

  constructor(config: GeminiConfig) {
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model || "gemini-2.0-flash-exp";
  }

  /**
   * 将文件转换为 base64 格式
   */
  private async fileToBase64(file: File): Promise<FileProcessResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // 在浏览器环境中使用 btoa 和 Uint8Array
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      const base64Data = btoa(binaryString);
      
      return {
        success: true,
        base64Data,
        mimeType: file.type
      };
    } catch (error) {
      return {
        success: false,
        error: `文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 从 URL 获取文件并转换为 base64
   */
  private async urlToBase64(url: string): Promise<FileProcessResult> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      // 在浏览器环境中使用 btoa 和 Uint8Array
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      const base64Data = btoa(binaryString);
      const mimeType = response.headers.get('content-type') || 'application/octet-stream';
      
      return {
        success: true,
        base64Data,
        mimeType
      };
    } catch (error) {
      return {
        success: false,
        error: `URL 文件获取失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 优化简历内容（支持文件和文本）
   */
  async optimizeResume(
    input: File | string,
    customPrompt?: string
  ): Promise<ResumeOptimizationResult> {
    try {
      let contents: any[] = [];

      // 默认的简历优化提示词
      const defaultPrompt = `
请分析这份简历并提供详细的优化建议。请从以下几个方面进行分析：

1. **内容结构**：评估简历的整体结构和信息组织
2. **关键词优化**：建议添加相关的行业关键词和技能
3. **成就量化**：指出哪些成就可以用数字和具体数据来强化
4. **格式改进**：提供格式和排版的改进建议
5. **针对性调整**：根据目标职位提供针对性的修改建议

请用中文回复，并提供具体可操作的改进建议。
      `.trim();

      const prompt = customPrompt || defaultPrompt;
      contents.push({ text: prompt });

      // 处理不同类型的输入
      if (typeof input === 'string') {
        // 如果是字符串，判断是 URL 还是纯文本
        if (input.startsWith('http://') || input.startsWith('https://')) {
          // URL 处理
          const fileResult = await this.urlToBase64(input);
          if (!fileResult.success) {
            return {
              success: false,
              error: fileResult.error
            };
          }
          
          contents.push({
            inlineData: {
              mimeType: fileResult.mimeType,
              data: fileResult.base64Data
            }
          });
        } else {
          // 纯文本处理
          contents.push({ text: `以下是简历内容：\n${input}` });
        }
      } else {
        // File 对象处理
        const fileResult = await this.fileToBase64(input);
        if (!fileResult.success) {
          return {
            success: false,
            error: fileResult.error
          };
        }

        contents.push({
          inlineData: {
            mimeType: fileResult.mimeType,
            data: fileResult.base64Data
          }
        });
      }

      // 调用 Gemini API
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: contents
      });

      const optimizedContent = response.text;
      // 解析建议（简单的文本分割，您可以根据需要改进）
      const suggestions = this.extractSuggestions(optimizedContent || '');

      return {
        success: true,
        optimizedContent,
        suggestions
      };

    } catch (error) {
      return {
        success: false,
        error: `AI 处理失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 从优化内容中提取建议列表
   */
  private extractSuggestions(content: string): string[] {
    const suggestions: string[] = [];
    
    // 简单的建议提取逻辑，您可以根据需要改进
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[\d\-\*\•]/) || trimmed.includes('建议') || trimmed.includes('推荐')) {
        suggestions.push(trimmed);
      }
    }
    
    return suggestions.length > 0 ? suggestions : [content];
  }

  /**
   * 生成针对特定职位的简历优化建议
   */
  async optimizeForJobPosition(
    resume: File | string,
    jobDescription: string
  ): Promise<ResumeOptimizationResult> {
    const customPrompt = `
请根据以下职位描述来优化这份简历：

**目标职位描述：**
${jobDescription}

**优化要求：**
1. 突出与目标职位相关的技能和经验
2. 调整关键词以匹配职位要求
3. 重新组织内容以强调最相关的成就
4. 提供具体的修改建议和原因说明

请用中文回复，并提供详细的优化建议。
    `.trim();

    return this.optimizeResume(resume, customPrompt);
  }

  /**
   * 生成简历摘要
   */
  async generateResumeSummary(resume: File | string): Promise<ResumeOptimizationResult> {
    const customPrompt = `
请为这份简历生成一个简洁的专业摘要，包括：

1. **核心技能总结**
2. **工作经验亮点**
3. **职业发展方向**
4. **独特价值主张**

摘要应该在 100-150 字之间，用中文回复。
    `.trim();

    return this.optimizeResume(resume, customPrompt);
  }

  /**
   * 生成固定格式的简历模板
   */
  async generateResumeTemplate(
    input: File | string,
    customPrompt?: string
  ): Promise<ResumeTemplateResult> {
    try {
      let contents: any[] = [];

      // 固定格式简历生成提示词
      const defaultPrompt = `
请根据提供的简历内容，生成一份完整的、格式化的简历。请严格按照以下格式输出，使用固定变量：

## 个人信息
姓名：{{Name}}
联系电话：{{Phone}}
邮箱：{{Email}}
居住地址：{{Address}}
LinkedIn：{{LinkedIn}}
GitHub：{{GitHub}}

## 求职意向
目标职位：{{TargetPosition}}
期望薪资：{{ExpectedSalary}}
工作地点：{{PreferredLocation}}

## 专业技能
{{Skills}}

## 工作经验
{{WorkExperience}}

## 教育背景
{{Education}}

## 项目经验
{{Projects}}

## 获奖荣誉
{{Awards}}

## 自我评价
{{SelfEvaluation}}

请根据原始简历内容，填充以上模板中的所有变量。对于缺失的信息，请根据现有信息进行合理推断和补充。
- 技能部分请按类别分组（如：编程语言、框架、工具等）
- 工作经验请按时间倒序排列，包含公司名称、职位、时间、主要职责和成就
- 项目经验请突出技术栈和个人贡献
- 所有内容都要具体、量化，避免空泛的描述

请直接输出填充好的完整简历内容，不要包含任何解释或说明。
      `.trim();

      const prompt = customPrompt || defaultPrompt;
      contents.push({ text: prompt });

      // 处理不同类型的输入
      if (typeof input === 'string') {
        if (input.startsWith('http://') || input.startsWith('https://')) {
          const fileResult = await this.urlToBase64(input);
          if (!fileResult.success) {
            return {
              success: false,
              error: fileResult.error
            };
          }
          
          contents.push({
            inlineData: {
              mimeType: fileResult.mimeType,
              data: fileResult.base64Data
            }
          });
        } else {
          contents.push({ text: `以下是简历内容：\n${input}` });
        }
      } else {
        const fileResult = await this.fileToBase64(input);
        if (!fileResult.success) {
          return {
            success: false,
            error: fileResult.error
          };
        }

        contents.push({
          inlineData: {
            mimeType: fileResult.mimeType,
            data: fileResult.base64Data
          }
        });
      }

      // 调用 Gemini API
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: contents
      });

      const templateContent = response.text;
      const variables = this.extractVariables(templateContent || '');

      return {
        success: true,
        templateContent,
        variables
      };

    } catch (error) {
      return {
        success: false,
        error: `AI 处理失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 从模板内容中提取变量
   */
  private extractVariables(content: string): Record<string, string> {
    const variables: Record<string, string> = {};
    const regex = /\{\{(\w+)\}\}/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const variableName = match[1];
      // 尝试从内容中提取对应的值
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes(`{{${variableName}}}`)) {
          const value = line.replace(`{{${variableName}}}`, '').replace(/^[^：:]*[：:]/, '').trim();
          if (value && value !== `{{${variableName}}}`) {
            variables[variableName] = value;
          }
          break;
        }
      }
    }

    return variables;
  }
}

/**
 * 创建 Gemini 服务实例的工厂函数
 */
export function createGeminiService(apiKey: string, model?: string): GeminiService {
  return new GeminiService({ apiKey, model });
}

/**
 * 简化的简历优化函数（用于快速调用）
 */
export async function optimizeResumeWithGemini(
  apiKey: string,
  resume: File | string,
  customPrompt?: string
): Promise<ResumeOptimizationResult> {
  const service = createGeminiService(apiKey);
  return service.optimizeResume(resume, customPrompt);
} 