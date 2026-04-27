// api/create-payment.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { machineId, mode, userPhone } = req.body;
  
  // 价格配置
  const prices = { cold: 7, warm: 8, hot: 9 };
  const amount = prices[mode];
  const amountInCent = amount * 100; // Billplz 使用分 (cent)
  
  if (!amount) return res.status(400).json({ error: 'Invalid mode' });
  
  // 生成订单号
  const orderNo = `LAUNDRY${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  // Billplz 沙盒 API
  const billplzApiUrl = 'https://www.billplz-sandbox.com/api/v3/bills';
  
  const billplzData = new URLSearchParams({
    collection_id: process.env.BILLPLZ_COLLECTION_ID,
    email: `${userPhone}@sandbox.com`,
    name: `Laundry Machine ${machineId}`,
    amount: amountInCent.toString(),
    callback_url: `https://laundry-payment.vercel.app/api/payment-webhook`,
    redirect_url: `https://laundry-payment.vercel.app/payment-status`,
    description: `${mode.toUpperCase()} wash - Machine ${machineId}`,
    reference_1: orderNo,
    reference_2: machineId.toString()
  });
  
  try {
    const auth = Buffer.from(process.env.BILLPLZ_API_KEY + ':').toString('base64');
    
    const response = await fetch(billplzApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: billplzData
    });
    
    const data = await response.json();
    
    if (data.url) {
      res.json({
        success: true,
        paymentUrl: data.url,
        orderNo: orderNo,
        amount: amount
      });
    } else {
      console.error('Billplz error:', data);
      res.status(500).json({ error: 'Failed to create bill', details: data });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
