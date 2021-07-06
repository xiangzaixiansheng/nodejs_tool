/**
* @file: request-promise 二次封装
* @Author: xiangzai
*/
import request from 'request-promise';
//import * as request from 'request-promise';

/**
 * 请求接口数据
 * @param {Object} params 后台http请求参数数据 
 */
export async function reqGetPromise(uri: string, qs: any) {
    return new Promise((resolve, reject) => {
        request({
            uri,
            qs,
            encoding: null,
            headers: {
                'User-Agent': 'Request-Promise',
            },
            json: true
        }).then(data => {
            resolve(data);
        }, err => {
            let errData = {
                status: 0,
                data: err,
                statusInfo: '失败'
            }
            reject(errData);
        }).catch(err => {
            let obj = {
                status: 0,
                data: err,
                statusInfo: '未知错误！'
            };
            reject(obj);
        });
    });
}

export async function reqPostPromise(uri: string, params: any) {
    return request({
        method: 'POST',
        uri,
        body: params,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    }).then(data => {
        return data;
    }).catch(err => {
        return {
            status: 0,
            data: err,
            statusInfo: '未知错误!'
        };
    });
}