import { notFound } from 'next/navigation'

import Navbar from '@/components/Navbar'
import {
    isLocale,
    locales,
} from '@/lib/dictionaries'

type LocaleLayoutProps = {
    children: React.ReactNode
    params: Promise<{
        locale: string
    }>
}

export function generateStaticParams() {
    return locales.map((locale) => ({
        locale,
    }))
}

export default async function LocaleLayout({
    children,
    params,
}: LocaleLayoutProps) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    return (
        <>
            <Navbar locale={locale} />

            {children}
        </>
    )
}