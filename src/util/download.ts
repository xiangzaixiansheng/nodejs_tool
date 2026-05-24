import fs from 'fs';
import path from 'path';
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

    // 使用内置 fetch 下载文件
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 获取响应体作为 ReadableStream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is empty');
    }

    const filePath = path.join(targetDirectory, fileName);
    const writer = fs.createWriteStream(filePath);

    // 读取流并写入文件
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      writer.write(Buffer.from(value));
    }

    writer.end();

    // 返回绝对路径
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(path.resolve(filePath)));
      writer.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
  }
}
