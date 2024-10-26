import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api':{
        target: 'http://3.80.71.14:8081',
        changeOrigin: true,
        rewrite: (path)=>path.replace(/^\/api/,''),
        
      }
    }
  },
  
});
