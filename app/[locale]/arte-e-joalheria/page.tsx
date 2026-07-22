import { notFound } from 'next/navigation'

import PageContainer from '@/components/PageContainer'
import PageTransition from '@/components/PageTransition'
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

    getDictionary(locale)

    return (
        <PageContainer>
            <PageTransition>
                <ProjectCategoryPage
                    locale={locale}
                    category="art_jewelry"
                />
            </PageTransition>
        </PageContainer>
    )
}