import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Tudo que começar com /PostCriarEstado vai para localhost:8080
      '/PostCriarEstado': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Se quiser proxy para outras rotas, adicione aqui
    },
  },
});
