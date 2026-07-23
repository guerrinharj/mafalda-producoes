import { notFound } from 'next/navigation'

import PageContainer from '@/components/PageContainer'
import RequestForm from '@/components/RequestForm'

import {
    getDictionary,
    isLocale,
} from '@/lib/dictionaries'

type Props = {
    params: Promise<{
        locale: string
    }>
}

export default async function RequestPage({
    params,
}: Props) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const dict = getDictionary(locale)

    const content =
        locale === 'pt'
            ? {
                    title: 'Faça uma solicitação',
                    description:
                        'Conte um pouco sobre o projeto, peça ou trabalho que você gostaria de desenvolver.',
                }
                : {
                    title: 'Make a request',
                    description:
                        'Tell us about the project, piece or work you would like to develop.',
                }

    return (
        <PageContainer>
            <section
                className="
                    flex
                    min-h-screen
                    justify-center
                    px-6
                    pb-24
                    pt-32
                    md:px-12
                "
            >
                <div
                    className="
                        flex
                        w-full
                        max-w-3xl
                        flex-col
                        items-center
                        gap-12
                    "
                >
                    <header className="w-full text-center">
                        <h1
                            className="
                                text-5xl
                                leading-none
                                md:text-7xl
                            "
                        >
                            {content.title}
                        </h1>

                        <p
                            className="
                                mx-auto
                                mt-6
                                max-w-xl
                                text-base
                                leading-relaxed
                                opacity-70
                            "
                        >
                            {content.description}
                        </p>
                    </header>

                    <RequestForm />
                </div>
            </section>
        </PageContainer>
    )
}