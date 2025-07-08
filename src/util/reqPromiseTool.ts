/**
* @file: request-promise 二次封装
* @Author: xiangzai
*/

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 请求接口数据--get
 * @param uri 
 * @param qs 
 * @param headers 
 * @returns 
 */
export const reqGetPromise = async (url: string, params?: any, headers?: any) => {
    try {
        const response: AxiosResponse = await axios.get(url, {
            params,
            headers,
        });
        return { status: 1, data: response.data };
    } catch (err: any) {
        return {
            status: 0,
            data: err?.response?.data || err.message,
            statusInfo: '请求失败',
        };
    }
};

export const reqPostPromise = async (url: string, data: any, headers?: any) => {
    try {
        const response: AxiosResponse = await axios.post(url, data, { headers });
        return { status: 1, data: response.data };
    } catch (err: any) {
        return {
            status: 0,
            data: err?.response?.data || err.message,
            statusInfo: '请求失败',
        };
    }
};

export const reqPostPromiseV2 = async (options: AxiosRequestConfig) => {
    try {
        const response: AxiosResponse = await axios(options);
        return { status: 1, data: response.data };
    } catch (err: any) {
        return {
            status: 0,
            data: err?.response?.data || err.message,
            statusInfo: '请求失败',
        };
    }
};