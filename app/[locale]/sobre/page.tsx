// app/[locale]/sobre/page.tsx

import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
    Mail,
    Phone,
} from 'lucide-react'

import PageTransition from '@/components/PageTransition'

import { isLocale } from '@/lib/dictionaries'

type Props = {
    params: Promise<{
        locale: string
    }>
}

export default async function AboutPage({
    params,
}: Props) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const isPortuguese = locale === 'pt'

    return (
        <PageTransition>
            <main className="relative min-h-screen w-full overflow-hidden">
                <div className="fixed inset-0 -z-20">
                    <Image
                        src="/images/mafaldahi.png"
                        alt="Mafalda"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </div>

                <div className="fixed inset-0 -z-10 bg-black/55" />

                <section
                    className="
                        relative
                        z-10
                        flex
                        min-h-screen
                        w-full
                        items-end
                        px-6
                        pb-12
                        pt-32
                        md:px-10
                        md:pb-16
                        lg:px-16
                    "
                >
                    <div className="w-full max-w-3xl text-[#F4EEDB]">
                        <div className="space-y-5 text-sm leading-relaxed md:text-base">
                            {isPortuguese ? (
                                <>
                                    <p>
                                        Marcela Ramos, mais
                                        conhecida como{' '}
                                        <strong>
                                            Mafalda
                                        </strong>
                                        , é mulher, negra e
                                        bissexual, CEO e
                                        criadora da{' '}
                                        <strong>
                                            MAFALDA PRODUÇÕES
                                            LTDA
                                        </strong>
                                        , produtora
                                        especializada na
                                        execução de projetos
                                        de alta complexidade.
                                    </p>

                                    <p>
                                        Atua nos eixos de
                                        criação, atendimento e
                                        gestão de clientes,
                                        com foco em produções
                                        360 graus,
                                        desenvolvendo projetos
                                        de ponta a ponta.
                                    </p>

                                    <p>
                                        É, em suma, uma
                                        realizadora. Estudou
                                        Artes Visuais e
                                        Ciências Sociais nas
                                        universidades federais
                                        FURG e UFRJ e se
                                        especializou em
                                        transformar ideias em
                                        realidade material.
                                    </p>

                                    <p>
                                        Atuou com marcas como
                                        BATEKOO, Red Bull,
                                        Everyday People, The
                                        Coca-Cola Company e GE
                                        by Camila Coutinho,
                                        assinando ativações,
                                        projetos e campanhas
                                        em festivais de renome
                                        internacional, como
                                        The Town,
                                        Lollapalooza,
                                        Tomorrowland e SWU.
                                    </p>

                                    <p>
                                        No mercado
                                        audiovisual, assinou
                                        campanhas
                                        publicitárias,
                                        campanhas nacionais,
                                        documentários e reality
                                        shows, com destaque
                                        para projetos
                                        realizados para HBO,
                                        Netflix e YouTube
                                        Creators.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p>
                                        Marcela Ramos, better
                                        known as{' '}
                                        <strong>
                                            Mafalda
                                        </strong>
                                        , is a Black, bisexual
                                        woman and the founder
                                        and CEO of{' '}
                                        <strong>
                                            MAFALDA PRODUÇÕES
                                            LTDA
                                        </strong>
                                        , a production company
                                        specializing in the
                                        execution of
                                        high-complexity
                                        projects.
                                    </p>

                                    <p>
                                        She works across
                                        creation, client
                                        service, and client
                                        management, with a
                                        focus on 360-degree
                                        productions developed
                                        from concept to final
                                        delivery.
                                    </p>

                                    <p>
                                        Above all, she is a
                                        producer and
                                        creative force.
                                        Mafalda studied Visual
                                        Arts and Social
                                        Sciences at the
                                        Brazilian federal
                                        universities FURG and
                                        UFRJ, specializing in
                                        transforming ideas
                                        into tangible
                                        realities.
                                    </p>

                                    <p>
                                        She has worked with
                                        brands including
                                        BATEKOO, Red Bull,
                                        Everyday People, The
                                        Coca-Cola Company, and
                                        GE by Camila Coutinho,
                                        delivering activations,
                                        projects, and campaigns
                                        for internationally
                                        recognized festivals
                                        such as The Town,
                                        Lollapalooza,
                                        Tomorrowland, and SWU.
                                    </p>

                                    <p>
                                        In the audiovisual
                                        industry, she has
                                        produced advertising
                                        campaigns, nationwide
                                        campaigns,
                                        documentaries, and
                                        reality shows, with
                                        notable projects for
                                        HBO, Netflix, and
                                        YouTube Creators.
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="mt-10 flex flex-col gap-3 border-t border-[#F4EEDB]/30 pt-6 text-sm md:flex-row md:gap-8">
                            <a
                                href="mailto:mafaldaproducoesltda@gmail.com"
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    transition-opacity
                                    hover:opacity-60
                                "
                            >
                                <Mail
                                    size={19}
                                    strokeWidth={1.5}
                                />

                                <span>
                                    mafaldaproducoesltda@gmail.com
                                </span>
                            </a>

                            <a
                                href="tel:+5511974794834"
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    transition-opacity
                                    hover:opacity-60
                                "
                            >
                                <Phone
                                    size={19}
                                    strokeWidth={1.5}
                                />

                                <span>
                                    +55 11 97479-4834
                                </span>
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    )
}