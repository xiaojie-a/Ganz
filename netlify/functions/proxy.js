// netlify/functions/proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { path, method, body } = JSON.parse(event.body);
    const targetUrl = `http://1z624868f2.wicp.vip/api/${path}`;
    
    try {
        const response = await fetch(targetUrl, {
            method: method || 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : null
        });
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};