// Vercel serverless function để proxy requests và tránh CORS
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

    // Fetch từ URL target
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch: ${response.statusText}` 
      })
    }

    const text = await response.text()

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Content-Type', 'application/json')

    return res.status(200).json({ 
      contents: text,
      status: {
        url: targetUrl,
        content_type: response.headers.get('content-type'),
        http_code: response.status
      }
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    })
  }
}

