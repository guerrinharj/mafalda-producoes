import Link from 'next/link'

import type { Locale } from '@/lib/dictionaries'

type Props = {
    locale: Locale
    slug: string
}

export default function EditProjectButton({
    locale,
    slug,
}: Props) {
    return (
        <Link
            href={`/${locale}/projetos/${slug}/editar`}
            className="
                uppercase
                transition-opacity
                hover:opacity-50
                text-blue-600
            "
        >
            {locale === 'pt'
                ? 'Editar'
                : 'Edit'}
        </Link>
    )
}