import { notFound } from 'next/navigation'

import PageContainer from '@/components/PageContainer'
import RequestForm from '@/components/RequestForm'

import {
    getDictionary,
    isLocale,
} from '@/lib/dictionaries'
import { createClient } from '@/lib/supabase/server'

type Props = {
    params: Promise<{
        locale: string
    }>
}

type Request = {
    id: string
    name: string
    email: string
    request: string
    status: string
    created_at: string
    updated_at: string
}

const statusLabels = {
    pt: {
        new: 'Nova',
        in_progress: 'Em andamento',
        completed: 'Concluída',
        archived: 'Arquivada',
    },
    en: {
        new: 'New',
        in_progress: 'In progress',
        completed: 'Completed',
        archived: 'Archived',
    },
}

export default async function RequestPage({
    params,
}: Props) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const dict = getDictionary(locale)
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let requests: Request[] = []

    if (user) {
        const { data, error } = await supabase
            .from('requests')
            .select(
                `
                    id,
                    name,
                    email,
                    request,
                    status,
                    created_at,
                    updated_at
                `
            )
            .order('created_at', {
                ascending: false,
            })

        if (error) {
            console.error(
                'Erro ao buscar solicitações:',
                error
            )
        } else {
            requests = data ?? []
        }
    }

    const content =
        locale === 'pt'
            ? {
                  title: 'Faça uma solicitação',
                  description:
                      'Conte um pouco sobre o projeto, peça ou trabalho que você gostaria de desenvolver.',
                  requestsTitle: 'Solicitações recebidas',
                  emptyRequests:
                      'Nenhuma solicitação foi recebida até o momento.',
                  requestedBy: 'Solicitado por',
                  createdAt: 'Enviado em',
                  status: 'Status',
              }
            : {
                  title: 'Make a request',
                  description:
                      'Tell us about the project, piece or work you would like to develop.',
                  requestsTitle: 'Received requests',
                  emptyRequests:
                      'No requests have been received yet.',
                  requestedBy: 'Requested by',
                  createdAt: 'Submitted on',
                  status: 'Status',
              }

    const labels = statusLabels[locale]

    return (
        <PageContainer>
            <section
                className="
                    flex
                    min-h-screen
                    justify-center
                    px-6
                    pb-24
                    pt-8
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
                        gap-16
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

                    {user && (
                        <section
                            className="
                                flex
                                w-full
                                flex-col
                                gap-8
                                border-t
                                border-current
                                pt-12
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-end
                                    justify-between
                                    gap-6
                                "
                            >
                                <h2
                                    className="
                                        text-3xl
                                        leading-none
                                        md:text-5xl
                                    "
                                >
                                    {content.requestsTitle}
                                </h2>

                                <span
                                    className="
                                        text-sm
                                        opacity-60
                                    "
                                >
                                    {requests.length}
                                </span>
                            </div>

                            {requests.length === 0 ? (
                                <p className="text-sm opacity-60">
                                    {content.emptyRequests}
                                </p>
                            ) : (
                                <div className="flex flex-col">
                                    {requests.map((item) => {
                                        const createdAt =
                                            new Intl.DateTimeFormat(
                                                locale === 'pt'
                                                    ? 'pt-BR'
                                                    : 'en-US',
                                                {
                                                    dateStyle:
                                                        'medium',
                                                    timeStyle:
                                                        'short',
                                                    timeZone:
                                                        'America/Sao_Paulo',
                                                }
                                            ).format(
                                                new Date(
                                                    item.created_at
                                                )
                                            )

                                        const statusLabel =
                                            labels[
                                                item.status as keyof typeof labels
                                            ] ?? item.status

                                        return (
                                            <article
                                                key={item.id}
                                                className="
                                                    flex
                                                    flex-col
                                                    gap-6
                                                    border-b
                                                    border-current
                                                    py-8
                                                "
                                            >
                                                <div
                                                    className="
                                                        flex
                                                        flex-col
                                                        justify-between
                                                        gap-4
                                                        md:flex-row
                                                        md:items-start
                                                    "
                                                >
                                                    <div>
                                                        <h3
                                                            className="
                                                                text-2xl
                                                                leading-tight
                                                            "
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </h3>

                                                        <a
                                                            href={`mailto:${item.email}`}
                                                            className="
                                                                mt-1
                                                                inline-block
                                                                text-sm
                                                                underline
                                                                underline-offset-4
                                                                opacity-60
                                                                transition-opacity
                                                                hover:opacity-100
                                                            "
                                                        >
                                                            {
                                                                item.email
                                                            }
                                                        </a>
                                                    </div>

                                                    <span
                                                        className="
                                                            w-fit
                                                            border
                                                            border-current
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            uppercase
                                                            tracking-wide
                                                        "
                                                    >
                                                        {
                                                            statusLabel
                                                        }
                                                    </span>
                                                </div>

                                                <p
                                                    className="
                                                        whitespace-pre-wrap
                                                        text-base
                                                        leading-relaxed
                                                    "
                                                >
                                                    {item.request}
                                                </p>

                                                <div
                                                    className="
                                                        flex
                                                        flex-col
                                                        gap-1
                                                        text-xs
                                                        opacity-50
                                                        md:flex-row
                                                        md:gap-6
                                                    "
                                                >
                                                    <span>
                                                        {
                                                            content.createdAt
                                                        }
                                                        : {createdAt}
                                                    </span>

                                                    <span>
                                                        ID: {item.id}
                                                    </span>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </section>
        </PageContainer>
    )
}