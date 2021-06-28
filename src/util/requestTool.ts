import axios, { AxiosRequestConfig } from "axios";

async function get(url: string, options?: AxiosRequestConfig, openLog = true) {
  return axios
    .get(url, options)
    .then((response) => {
      if (openLog) {
        console.error({
          data: response.data,
          url,
          method: "get",
          options,
        });
      }
      return response.data;
    })
    .catch((e) => {
      console.log(e);
      if (openLog) {
        console.error({
          data: e.message,
          url,
          method: "get",
          options,
        });
      }
    });
}

async function post(
  url: string,
  data?: any,
  options?: AxiosRequestConfig,
  openLog = true
) {
  return axios
    .post(url, data, options)
    .then((response) => {
      if (openLog) {
        console.info({ data: response.data, url, method: "post", options });
      }
      return response.data;
    })
    .catch((e) => {
      console.log(e);
      if (openLog) {
        console.error({
          data: e.message,
          url,
          method: "post",
          options,
        });
      }
    });
}

export { get, post };
