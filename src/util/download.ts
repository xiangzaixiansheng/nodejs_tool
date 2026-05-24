import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { URL } from 'url';

/**
 * 从 URL 下载文件
 * @param fileUrl 文件 URL
 * @param targetDirectory 目标目录
 * @param customFileName 可选：手动指定文件名
 * @returns 下载文件的绝对路径
 */
export async function downloadFileFromUrl(
  fileUrl: string,
  targetDirectory: string,
  customFileName?: string
): Promise<string> {
  try {
    // 尝试从 URL 的查询参数或路径中提取文件名
    let fileName: string;
    if (customFileName) {
      fileName = customFileName;
    } else {
      const parsedUrl = new URL(fileUrl);
      // 情况1：检查路径末尾是否有文件名（如 /example.mp4）
      const pathParts = parsedUrl.pathname.split('/');
      const potentialName = pathParts.pop() || '';
      if (potentialName.includes('.') && !potentialName.startsWith('.')) {
        fileName = potentialName;
      } else {
        // 情况2：从查询参数中提取（如 key=.../filename.mp4）
        const keyParam = parsedUrl.searchParams.get('key');
        if (keyParam) {
          const keyParts = keyParam.split('/');
          fileName = keyParts.pop() || 'downloaded_file';
        } else {
          fileName = 'downloaded_file';
        }
      }
    }

    // 确保目标目录存在
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory, { recursive: true });
    }

    // 下载文件
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    const filePath = path.join(targetDirectory, fileName);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    // 返回绝对路径
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(path.resolve(filePath)));
      writer.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 使用示例（仅在直接运行此文件时执行）
// if (require.main === module) {
//   (async () => {
//     const complexUrl = 'http://127.0.0.1:8080/api/download.mp4';
//     const targetDir = './downloads';
//
//     try {
//       const autoPath = await downloadFileFromUrl(complexUrl, targetDir);
//       console.log('Auto-detected path:', autoPath);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   })();
// }
