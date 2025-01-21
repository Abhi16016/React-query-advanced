import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


export const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <QueryClientProvider client={queryClient}>
  <StrictMode>
    <ReactQueryDevtools initialIsOpen={false} />
    <App />
  </StrictMode>
  </QueryClientProvider>
  </BrowserRouter>
)
