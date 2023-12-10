import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Contract Simplifier',
  description: 'Smart Contract Simplifier',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='h-[100vh]'>
      <body className={`${inter.className}` + 'h-[100vh]'}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}

