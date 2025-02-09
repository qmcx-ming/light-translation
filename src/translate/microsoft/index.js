import { setConfig, getConfig } from '../../utils/tk-config';
// let cachedToken = null;
// let tokenExpireTime = 0; // 记录 token 的真实过期时间

// 解析 Token 获取 `exp` 过期时间
function parseTokenExpireTime(token) {
  try {
    // Token 结构："Header.Payload.Signature"
    const payloadBase64 = token.split('.')[1]; // 取出 Payload 部分
    const payloadJson = JSON.parse(atob(payloadBase64)); // Base64 解码并解析 JSON

    if (payloadJson.exp) {
      return payloadJson.exp * 1000; // `exp` 是 Unix 时间戳（秒），需要转换成毫秒
    }
  } catch (error) {
    console.error('Failed to parse token expiration:', error);
  }
  return Date.now(); // 如果解析失败，立即过期
}

async function getToken() {
  const currentTime = Date.now();
  const config = getConfig();
  let cachedToken = config.cachedToken;
  let tokenExpireTime = config.tokenExpireTime;

  // 如果 Token 仍然有效，则直接返回
  if (cachedToken && currentTime < tokenExpireTime) {
    console.log('使用缓存的 token');
    return cachedToken;
  }

  try {
    const response = await fetch('https://edge.microsoft.com/translate/auth');
    const token = await response.text();

    // 解析 `exp` 过期时间
    tokenExpireTime = parseTokenExpireTime(token);
    cachedToken = token; // 更新缓存
    setConfig({ ...config, tokenExpireTime, cachedToken });
    console.log('token过期了，重新获取');
    return token;
  } catch (error) {
    console.error('Error fetching token:', error);
    return Promise.reject('请求失败，无法获取翻译令牌');
  }
}

async function msTranslate(text, from, to) {
  if (from === 'auto') from = '';

  const token = await getToken();
  if (!token) return [];

  const body = [{ Text: text }];

  try {
    const response = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?from=${from}&to=${to}&api-version=3.0`,
      {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log(data);

    return {
      name: 'microsoft',
      from: data[0].detectedLanguage.language,
      to: data[0].translations[0].to,
      dst: data[0].translations[0].text,
      src: text
    };
  } catch (error) {
    console.error('Error fetching translation:', error);
    return Promise.reject(error);
  }
}

export { msTranslate };
