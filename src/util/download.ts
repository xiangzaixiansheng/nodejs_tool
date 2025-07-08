import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { URL } from 'url';

export async function downloadFileFromUrl(
  fileUrl: string,
  targetDirectory: string
): Promise<string> {
  try {
    // 从 URL 中提取文件名
    const parsedUrl = new URL(fileUrl);
    const pathname = parsedUrl.pathname;
    const fileName = pathname.split('/').pop() || 'downloaded_file';

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


// 同时下载多个字段
async function downloadAudioAndCover(
  audioPath: string,
  coverPath: string,
  targetDirectory: string
): Promise<{ audioLocalPath: string; coverLocalPath: string }> {
  try {
    // 并行下载音频和封面
    const [audioLocalPath, coverLocalPath] = await Promise.all([
      downloadFileFromUrl(audioPath, targetDirectory),
      downloadFileFromUrl(coverPath, targetDirectory),
    ]);

    return { audioLocalPath, coverLocalPath };
  } catch (error) {
    throw new Error(`Download failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 示例用法
(async () => {
  const audioPath = 'https://example.com/audio.m4a'; // 替换为实际音频 URL
  const coverPath = 'https://example.com/cover.jpg'; // 替换为实际封面 URL
  const targetDirectory = './downloads'; // 替换为目标目录

  try {
    const { audioLocalPath, coverLocalPath } = await downloadAudioAndCover(
      audioPath,
      coverPath,
      targetDirectory
    );
    console.error('Audio downloaded to:', audioLocalPath);
    console.error('Cover downloaded to:', coverLocalPath);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
})();