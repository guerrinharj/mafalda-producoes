'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { Locale } from '@/lib/dictionaries'

type LocaleSwitcherProps = {
    locale: Locale
}

export default function LocaleSwitcher({
    locale,
}: LocaleSwitcherProps) {
    const pathname = usePathname()

    const targetLocale: Locale =
        locale === 'pt' ? 'en' : 'pt'

    const segments = pathname.split('/')

    segments[1] = targetLocale

    const targetPath = segments.join('/') || `/${targetLocale}`

    return (
        <Link
            href={targetPath}
            aria-label={
                locale === 'pt'
                    ? 'View website in English'
                    : 'Ver site em português'
            }
            className="
                relative
                inline-block
                pb-1
                uppercase

                after:absolute
                after:bottom-0
                after:left-0
                after:h-px
                after:w-full
                after:origin-left
                after:scale-x-0
                after:bg-current
                after:transition-transform
                after:duration-300
                after:ease-out

                hover:after:scale-x-100
            "
        >
            {targetLocale}
        </Link>
    )
}