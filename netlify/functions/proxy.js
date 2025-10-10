// netlify/functions/proxy.js
const fetch = require('node-fetch');

const BACKEND_URL = 'http://54.211.172.19:3000';

exports.handler = async (event, context) => {
  // 只允许特定的 HTTP 方法
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  
  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // 处理 CORS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // 从路径中提取 API 路径
    // 例如: /.netlify/functions/proxy/login -> /api/login
    const path = event.path.replace('/.netlify/functions/proxy', '/api');
    
    const url = `${BACKEND_URL}${path}`;
    
    // 构建请求选项
    const options = {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // 如果有请求体,添加到选项中
    if (event.body) {
      options.body = event.body;
    }

    console.log(`Proxying ${event.httpMethod} request to: ${url}`);

    // 发送请求到后端
    const response = await fetch(url, options);
    const data = await response.text();

    // 返回响应
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: data
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to proxy request',
        message: error.message 
      })
    };
  }
};
