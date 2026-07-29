// app/[locale]/sobre/page.tsx

import { notFound } from 'next/navigation'
import Image from 'next/image'

import PageTransition from '@/components/PageTransition'

import {
    isLocale,
    type Locale,
} from '@/lib/dictionaries'

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
            <main className="relative min-h-screen overflow-hidden">
                {/* Background */}
                <Image
                    src="images/mafaldahi.png"
                    alt="Mafalda"
                    fill
                    priority
                    className="object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/65" />

                {/* Content */}
                <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-8 py-32">
                    <div className="max-w-2xl text-[#F4EEDB]">
                        <div className="space-y-6 text-base leading-relaxed md:text-lg">
                        {isPortuguese ? (
                            <>
                            <p>
                                Marcela Ramos, mais conhecida como <strong>Mafalda</strong>,
                                é mulher, negra e bissexual, CEO e fundadora da{' '}
                                <strong>MAFALDA PRODUÇÕES LTDA</strong>, produtora
                                especializada na execução de projetos criativos de alta
                                complexidade.
                            </p>

                            <p>
                                Atua nos eixos de criação, atendimento, gestão de clientes e
                                produção 360°, desenvolvendo projetos de ponta a ponta e
                                transformando ideias em experiências concretas.
                            </p>

                            <p>
                                Estudou Artes Visuais e Ciências Sociais nas universidades
                                federais FURG e UFRJ, construindo uma trajetória voltada para
                                conectar criatividade, estratégia e execução.
                            </p>

                            <p>
                                Ao longo da carreira trabalhou com marcas como BATEKOO,
                                Red Bull, Everyday People, The Coca-Cola Company e GE by
                                Camila Coutinho, assinando ativações, campanhas e projetos
                                para festivais de reconhecimento internacional como The
                                Town, Lollapalooza, Tomorrowland e SWU.
                            </p>

                            <p>
                                No mercado audiovisual, desenvolveu campanhas publicitárias,
                                documentários, realities e produções nacionais para clientes
                                como HBO, Netflix e YouTube Creators.
                            </p>
                            </>
                        ) : (
                            <>
                            <p>
                                Marcela Ramos, better known as <strong>Mafalda</strong>, is
                                a Black, bisexual woman, founder and CEO of{' '}
                                <strong>MAFALDA PRODUÇÕES LTDA</strong>, a production company
                                specializing in the execution of high-complexity creative
                                projects.
                            </p>

                            <p>
                                Working across creative direction, client management, and
                                end-to-end production, she leads 360° projects from concept
                                to delivery, transforming ideas into fully realized
                                experiences.
                            </p>

                            <p>
                                Mafalda studied Visual Arts and Social Sciences at the
                                Brazilian federal universities FURG and UFRJ, developing a
                                multidisciplinary practice centered on turning creative
                                concepts into tangible results.
                            </p>

                            <p>
                                Throughout her career, she has collaborated with brands such
                                as BATEKOO, Red Bull, Everyday People, The Coca-Cola
                                Company, and GE by Camila Coutinho, leading activations,
                                campaigns, and productions for internationally recognized
                                festivals including The Town, Lollapalooza, Tomorrowland,
                                and SWU.
                            </p>

                            <p>
                                In the audiovisual industry, she has produced advertising
                                campaigns, documentaries, reality shows, and national
                                productions for clients including HBO, Netflix, and YouTube
                                Creators.
                            </p>
                            </>
                        )}
                        </div>

                        {/* Contact */}
                        <div className="mt-12 border-t border-[#F4EEDB]/20 pt-8">
                            <h2 className="mb-5 text-sm uppercase tracking-[0.3em] opacity-70">
                                {isPortuguese ? 'Contato' : 'Contact'}
                            </h2>

                            <div className="space-y-3 text-base">
                                <a
                                    href="mailto:mafaldaproducoesltda@gmail.com"
                                    className="block transition-opacity hover:opacity-70"
                                    >
                                    mafaldaproducoesltda@gmail.com
                                </a>

                                <a
                                    href="tel:+5511974794834"
                                    className="block transition-opacity hover:opacity-70"
                                    >
                                    +55 11 97479-4834
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PageTransition>
    )
}