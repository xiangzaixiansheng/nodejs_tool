export const wrap = (task: Promise<any>): Promise<{ statusCode: number; data?: any; msg?: string }> => {
  return new Promise((resolve) => {
    task.then((data) => {
      resolve({
        statusCode: 200,
        data,
      });
    }).catch((err: Error) => {
      resolve({
        statusCode: -100,
        msg: err.message
      });
    });
  });
};
