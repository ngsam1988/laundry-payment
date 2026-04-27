export default async function handler(req, res) {
  // 接收 Billplz 的 webhook 通知
  if (req.method === 'POST') {
    const { id, paid_at, state, reference_1, reference_2 } = req.body;
    
    console.log('Webhook received:', { id, state, reference_1, reference_2 });
    
    if (state === 'paid') {
      // 支付成功，通知 ESP32 启动
      const esp32Ip = process.env.ESP32_IP_1 || '192.168.0.153';
      const mode = 'cold'; // 需要从 reference 中解析
      const coins = 7;
      
      try {
        await fetch(`http://${esp32Ip}/start?mode=${mode}&coins=${coins}`);
        console.log('✅ ESP32 started');
      } catch (err) {
        console.error('Failed to start ESP32:', err);
      }
    }
    
    res.status(200).send('OK');
  }
  
  if (req.method === 'GET') {
    // 检查支付状态
    res.json({ paid: false });
  }
}
