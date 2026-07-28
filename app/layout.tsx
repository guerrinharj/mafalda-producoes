import type { Metadata } from 'next'
import localFont from 'next/font/local'

import CustomCursor from '@/components/CustomCursor'

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

type RootLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default function RootLayout({
    children,
}: RootLayoutProps) {
    return (
        <html
            lang="pt-BR"
            className={`
                ${franklinGothic.variable}
                h-full
                antialiased
            `}
        >
            <body
                className="
                    flex
                    min-h-screen
                    flex-col
                    bg-black
                    text-[#F4EEDB]
                    [font-family:monospace]
                "
            >
                {children}

                <CustomCursor />
            </body>
        </html>
    )
}