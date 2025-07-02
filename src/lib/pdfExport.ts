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
      // 解析模板内容
      const resumeData = this.parseTemplateContent(templateContent);
      
      // 创建专业的HTML模板
      const htmlContent = this.createProfessionalTemplate(resumeData);
      
      // 创建一个iframe来完全隔离样式
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 794px;
        height: 1123px;
        border: none;
        visibility: hidden;
      `;
      document.body.appendChild(iframe);
      
      // 等待iframe加载
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
      });
      
      // 获取iframe的document并设置内容
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('无法访问iframe文档');
      }
      
      // 设置iframe的内容，确保没有外部CSS影响
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, 'Microsoft YaHei', sans-serif;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      iframeDoc.close();

      // 等待内容渲染
      await new Promise(resolve => setTimeout(resolve, 200));

      // 获取要转换的元素
      const element = iframeDoc.body.firstElementChild as HTMLElement;
      if (!element) {
        throw new Error('无法找到要转换的元素');
      }

      // 使用html2canvas转换为图片
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: undefined,
        logging: false,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 0
      });

      // 移除iframe
      document.body.removeChild(iframe);

      // 创建PDF
      const imgData = canvas.toDataURL('image/png', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // 如果内容高度超过一页，需要分页
      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let position = 0;
        
        // 第一页
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // 添加更多页面（如果需要）
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      // 下载PDF
      pdf.save(`${this.config.filename}.pdf`);
      
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 解析模板内容
   */
  private parseTemplateContent(content: string): ResumeData {
    const data: ResumeData = {};
    
    // 解析各个部分
    const sections = content.split('## ');
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      const sectionTitle = lines[0];
      
      if (sectionTitle.includes('个人信息')) {
        lines.slice(1).forEach(line => {
          if (line.includes('姓名：')) data.name = line.split('：')[1]?.trim();
          if (line.includes('联系电话：')) data.phone = line.split('：')[1]?.trim();
          if (line.includes('邮箱：')) data.email = line.split('：')[1]?.trim();
          if (line.includes('居住地址：')) data.address = line.split('：')[1]?.trim();
          if (line.includes('LinkedIn：')) data.linkedin = line.split('：')[1]?.trim();
          if (line.includes('GitHub：')) data.github = line.split('：')[1]?.trim();
        });
      } else if (sectionTitle.includes('求职意向')) {
        lines.slice(1).forEach(line => {
          if (line.includes('目标职位：')) data.targetPosition = line.split('：')[1]?.trim();
          if (line.includes('期望薪资：')) data.expectedSalary = line.split('：')[1]?.trim();
          if (line.includes('工作地点：')) data.preferredLocation = line.split('：')[1]?.trim();
        });
      } else if (sectionTitle.includes('专业技能')) {
        data.skills = lines.slice(1).join('\n').trim();
      } else if (sectionTitle.includes('工作经验')) {
        data.workExperience = lines.slice(1).join('\n').trim();
      } else if (sectionTitle.includes('教育背景')) {
        data.education = lines.slice(1).join('\n').trim();
      } else if (sectionTitle.includes('项目经验')) {
        data.projects = lines.slice(1).join('\n').trim();
      } else if (sectionTitle.includes('获奖荣誉')) {
        data.awards = lines.slice(1).join('\n').trim();
      } else if (sectionTitle.includes('自我评价')) {
        data.selfEvaluation = lines.slice(1).join('\n').trim();
      }
    });
    
    return data;
  }

  /**
   * 创建专业的HTML模板
   */
  private createProfessionalTemplate(data: ResumeData): string {
    return `
      <div style="width: 794px; min-height: 1123px; background: white; font-family: Arial, 'Microsoft YaHei', sans-serif; color: #333; position: relative;">
        <!-- 头部区域 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 50px; text-align: center; position: relative;">
          <div style="width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.3);">
            <div style="font-size: 48px; font-weight: bold;">${data.name?.charAt(0) || 'U'}</div>
          </div>
          <h1 style="margin: 0 0 10px 0; font-size: 36px; font-weight: bold;">${data.name || 'Your Name'}</h1>
          <p style="margin: 0 0 20px 0; font-size: 18px; opacity: 0.9;">${data.targetPosition || 'Professional Title'}</p>
          
          <!-- 联系信息 -->
          <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 30px; margin-top: 20px; font-size: 14px;">
            ${data.phone ? `<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 16px;">📞</span><span>${data.phone}</span></div>` : ''}
            ${data.email ? `<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 16px;">✉️</span><span>${data.email}</span></div>` : ''}
            ${data.address ? `<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 16px;">📍</span><span>${data.address}</span></div>` : ''}
          </div>
          
          ${data.linkedin || data.github ? `
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px; font-size: 12px;">
              ${data.linkedin ? `<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 14px;">💼</span><span>${data.linkedin}</span></div>` : ''}
              ${data.github ? `<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 14px;">🔗</span><span>${data.github}</span></div>` : ''}
            </div>
          ` : ''}
        </div>

        <!-- 主要内容区域 -->
        <div style="padding: 40px 50px;">
          <!-- 两列布局 -->
          <div style="display: flex; gap: 40px;">
            <!-- 左列 -->
            <div style="flex: 1;">
              ${data.selfEvaluation ? `
                <div style="margin-bottom: 35px;">
                  <h2 style="color: #667eea; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #667eea;">个人简介</h2>
                  <p style="line-height: 1.6; margin: 0; color: #555; font-size: 14px;">${this.formatText(data.selfEvaluation)}</p>
                </div>
              ` : ''}

              ${data.workExperience ? `
                <div style="margin-bottom: 35px;">
                  <h2 style="color: #667eea; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #667eea;">工作经验</h2>
                  <div style="color: #555;">${this.formatExperience(data.workExperience)}</div>
                </div>
              ` : ''}

              ${data.projects ? `
                <div style="margin-bottom: 35px;">
                  <h2 style="color: #667eea; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #667eea;">项目经验</h2>
                  <div style="color: #555;">${this.formatProjects(data.projects)}</div>
                </div>
              ` : ''}
            </div>

            <!-- 右列 -->
            <div style="flex: 0 0 280px;">
              ${data.skills ? `
                <div style="margin-bottom: 35px;">
                  <h2 style="color: #667eea; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #667eea;">专业技能</h2>
                  <div style="color: #555;">${this.formatSkills(data.skills)}</div>
                </div>
              ` : ''}

              ${data.education ? `
                <div style="margin-bottom: 35px;">
                  <h2 style="color: #667eea; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #667eea;">教育背景</h2>
                  <div style="color: #555;">${this.formatEducation(data.education)}</div>
                </div>
              ` : ''}

              ${data.awards ? `
                <div style="margin-bottom: 35px;">
                  <h2 style="color: #667eea; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #667eea;">获奖荣誉</h2>
                  <div style="color: #555;">${this.formatAwards(data.awards)}</div>
                </div>
              ` : ''}

              ${data.expectedSalary || data.preferredLocation ? `
                <div style="margin-bottom: 35px;">
                  <h2 style="color: #667eea; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #667eea;">求职意向</h2>
                  <div style="color: #555; font-size: 14px;">
                    ${data.expectedSalary ? `<p style="margin: 0 0 8px 0;"><strong>期望薪资：</strong>${data.expectedSalary}</p>` : ''}
                    ${data.preferredLocation ? `<p style="margin: 0;"><strong>工作地点：</strong>${data.preferredLocation}</p>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 格式化文本
   */
  private formatText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  /**
   * 格式化技能
   */
  private formatSkills(skills: string): string {
    const lines = skills.split('\n').filter(line => line.trim());
    return lines.map(line => {
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return `<div style="margin: 8px 0; padding: 6px 12px; background: #f0f4ff; border-left: 3px solid #667eea; border-radius: 4px; font-size: 13px;">${line.replace(/^[-•]\s*/, '')}</div>`;
      }
      return `<p style="margin: 8px 0; font-weight: bold; color: #667eea; font-size: 14px;">${line}</p>`;
    }).join('');
  }

  /**
   * 格式化工作经验
   */
  private formatExperience(experience: string): string {
    const sections = experience.split('\n\n');
    return sections.map(section => {
      const lines = section.trim().split('\n');
      if (lines.length > 0) {
        const title = lines[0];
        const content = lines.slice(1).join('<br>');
        return `
          <div style="margin-bottom: 25px; padding: 20px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 16px; font-weight: bold;">${title}</h3>
            <div style="line-height: 1.6; font-size: 14px;">${content}</div>
          </div>
        `;
      }
      return '';
    }).join('');
  }

  /**
   * 格式化项目经验
   */
  private formatProjects(projects: string): string {
    const sections = projects.split('\n\n');
    return sections.map(section => {
      const lines = section.trim().split('\n');
      if (lines.length > 0) {
        const title = lines[0];
        const content = lines.slice(1).join('<br>');
        return `
          <div style="margin-bottom: 20px; padding: 15px; background: #f0f4ff; border-radius: 6px; border-left: 3px solid #667eea;">
            <h4 style="margin: 0 0 8px 0; color: #667eea; font-size: 14px; font-weight: bold;">${title}</h4>
            <div style="line-height: 1.5; font-size: 13px;">${content}</div>
          </div>
        `;
      }
      return '';
    }).join('');
  }

  /**
   * 格式化教育背景
   */
  private formatEducation(education: string): string {
    const lines = education.split('\n').filter(line => line.trim());
    return lines.map(line => {
      return `<div style="margin: 10px 0; padding: 10px; background: #f0f4ff; border-radius: 6px; font-size: 13px;">${line}</div>`;
    }).join('');
  }

  /**
   * 格式化获奖荣誉
   */
  private formatAwards(awards: string): string {
    const lines = awards.split('\n').filter(line => line.trim());
    return lines.map(line => {
      return `<div style="margin: 8px 0; padding: 8px 12px; background: #fff8dc; border-left: 3px solid #ffa500; border-radius: 4px; font-size: 13px;">${line.replace(/^[-•]\s*/, '')}</div>`;
    }).join('');
  }

  /**
   * 从结构化数据生成PDF
   */
  async exportFromData(data: ResumeData): Promise<void> {
    try {
      const htmlContent = this.createProfessionalTemplate(data);
      
      // 创建一个iframe来完全隔离样式
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 794px;
        height: 1123px;
        border: none;
        visibility: hidden;
      `;
      document.body.appendChild(iframe);
      
      // 等待iframe加载
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
      });
      
      // 获取iframe的document并设置内容
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('无法访问iframe文档');
      }
      
      // 设置iframe的内容，确保没有外部CSS影响
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, 'Microsoft YaHei', sans-serif;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      iframeDoc.close();

      // 等待内容渲染
      await new Promise(resolve => setTimeout(resolve, 200));

      // 获取要转换的元素
      const element = iframeDoc.body.firstElementChild as HTMLElement;
      if (!element) {
        throw new Error('无法找到要转换的元素');
      }

      // 使用html2canvas转换为图片
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: undefined,
        logging: false,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 0
      });

      // 移除iframe
      document.body.removeChild(iframe);

      // 创建PDF
      const imgData = canvas.toDataURL('image/png', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // 如果内容高度超过一页，需要分页
      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let position = 0;
        
        // 第一页
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // 添加更多页面（如果需要）
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      // 下载PDF
      pdf.save(`${this.config.filename}.pdf`);
      
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
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