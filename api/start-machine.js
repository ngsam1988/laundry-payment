export default async function handler(req, res) {
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { key, orderNo, mode, coins, machineId } = req.body;
  
  // 验证 API Key
  if (key !== process.env.ESP32_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // 获取 ESP32 IP 地址
  const esp32Ip = process.env[`ESP32_IP_${machineId}`];
  if (!esp32Ip) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  
  // 发送命令到 ESP32
  const url = `http://${esp32Ip}/start?key=${key}&mode=${mode}&coins=${coins}`;
  
  try {
    const response = await fetch(url);
    const result = await response.text();
    
    res.json({
      success: true,
      message: 'Command sent to ESP32',
      esp32Response: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to communicate with machine',
      details: error.message
    });
  }
}