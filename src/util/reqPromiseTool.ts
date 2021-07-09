/**
* @file: request-promise 二次封装
* @Author: xiangzai
*/
import request from 'request-promise';
//import * as request from 'request-promise';
var BufferHelper = require('bufferhelper');
var iconv = require('iconv-lite');

/**
 * 请求接口数据--get
 * @param uri 
 * @param qs 
 * @param headers 
 * @returns 
 */
export const reqGetPromise = async (uri: string, qs: any, headers?: any) => {
    return new Promise((resolve, reject) => {
        var bufferHelper = new BufferHelper();
        request({
            uri,
            qs,
            encoding: null,
            headers: headers ? {
                'User-Agent': 'Request-Promise',
            } : headers,
            json: true
        }).then(data => {
            //转换一些buffer类型的
            if(Buffer.isBuffer(data)) {
                bufferHelper.concat(data);
                var decode = iconv.decode(bufferHelper.toBuffer(), 'utf-8');
                return resolve(decode);
            }
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