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

            <SpaceInvaders locale={locale} />
        </main>
    )
}