// netlify/functions/proxy.js
// 使用动态 import 代替 require
exports.handler = async function(event, context) {
  try {
    // 动态导入 ES Module
    const fetch = (await import('node-fetch')).default;
    
    // 处理 OPTIONS 预检请求
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        },
        body: ''
      };
    }

    // ... 其余代码保持不变
    const path = event.path.replace('/.netlify/functions/proxy', '');
    const targetUrl = `http://nodecanvas.w1.luyouxia.net${path}`;
    
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json'
      },
      body: event.httpMethod !== 'GET' ? event.body : undefined
    });
    
    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: data
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};