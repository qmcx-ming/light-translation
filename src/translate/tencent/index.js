import { translationEngines, ErrorMessage } from '../request';
import errorCode from './errorCode';

/**
 * 腾讯翻译服务
 * @param {String} text 文本
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 * @param {String} from 源语言
 * @param {String} to 目标语言
 */
async function tencentTranslate(text, appId, secretKey, from, to, original) {
	const data = {
		SourceText: text,
		Source: from,
		Target: to,
		ProjectId: 0
	};

	const SECRET_ID = appId;
	const SECRET_KEY = secretKey;
	const TOKEN = '';

	const host = 'tmt.tencentcloudapi.com';
	const service = "tmt";
	const region = "ap-guangzhou";
	const action = "TextTranslate";
	const version = "2018-03-21"
	const timestamp = parseInt(String(new Date().getTime() / 1000));
	const date = getDate(timestamp);
	const payload = JSON.stringify(data);

	// 步骤 1：拼接规范请求串
	const signedHeaders = "content-type;host";
	const hashedRequestPayload = window.services.getHash(payload);
	const httpRequestMethod = "POST";
	const canonicalUri = "/";
	const canonicalQueryString = "";
	const canonicalHeaders =
		"content-type:application/json; charset=utf-8\n" + "host:" + host + "\n";

	const canonicalRequest =
		httpRequestMethod +
		"\n" +
		canonicalUri +
		"\n" +
		canonicalQueryString +
		"\n" +
		canonicalHeaders +
		"\n" +
		signedHeaders +
		"\n" +
		hashedRequestPayload;

	// 步骤 2：拼接待签名字符串
	const algorithm = "TC3-HMAC-SHA256"
	const hashedCanonicalRequest = window.services.getHash(canonicalRequest)
	const credentialScope = date + "/" + service + "/" + "tc3_request"
	const stringToSign =
		algorithm +
		"\n" +
		timestamp +
		"\n" +
		credentialScope +
		"\n" +
		hashedCanonicalRequest;

	// 步骤 3：计算签名
	const kDate = window.services.sha256(date, "TC3" + SECRET_KEY);
	const kService = window.services.sha256(service, kDate);
	const kSigning = window.services.sha256("tc3_request", kService);
	const signature = window.services.sha256(stringToSign, kSigning, "hex");

	// 步骤 4：拼接 Authorization
	const authorization =
		algorithm +
		" " +
		"Credential=" +
		SECRET_ID +
		"/" +
		credentialScope +
		", " +
		"SignedHeaders=" +
		signedHeaders +
		", " +
		"Signature=" +
		signature

	// 步骤 5：构造请求头
	const headers = {
		Authorization: authorization,
		"Content-Type": "application/json; charset=utf-8",
		Host: host,
		"X-TC-Action": action,
		"X-TC-Timestamp": timestamp,
		"X-TC-Version": version,
	};

	if (region) {
		headers["X-TC-Region"] = region
	}
	if (TOKEN) {
		headers["X-TC-Token"] = TOKEN
	}

	const { Response } = await window.services.send(translationEngines['tencent'], data, null, headers);

	// 部分错误处理
	if (Response.Error) {
		return Promise.reject(new ErrorMessage('tencent', errorCode[Response.Error.Code]));
	}

	const response = {
		name: 'tencent',
		from: Response.Source,
		to: Response.Target,
		dst: Response.TargetText,
		src: text
	};
	if(original) response.row = Response;
	return response;
}

async function tencentLangDetect(text, appId, secretKey) {
	const res = await tencentTranslate(text, appId, secretKey, 'auto', 'zh', false);
	return res.from;
}

/**
 * 根据时间戳返回格式化的日期字符串。
 *
 * @param {Number} timestamp 时间戳
 * @returns {String} 格式化的日期字符串，格式为 YYYY-MM-DD
 */
function getDate(timestamp) {
	const date = new Date(timestamp * 1000);
	const year = date.getUTCFullYear();
	const month = ("0" + (date.getUTCMonth() + 1)).slice(-2)
	const day = ("0" + date.getUTCDate()).slice(-2)
	return `${year}-${month}-${day}`;
}

export { 
	tencentTranslate,
	tencentLangDetect
};