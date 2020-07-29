import { toParam } from '@/utils/utils';
import { clearAuthority } from './authority';

const axios = window['axios'];

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '您当前会话状态已超时，请重新登录',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};

// 登录态标识
const checkStatus = response => {
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    const errortext = codeMessage[response.status] || response.statusText;
    const status = false // 从全局状态中获取是否登录;

    if (response.status === 401) {
        //401 提示只弹出一次即可
        if (status) {
            // notification.warning({
            //     message: `错误提示`,
            //     description: errortext,
            // });
            console.warn(errortext);

            clearAuthority();
        }
    } else {
        // notification.error({
        //     message: `请求错误 ${response.status}: ${response.url}`,
        //     description: errortext,
        // });
        console.warn(`请求错误 ${response.status}: ${response.url}`);
    }
    const error = new Error(errortext);
    error.name = response.status;
    error.response = response;
    throw error;
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function _request(option) {
    const options = {
        ...option,
    };

    const defaultOptions = {
        credentials: 'include',
        mode: 'cors',
        withCredentials: true
    };

    const newOptions = { ...defaultOptions, ...options };
    if (
        newOptions.method === 'GET' ||
        newOptions.method === 'POST' ||
        newOptions.method === 'PUT' ||
        newOptions.method === 'DELETE'
    ) {
        if (!(newOptions.data instanceof FormData)) {
            // 如果跨域的请求是Simple Request（简单请求 ），则不会触发“PreFlight”。Mozilla对于简单请求的要求是
            // 取消发送options探路 https://www.cnblogs.com/cc299/p/7339583.html
            newOptions.headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                ...newOptions.headers,
            };

            newOptions.data = JSON.stringify(newOptions.data);
        } else {
            // newOptions.data is FormData，通常是带附件提交
            newOptions.headers = {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                ...newOptions.headers,
            };
        }
    }
    newOptions.headers = {
        "X-Requested-With": 'XMLHttpRequest',
        ...newOptions.headers,
    };

    // loading

    return axios(newOptions)
        .then(checkStatus)
        //.then(response => cachedSave(response, hashcode))
        .then(res => {
            // 全局加载结束
            if (res.code === 200 || res.code === 1) {
                return res;
            } else {
                alert(res.msg);
                return Promise.reject(new Error(res.msg || 'Error'));
            }
        })
        .catch(({ response }) => {
            // 全局加载结束
            // endLoading
            const status = response.status;

            if (status === 401) {
                // 返回登录页
                clearAuthority();
                location.reload();
            }

            return Promise.reject(new Error(response.data.data));
        });
}

export const request = {
    get(url, params) {
        let urlRes = url;
        if (params) {
            urlRes = toParam(url, params);
        }

        return _request({
            url: urlRes,
            method: 'GET'
        })
    },
    post(url, data, params) {
        let urlRes = url;
        if (params) {
            urlRes = toParam(params);
        }

        return _request({
            url: urlRes,
            method: 'POST',
            data: data
        })
    },
    delete(url, data, params) {
        let urlRes = url;
        if (params) {
            urlRes = toParam(url, params);
        }

        return _request({
            url: urlRes,
            method: 'DELETE',
            data: data
        })
    },
    put(url, data, params) {
        let urlRes = url;
        if (params) {
            urlRes = toParam(url, params);
        }

        return _request({
            url: urlRes,
            method: 'PUT',
            data: data
        })
    }
};

export default {
    install(_Vuip) {
        _Vuip.prototype.request = request
    }
}