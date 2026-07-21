import { notFound } from 'next/navigation'

import {
    isLocale,
    type Locale,
} from '@/lib/dictionaries'

type LocaleLayoutProps = {
    children: React.ReactNode
    params: Promise<{
        locale: string
    }>
}

export function generateStaticParams() {
    return [
        { locale: 'pt' },
        { locale: 'en' },
    ]
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
        <div data-locale={locale as Locale}>
            {children}
        </div>
    )
}