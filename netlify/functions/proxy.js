// netlify/functions/backend-proxy.js
const fetch = require('node-fetch');

// 允许的后端地址
const BACKEND_URL = 'http://1z624868f2.wicp.vip';

exports.handler = async function(event, context) {
  // 1. 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'  // 预检缓存24小时
      },
      body: ''
    };
  }

  // 2. 解析请求路径
  const path = event.path.replace('/.netlify/functions/backend-proxy', '');
  const targetUrl = `${BACKEND_URL}${path}`;
  
  console.log(`代理请求: ${event.httpMethod} ${targetUrl}`);

  try {
    // 3. 构建转发请求的 headers
    const headers = {
      'Content-Type': 'application/json',
      // 可以传递其他需要的头部
    };
    
    // 如果有 Authorization 头，则传递
    if (event.headers.authorization) {
      headers['Authorization'] = event.headers.authorization;
    }

    // 4. 发起请求到后端
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: headers,
      body: event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' 
        ? event.body 
        : undefined,
      // 如果需要，可以设置 timeout
      // timeout: 10000
    });

    // 5. 获取响应数据
    let responseData;
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // 6. 返回响应
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify({
        success: response.ok,
        status: response.status,
        data: responseData
      })
    };

  } catch (error) {
    console.error('代理请求失败:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: '后端服务请求失败'
      })
    };
  }
};