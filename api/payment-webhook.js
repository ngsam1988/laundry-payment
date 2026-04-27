// api/payment-webhook.js
export default async function handler(req, res) {
  // 验证 X-Signature
  const receivedSignature = req.headers['x-signature'];
  const { id, paid_at, state, reference_1, reference_2 } = req.body;
  
  // 这里可以验证签名
  // const expectedSignature = crypto.createHmac('sha256', process.env.BILLPLZ_X_SIGNATURE_KEY).update(JSON.stringify(req.body)).digest('hex');
  
  if (state === 'paid') {
    console.log(`✅ Payment received for order: ${reference_1}, machine: ${reference_2}`);
    
    // 获取订单信息中的模式
    // 这里需要从数据库或直接解析 mode
    
    // 发送命令到 ESP32
    const mode = 'cold'; // 需要从数据库获取
    const coins = { cold: 7, warm: 8, hot: 9 }[mode];
    const esp32Ip = process.env.ESP32_IP_1;
    
    if (esp32Ip) {
      try {
        await fetch(`http://${esp32Ip}/start?mode=${mode}&coins=${coins}`);
        console.log('✅ ESP32 started');
      } catch (err) {
        console.error('Failed to start ESP32:', err);
      }
    }
  }
  
  res.status(200).send('OK');
}
