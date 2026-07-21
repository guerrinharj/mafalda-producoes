import { notFound } from 'next/navigation'

import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
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

    return (
        <PageContainer>
            <PageHeader
                title={dict.pages.artAndJewelry.title}
            />

            <ProjectCategoryPage
                locale={locale}
                category="art_jewelry"
            />
        </PageContainer>
    )
}