import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { URL } from 'url';

async function downloadFileFromUrl(
  fileUrl: string,
  targetDirectory: string,
  customFileName?: string // 可选：手动指定文件名
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

// 示例：处理微博的复杂 URL
(async () => {
  const complexUrl = 'http://127.0.0.1:8080/api/download.mp4';
  const targetDir = './downloads';

  try {
    // 方法1：自动从 URL 提取文件名（可能不准确）
    const autoPath = await downloadFileFromUrl(complexUrl, targetDir);
    console.log('Auto-detected path:', autoPath);

    // 方法2：手动指定文件名（推荐）
    const manualPath = await downloadFileFromUrl(
      complexUrl,
      targetDir,
      'video_2186923718701724dfc535959ec07bdf.mp4' // 明确指定文件名
    );
    console.log('Manual-specified path:', manualPath);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
})();