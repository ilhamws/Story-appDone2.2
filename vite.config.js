import { defineConfig } from 'vite'
import { resolve } from 'path'
import postcssImport from 'postcss-import'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  base: './',
  css: {
    postcss: {
      plugins: [
        postcssImport(),
        autoprefixer()
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})