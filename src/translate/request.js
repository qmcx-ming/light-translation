import axios from 'axios';
import qs from 'qs';

class ErrorMessage {
	/**
	 * 统一错误提示
	 * @param {string} name - 翻译引擎名称或错误名称
	 * @param {string} error - 错误信息
	 */
	constructor(name, error) {
		this.name = name;
		this.error = error;
	}
}

/**
 * 通用错误提示
 */
const errorTips = {
	appIdError: '请检查应用ID(AppId/SecretId/AccessKeyID)是否正确或者服务是否开通',
	secretKeyError: '密钥(SecretKey)错误'
};

/**
 * 翻译引擎
 */
const translationEngines = {
	baidu: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
	tencent: 'https://tmt.tencentcloudapi.com',
	alibaba: {
		// 通用版本
		general: 'https://mt.aliyuncs.com/api/translate/web/general',
		// 专业版本
		ecommerce: 'https://mt.aliyuncs.com/api/translate/web/ecommerce'
	},
	google: 'https://translate.google.com',
	edgeTTS: 'https://microsoft-tts.qmcx-ming.top'
}

/**
 * 检测语言(是否为中文)
 * @param {String} word 文本
 */
function detectLanguageZh(word) {
	return /[\u4e00-\u9fa5]/gm.test(word);
}

/**
 * 检测语言(是否为英文)
 * @param {string} word 文本
 */
function detectLanguageEn(word) {
	// 检测首字符是否为英文字母
	return /^[a-zA-Z]/.test(word);
}

/**
 * 获取源语言以及目标语言
 * @param {Object} text 文本
 */
function getLanguagePair(text) {
	const isChinese = detectLanguageZh(text);
	const from = isChinese ? 'zh' : 'en'; // 源语言
	const to = !isChinese ? 'zh' : 'en'; // 目标语言
	return { from, to };
}

/**
 * 发送post请求
 * @param {String} url 请求地址
 * @param {Object} data 数据
 * @param {Object} params 路径参数
 * @param {Object} [headers={}] 请求头
 * @returns {Promise<Object>} 返回一个 Promise，解析为响应的数据。
 */
function send(url, data, params, headers = {}) {
	// 动态添加 params 和 paramsSerializer
	const config = {
		headers,
		...(params && {
			params,
			paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
		})
	};

	return axios.post(url, params ? null : data, config)
		.then(res => {
			console.log(res.data);
			return res.data;
		})
		.catch(error => {
			// console.log(error);
			return Promise.reject(error);
		});
}

export {
  send,
	errorTips,
	translationEngines,
	getLanguagePair,
	detectLanguageZh,
	detectLanguageEn,
	ErrorMessage
}