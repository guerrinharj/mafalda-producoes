import Link from 'next/link'
import { notFound } from 'next/navigation'

import SpaceInvaders from '@/components/SpaceInvaders'

import { isLocale } from '@/lib/dictionaries'

type Props = {
    params: Promise<{
        locale: string
    }>
}

export default async function SpaceInvadersPage({
    params,
}: Props) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    return (
        <main
            className="
                relative
                flex
                min-h-screen
                w-full
                flex-col
                items-center
                justify-center
                overflow-hidden
                bg-black
                px-4
                py-20
                text-[#F4EEDB]
            "
        >
            <Link
                href={`/${locale}`}
                className="
                    fixed
                    left-5
                    top-5
                    z-50
                    font-mono
                    text-xs
                    uppercase
                    tracking-[0.25em]
                    text-[#F4EEDB]
                    transition-opacity
                    hover:opacity-60
                    md:left-8
                    md:top-8
                "
            >
                ← {locale === 'pt' ? 'Voltar' : 'Back'}
            </Link>

            <SpaceInvaders locale={locale} />
        </main>
    )
}