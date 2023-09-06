import * as fs from "fs-extra";
import * as zlib from "zlib";
import archiver from 'archiver';


export const compressFolder = (
  sourceFolderPath: string,
  outputFilePath: string
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver("zip", {
      zlib: { level: zlib.constants.Z_BEST_COMPRESSION },
    });

    output.on("close", () => {
      resolve("压缩已完成");
    });

    output.on("end", () => {
      resolve("数据写入已结束");
    });

    archive.on("warning", (warning: archiver.ArchiverError) => {
      reject(warning);
    });

    archive.on("error", (err: Error) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceFolderPath, false);
    archive.finalize();
  });
};

