import Link from 'next/link'

import type { Locale } from '@/lib/dictionaries'

type AddProjectButtonProps = {
    locale: Locale
}

export default function AddProjectButton({
    locale,
}: AddProjectButtonProps) {
    return (
        <Link
            href={`/${locale}/projetos/novo`}
            aria-label={
                locale === 'pt'
                    ? 'Adicionar projeto'
                    : 'Add project'
            }
            className="
                fixed
                right-8
                top-1/2
                z-50
                -translate-y-1/2
                text-5xl
                font-light
                leading-none
                transition-transform
                duration-300
                hover:rotate-90
            "
        >
            +
        </Link>
    )
}