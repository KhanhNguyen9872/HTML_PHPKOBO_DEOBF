import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import JavaScriptObfuscator from 'javascript-obfuscator'

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
  plugins: [
    react(),
    enableObfuscation
      ? obfuscatePlugin({
          compact: true,
          controlFlowFlattening: false, // Tắt để tăng tốc
          controlFlowFlatteningThreshold: 0,
          deadCodeInjection: true, // Tắt để tăng tốc
          debugProtection: false, // Tắt để tăng tốc
          debugProtectionInterval: 0,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false, // Tắt log để tăng tốc
          numbersToExpressions: false, // Tắt để tăng tốc
          renameGlobals: false,
          selfDefending: true, // Tắt để tăng tốc (có thể bật lại nếu cần)
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
          stringArrayThreshold: 0.75, // Giảm threshold để tăng tốc
          target: 'browser',
          transformObjectKeys: false, // Tắt để tăng tốc
          unicodeEscapeSequence: false // Tắt để tăng tốc
        })
      : null
  ].filter(Boolean),
  build: {
    sourcemap: false,
    minify: 'esbuild'
  }
})

