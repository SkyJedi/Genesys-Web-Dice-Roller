import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'

// The app keeps its JSX in .js files, which Vite's own transform won't parse as JSX.
const jsxInJs = {
  name: 'jsx-in-js',
  enforce: 'pre',
  transform(code, id) {
    if (id.includes('/node_modules/') || !/\/src\/.*\.js$/.test(id)) return null
    return transformWithOxc(code, id, { lang: 'jsx', jsx: { runtime: 'automatic' } })
  },
}

// firebase.json publishes build/.
export default defineConfig({
  plugins: [jsxInJs, react()],
  build: { outDir: 'build' },
  test: { environment: 'jsdom', globals: true },
})
