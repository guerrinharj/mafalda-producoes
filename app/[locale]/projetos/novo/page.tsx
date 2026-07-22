import { notFound, redirect } from 'next/navigation'

import NewProjectForm from '@/components/NewProjectForm'
import PageContainer from '@/components/PageContainer'

import {
    isLocale,
    Locale,
} from '@/lib/dictionaries'

import { createClient } from '@/lib/supabase/server'

type Props = {
    params: Promise<{
        locale: string
    }>
}

export default async function NewProjectPage({
    params,
}: Props) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/${locale}/login`)
    }

    return (
        <PageContainer>
            <main
                className="
                    min-h-screen
                    px-6
                    pb-24
                    pt-32
                    md:px-12
                "
            >
                <header className="mb-16">
                    <h1
                        className="
                            text-4xl
                            leading-none
                            md:text-7xl
                        "
                    >
                        {locale === 'pt'
                            ? 'Adicionar projeto'
                            : 'Add project'}
                    </h1>
                </header>

                <NewProjectForm
                    locale={locale as Locale}
                />
            </main>
        </PageContainer>
    )
}