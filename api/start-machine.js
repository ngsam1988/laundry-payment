// api/start-machine.js
export default async function handler(req, res) {
  // 记录请求方法和URL，方便查日志
  console.log(`[LOG] Method: ${req.method}, URL: ${req.url}`);
  
  // 设置CORS（允许浏览器调用）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 处理GET请求（用于测试函数是否正常）
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'API function is working!',
      timestamp: Date.now(),
      note: 'Use POST to start machine'
    });
  }
  
  // 处理POST请求
  if (req.method === 'POST') {
    try {
      const { key, mode, coins, machineId } = req.body;
      
      // 验证API Key
      if (key !== 'laundry123') {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      
      // 这里直接返回成功，先不连接ESP32，测试函数本身是否正常
      return res.json({
        success: true,
        message: 'API received command',
        received: { key, mode, coins, machineId }
      });
      
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
