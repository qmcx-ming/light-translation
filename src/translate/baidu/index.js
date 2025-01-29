import { send, translationEngines, ErrorMessage } from '../request';
import errorCode from './errorCode';

/**
 * 百度翻译服务
 * @param {String} text 文本
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 * @param {String} from 源语言
 * @param {String} to 目标语言
 * @param {String} original 原文
 */
async function baiduTranslate(text, appId, secretKey, from, to, original) {
	// console.log(appId, secretKey);
	const salt = new Date().getTime();
	const str1 = appId + text + salt + secretKey;
	const sign = window.services.MD5(str1);

	const data = {
		q: text,
		appid: appId,
		salt: salt,
		from: from,
		to: to,
		sign: sign
	};

	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	};

	const res = await send(translationEngines['baidu'], data, null, headers);
	if (res.error_code) {
		return Promise.reject(new ErrorMessage('baidu', errorCode[res.error_code]));
	}
	const response = {
		name: 'baidu',
		from: res.from,
		to: res.to,
		// destination 目标
		dst: res.trans_result[0].dst,
		src: res.trans_result[0].src
	};
	if(original) response.row = res
	return response;
}

async function baiduLangDetect(text, appId, secretKey) {
	const res = await baiduTranslate(text, appId, secretKey, 'auto', 'zh', false);
	return res.from;
}

export {
	baiduTranslate,
	baiduLangDetect
};