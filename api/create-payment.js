// 这是简化版，先用模拟响应测试部署
// 后面会替换成完整的Billplz + Supabase版本

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { machineId, mode, phone } = req.body;
  
  // 价格配置
  const prices = { cold: 7, warm: 8, hot: 9 };
  const price = prices[mode];
  
  if (!price) {
    return res.status(400).json({ error: 'Invalid mode' });
  }
  
  console.log(`Payment request: Machine ${machineId}, Mode ${mode}, Price RM${price}, Phone ${phone}`);
  
  // TODO: 这里后续会添加：
  // 1. 检查机器状态
  // 2. 创建Billplz账单
  // 3. 保存订单到Supabase
  
  // 临时返回（测试用）
  // 实际Billplz支付URL会从这里返回
  res.json({
    success: true,
    paymentUrl: 'https://billplz-sandbox.com',  // 临时占位
    orderNo: 'TEST_' + Date.now(),
    amount: price
  });
}