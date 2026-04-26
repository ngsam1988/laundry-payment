export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'API is working! Use POST to start machine.',
      esp32Ip: process.env.ESP32_IP_1 || 'Not configured'
    });
  }
  
  if (req.method === 'POST') {
    try {
      const { key, mode, coins, machineId } = req.body;
      
      if (key !== 'laundry123') {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      
      // 获取 ESP32 IP 地址（从环境变量）
      const esp32Ip = process.env.ESP32_IP_1 || '192.168.0.153';
      
      // 发送命令到 ESP32
      const url = `http://${esp32Ip}/start?mode=${mode}&coins=${coins}`;
      
      // 使用 Node.js 内置的 http 模块
      const http = require('http');
      
      const result = await new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
          hostname: urlObj.hostname,
          port: 80,
          path: urlObj.pathname + urlObj.search,
          method: 'GET',
          timeout: 3000
        };
        
        const request = http.request(options, (response) => {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => {
            resolve({ status: response.statusCode, data: data.substring(0, 200) });
          });
        });
        
        request.on('error', (err) => reject(err));
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('ESP32 not responding'));
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
