import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import JavaScriptObfuscator from 'javascript-obfuscator'
import path from 'path'

// Plugin để handle proxy API trong dev mode
const proxyApiPlugin = () => ({
  name: 'proxy-api-plugin',
  configureServer(server) {
    server.middlewares.use('/api/proxy', async (req, res, next) => {
      if (req.method !== 'GET') {
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      const url = new URL(req.url, `http://${req.headers.host}`).searchParams.get('url')
      if (!url) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'URL parameter is required' }))
        return
      }

      try {
        const targetUrl = decodeURIComponent(url)
        const urlObj = new URL(targetUrl)
        
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid protocol' }))
          return
        }

        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          redirect: 'follow',
        })

        if (!response.ok) {
          res.statusCode = response.status
          res.end(JSON.stringify({ error: `Failed to fetch: ${response.statusText}` }))
          return
        }

        const text = await response.text()

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET')
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ 
          contents: text,
          status: {
            url: targetUrl,
            content_type: response.headers.get('content-type'),
            http_code: response.status
          }
        }))
      } catch (error) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: error.message || 'Internal server error' }))
      }
    })
  }
})

const obfuscatePlugin = (options = {}) => ({
  name: 'vite-javascript-obfuscator',
  apply: 'build',
  enforce: 'post',
  generateBundle(_options, bundle) {
    Object.keys(bundle).forEach((fileName) => {
      const chunk = bundle[fileName]
      if (chunk?.type === 'chunk') {
        const obfuscated = JavaScriptObfuscator.obfuscate(chunk.code, options)
        chunk.code = obfuscated.getObfuscatedCode()
      }
    })
  }
})

const enableObfuscation = process.env.VITE_DISABLE_OBFUSCATION !== 'true'

export default defineConfig({
  resolve: {
    alias: {
      'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor')
    }
  },
  plugins: [
    react(),
    proxyApiPlugin(),
    enableObfuscation
      ? obfuscatePlugin({
          compact: true,
          controlFlowFlattening: false, // Tắt để tăng tốc
          controlFlowFlatteningThreshold: 0,
          deadCodeInjection: false, // Tắt để tăng tốc
          debugProtection: false, // Tắt để tăng tốc
          debugProtectionInterval: 0,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false, // Tắt log để tăng tốc
          numbersToExpressions: false, // Tắt để tăng tốc
          renameGlobals: false,
          selfDefending: false, // Tắt để tăng tốc (có thể bật lại nếu cần)
          simplify: true,
          splitStrings: false, // Tắt để tăng tốc
          splitStringsChunkLength: 0,
          stringArray: true,
          stringArrayCallsTransform: false, // Tắt để tăng tốc
          stringArrayCallsTransformThreshold: 0,
          stringArrayEncoding: ['base64'], // Đổi từ rc4 sang base64 (nhanh hơn)
          stringArrayIndexShift: false, // Tắt để tăng tốc
          stringArrayRotate: true,
          stringArrayShuffle: false, // Tắt để tăng tốc
          stringArrayWrappersCount: 1, // Giảm số lượng wrappers
          stringArrayWrappersChainedCalls: false, // Tắt để tăng tốc
          stringArrayWrappersParametersMaxCount: 2,
          stringArrayWrappersType: 'variable',
          stringArrayThreshold: 0.7, // Giảm threshold để tăng tốc
          target: 'browser',
          transformObjectKeys: false, // Tắt để tăng tốc
          unicodeEscapeSequence: false // Tắt để tăng tốc
        })
      : null
  ].filter(Boolean),
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Tắt manual chunks, gom tất cả vào một file
        inlineDynamicImports: true // Gom tất cả dynamic imports vào một chunk
      }
    },
    // Copy Monaco Editor assets vào build output
    copyPublicDir: true
  },
  // Cấu hình để Monaco Editor sử dụng local paths
  optimizeDeps: {
    exclude: ['monaco-editor']
  }
})

