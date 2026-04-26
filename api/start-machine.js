// api/start-machine.js - 简化版
export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  
  // 处理 GET 请求（测试用）
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'API is working! Use POST to start machine.' 
    });
  }
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 处理 POST 请求
  if (req.method === 'POST') {
    try {
      const { key, mode, coins, machineId } = req.body || {};
      
      // 验证密钥
      if (key !== 'laundry123') {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      
      // ESP32 的 IP 地址
      const esp32Ip = '192.168.0.153';
      
      // 构建发送给 ESP32 的 URL
      const esp32Url = `http://${esp32Ip}/start?key=${key}&mode=${mode}&coins=${coins}`;
      
      console.log('Sending to ESP32:', esp32Url);
      
      // 发送请求到 ESP32
      const http = require('http');
      
      const result = await new Promise((resolve, reject) => {
        const url = new URL(esp32Url);
        const options = {
          hostname: url.hostname,
          port: 80,
          path: url.pathname + url.search,
          method: 'GET',
          timeout: 3000
        };
        
        const request = http.request(options, (response) => {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => resolve({ status: response.statusCode, data: data.substring(0, 200) }));
        });
        
        request.on('error', (err) => reject(err));
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('Timeout - ESP32 not responding'));
        });
        
        request.end();
      });
      
      return res.json({
        success: true,
        message: 'Command sent to ESP32',
        esp32Response: result.data
      });
      
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({
        error: 'Failed to communicate with ESP32',
        details: error.message
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
