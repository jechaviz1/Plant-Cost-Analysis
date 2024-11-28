import type { DepOptimizationOptions } from 'vite';

export const depsConfig: DepOptimizationOptions = {
  include: [
    'react',
    'react-dom',
    'recharts',
    'javascript-lp-solver',
    'firebase/app',
    'firebase/auth',
    'firebase/firestore',
    'lucide-react'
  ],
  exclude: ['@vitejs/plugin-react']
};