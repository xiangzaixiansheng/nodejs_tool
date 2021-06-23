export const wrap = (task: Promise<any>) => {
    return new Promise((resolve, reject) => {
      task.then((data) => {
        resolve({
          statusCode: 200,
          data,
        })
      }).catch(err => {
        resolve({
          statusCode: -100,
          msg: err.message
        })
      })
    })
}