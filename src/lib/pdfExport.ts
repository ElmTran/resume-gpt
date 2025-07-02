import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// PDF导出配置接口
interface PDFExportConfig {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

// 简历数据接口
interface ResumeData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  targetPosition?: string;
  expectedSalary?: string;
  preferredLocation?: string;
  skills?: string;
  workExperience?: string;
  education?: string;
  projects?: string;
  awards?: string;
  selfEvaluation?: string;
}

/**
 * PDF导出工具类
 */
export class PDFExportService {
  private config: Required<PDFExportConfig>;

  constructor(config: PDFExportConfig = {}) {
    this.config = {
      filename: config.filename || 'resume',
      format: config.format || 'a4',
      orientation: config.orientation || 'portrait',
      quality: config.quality || 2
    };
  }

  /**
   * 从模板内容生成PDF
   */
  async exportFromTemplate(templateContent: string): Promise<void> {
    try {
      // 创建临时HTML元素用于渲染
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.formatTemplateForPDF(templateContent);
      tempDiv.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 794px;
        background: white;
        padding: 40px;
        font-family: 'Microsoft YaHei', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      `;
      
      document.body.appendChild(tempDiv);

      // 使用html2canvas转换为图片
      const canvas = await html2canvas(tempDiv, {
        scale: this.config.quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // 移除临时元素
      document.body.removeChild(tempDiv);

      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: this.config.orientation,
        unit: 'mm',
        format: this.config.format
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // 下载PDF
      pdf.save(`${this.config.filename}.pdf`);
      
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 从结构化数据生成PDF
   */
  async exportFromData(data: ResumeData): Promise<void> {
    try {
      const templateContent = this.generateTemplateFromData(data);
      await this.exportFromTemplate(templateContent);
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 格式化模板内容用于PDF渲染
   */
  private formatTemplateForPDF(content: string): string {
    // 将Markdown格式转换为HTML
    let htmlContent = content
      // 标题转换
      .replace(/^## (.+)$/gm, '<h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin: 20px 0 15px 0; font-size: 18px;">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="color: #374151; margin: 15px 0 10px 0; font-size: 16px;">$1</h3>')
      // 列表转换
      .replace(/^- (.+)$/gm, '<li style="margin: 5px 0;">$1</li>')
      // 粗体转换
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 换行转换
      .replace(/\n/g, '<br>');

    // 包装li标签
    htmlContent = htmlContent.replace(/(<li[^>]*>.*?<\/li>)/gs, '<ul style="margin: 10px 0; padding-left: 20px;">$1</ul>');

    return `
      <div style="max-width: 794px; margin: 0 auto;">
        ${htmlContent}
      </div>
    `;
  }

  /**
   * 从结构化数据生成模板内容
   */
  private generateTemplateFromData(data: ResumeData): string {
    return `
## 个人信息
姓名：${data.name || ''}
联系电话：${data.phone || ''}
邮箱：${data.email || ''}
居住地址：${data.address || ''}
LinkedIn：${data.linkedin || ''}
GitHub：${data.github || ''}

## 求职意向
目标职位：${data.targetPosition || ''}
期望薪资：${data.expectedSalary || ''}
工作地点：${data.preferredLocation || ''}

## 专业技能
${data.skills || ''}

## 工作经验
${data.workExperience || ''}

## 教育背景
${data.education || ''}

## 项目经验
${data.projects || ''}

## 获奖荣誉
${data.awards || ''}

## 自我评价
${data.selfEvaluation || ''}
    `.trim();
  }
}

/**
 * 创建PDF导出服务实例
 */
export function createPDFExportService(config?: PDFExportConfig): PDFExportService {
  return new PDFExportService(config);
}

/**
 * 快速导出PDF
 */
export async function exportResumeToPDF(
  templateContent: string,
  filename?: string
): Promise<void> {
  const service = createPDFExportService({ filename });
  await service.exportFromTemplate(templateContent);
} 