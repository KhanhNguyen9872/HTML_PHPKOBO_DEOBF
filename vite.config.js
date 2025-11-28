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
          controlFlowFlattening: false,
          deadCodeInjection: true,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          renameGlobals: false,
          rotateStringArray: true,
          selfDefending: true,
          simplification: true,
          stringArray: true,
          stringArrayEncoding: ['rc4'],
          stringArrayThreshold: 0.75,
          target: 'browser'
        })
      : null
  ].filter(Boolean),
  build: {
    sourcemap: false,
    minify: 'esbuild'
  }
})

