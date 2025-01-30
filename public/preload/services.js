const crypto = require('node:crypto')
const https = require('node:https')

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  MD5(str) {
    return crypto.createHash('md5').update(str).digest('hex')
  },
  /**
   * 将内容进行MD5加密后再进行Base64编码
   * @param {String} str 要加密的字符串
   */
  MD5Base64Encode(str) {
    if (!str) {
      console.log("加密的内容为空！！！");
      return "";
    }
    // 得到MD5的十六进制字符串
    const md5Hash = crypto.createHash('md5').update(str).digest('hex');
    // 将MD5的十六进制字符串转换为Base64编码
    return Buffer.from(md5Hash, 'hex').toString('base64');
  },
  /**
   * 计算 HMAC-SHA1
   * @param {String} data 要加密的数据
   * @param {String} key key值
   */
  HMACSha1(data, key) {
    // 计算HMAC-SHA1
    const md5Hash = crypto.createHmac('sha1', key).update(data).digest();
    // 最终签名
    return Buffer.from(md5Hash, "hex").toString('base64');
  },
  uuid() {
    return crypto.randomUUID();
  },
  /**
   * 为给定的消息生成SHA-256哈希值。
   * 
   * @param {String} message 消息
   * @param {String} [encoding="hex"] 输出哈希的编码格式。默认为"hex"
   * @returns {String | Buffer} 消息的SHA-256哈希值
   */
  getHash(message, encoding = "hex") {
    const hash = crypto.createHash("sha256")
    return hash.update(message).digest(encoding)
  },
  /**
   * 为给定的消息和密钥生成SHA-256 HMAC
   * 
   * @param {String} message 要进行哈希处理的消息。
   * @param {String} secret HMAC的密钥。默认为空字符串。
   * @param {String} encoding 输出哈希的编码格式。如果未指定，则返回一个Buffer对象。
   * @returns {String | Buffer} 消息的HMAC哈希值。
   */
  sha256(message, secret = "", encoding) {
    const hmac = crypto.createHmac("sha256", secret)
    return hmac.update(message).digest(encoding)
  },
  // 由于浏览器的header不可以设置date和host，所以需要使用nodejs的https模块来发送请求
  send(url, data, queryParams = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + (queryParams ? `?${new URLSearchParams(queryParams)}` : ''),
        method: data ? 'POST' : 'GET',
        headers: {
          ...headers,
          'Content-Length': data ? Buffer.byteLength(JSON.stringify(data)) : 0
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }
}
