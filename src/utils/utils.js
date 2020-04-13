import { parse, stringify } from 'qs';

export function fixedZero(val) {
	return val * 1 < 10 ? `0${val}` : val;
}

export function getPageQuery() {
	return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
	const search = stringify(query);
	if (search.length) {
		return `${path}?${search}`;
	}
	return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
	return reg.test(path);
}

export function toParam(url, params) {
	let paramsArray = [];
	//拼接参数
	Object.keys(params).forEach(key => {
		if (params[key] !== undefined && params[key] !== null) {
			paramsArray.push(key + '=' + params[key])
		}
	})
	if (url.search(/\?/) === -1) {
		url += '?' + paramsArray.join('&')
	} else {
		url += '&' + paramsArray.join('&')
	}

	return url;
}

//遍历树结构
export function eachTree(arr, callback, callback2) {
	arr.forEach((item) => {
		if (item.children && item.children.length > 0) {
			if (typeof callback2 === 'function') {
				callback2(item);
			}

			eachTree(item.children, callback, callback2);
		} else {
			callback(item);
		}
	});
}


export function compare(prop) {
	return function (obj1, obj2) {
		let val1 = obj1[prop];
		let val2 = obj2[prop];
		if (val1 < val2) {
			return 1;
		} else if (val1 > val2) {
			return -1;
		} else {
			return 0;
		}
	}
}