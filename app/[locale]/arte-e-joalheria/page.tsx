import Link from 'next/link'
import { notFound } from 'next/navigation'

import PageContainer from '@/components/PageContainer'
import ProjectCategoryPage from '@/components/ProjectCategoryPage'

import {
    getDictionary,
    isLocale,
} from '@/lib/dictionaries'

type Props = {
    params: Promise<{
        locale: string
    }>
}

export default async function ArteEJoalheriaPage({
    params,
}: Props) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const dict = getDictionary(locale)

    const requestLabel =
        locale === 'pt'
            ? 'Faça uma solicitação'
            : 'Make a request'

    return (
        <PageContainer>
            <div
                className="
                    flex
                    justify-end
                    absolute
                "
            >
                <Link
                    href={`/${locale}/arte-e-joalheria/solicitacao`}
                    className="
                        border-b
                        border-current
                        pb-1
                        text-sm
                        uppercase
                        tracking-wide
                        transition-opacity
                        hover:opacity-50
                    "
                >
                    {requestLabel}
                </Link>
            </div>

            <ProjectCategoryPage
                locale={locale}
                category="art_jewelry"
            />
        </PageContainer>
    )
}