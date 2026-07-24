import type { Metadata } from 'next'
import localFont from 'next/font/local'

import './globals.css'

const franklinGothic = localFont({
  src: './fonts/FranklinGothic.ttf',
  variable: '--font-franklin-gothic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mafalda Produções',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${franklinGothic.variable} h-full antialiased`}
    >
      <body
        className={`
          flex
          min-h-screen
          flex-col
          bg-black
          text-[#F4EEDB]
          [font-family:monospace]
        `}
      >
        {children}
      </body>
    </html>
  )
}