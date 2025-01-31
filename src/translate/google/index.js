import { send, ErrorMessage } from '../request.js';
import { getValue } from './tk';
import { handlerGoogleData } from './g-utils';

/**
 * 谷歌翻译服务
 * @param {String} text 文本
 * @param {String} url 谷歌翻译服务URL
 * @param {String} from 源语言
 * @param {String} to 目标语言
 * @param {String} original 是否返回原文
 */
async function googleTranslate(text, url, from, to, original) {
	const TRANSLATION_API_PATH = '/translate_a/single'; // t
	// 去除 / 如 https://baidu.com/ -> https://baidu.com
	const DEFAULT_GOOGLE_API_SERVER_URL = url.replace(/\/$/, '');
	
	const tkk = await getValue(DEFAULT_GOOGLE_API_SERVER_URL);
	if(!tkk) return Promise.reject(new ErrorMessage('google', 'TKK更新失败, 请检查网络连接'));

	const params = {
		client: 'gtx',
		sl: from,
		tl: to,
		hl: 'en',
		dt: [
			'at',
			'bd',
			'ex',
			'ld',
			'md',
			'qca',
			'rw',
			'rm',
			'ss',
			't',
		],
		ie: 'UTF-8',
		oe: 'UTF-8',
		pc: 1,
		otf: 1,
		ssel: 0,
		tsel: 0,
		kc: 1,
		tk: text.tk(tkk),
		q: text
	};
	const res = await send(
		DEFAULT_GOOGLE_API_SERVER_URL + TRANSLATION_API_PATH,
		null,
		params, null
	).catch(e => {
		console.log(e);
		return Promise.reject(new ErrorMessage('google', '网络连接超时，请检查网络或代理服务器地址是否可用'));
	})

	const { name, result, detail } = handlerGoogleData(res);
	const response = {
		name,
		from: res[2],
		to: to,
		dst: result,
		src: text,
		detail
	};
	if(original) response.row = res;
	return response;
}

async function googleLangDetect(text, url) {
	const res = await googleTranslate(text, url, 'auto', 'zh', false);
	return res.from;
}

export {
	googleTranslate,
	googleLangDetect
};