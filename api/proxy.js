// Vercel serverless function để proxy requests và tránh CORS
import axios from 'axios'

export default async function handler(req, res) {
  // Chỉ cho phép GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  try {
    // Validate URL
    const targetUrl = decodeURIComponent(url)
    const urlObj = new URL(targetUrl)
    
    // Chỉ cho phép HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol' })
    }

    // Fetch từ URL target bằng axios
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
      responseType: 'text',
      validateStatus: (status) => status < 500, // Chấp nhận tất cả status < 500
    })

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Content-Type', 'application/json')

    return res.status(200).json({ 
      contents: response.data,
      status: {
        url: targetUrl,
        content_type: response.headers['content-type'],
        http_code: response.status
      }
    })
  } catch (error) {
    console.error('Proxy error:', error)
    
    // Xử lý lỗi từ axios
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: `Failed to fetch: ${error.response.statusText}` 
      })
    }
    
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    })
  }
}

