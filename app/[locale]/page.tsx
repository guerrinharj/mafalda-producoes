import Link from 'next/link'
import { notFound } from 'next/navigation'

import HomeMediaCarousel from '@/components/HomeMediaCarousel'

import {
    getDictionary,
    isLocale,
} from '@/lib/dictionaries'

import { createClient } from '@/lib/supabase/server'

type HomePageProps = {
    params: Promise<{
        locale: string
    }>
}

export default async function HomePage({
    params,
}: HomePageProps) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const dict = getDictionary(locale)

    const supabase = await createClient()

    const { data: projects, error } =
        await supabase
            .from('projects')
            .select('media')
            .order('created_at', {
                ascending: false,
            })

    if (error) {
        console.error(
            'Erro ao buscar mídias dos projetos:',
            error
        )
    }

    const media =
        projects
            ?.flatMap((project) =>
                Array.isArray(project.media)
                    ? project.media
                    : []
            )
            .filter(
                (item): item is string =>
                    typeof item === 'string' &&
                    item.length > 0 &&
                    !isVideo(item)
            ) ?? []

    return (
        <main
            className="
                relative
                flex
                min-h-screen
                w-full
                items-center
                justify-center
                overflow-hidden
                px-6
            "
        >
            <HomeMediaCarousel media={media} />

            <Link
                href={`/${locale}/space-invaders`}
                aria-label={
                    locale === 'pt'
                        ? 'Entrar no Space Invaders'
                        : 'Enter Space Invaders'
                }
                className="
                    group
                    relative
                    z-10
                    block
                    text-center
                    text-[#F4EEDB]
                    outline-none
                "
            >
                <h1
                    className="
                        text-4xl
                        tracking-tight
                        transition-all
                        duration-500
                        ease-out
                        group-hover:scale-[1.03]
                        group-hover:tracking-wider
                        group-focus-visible:scale-[1.03]
                        group-focus-visible:tracking-wider
                        md:text-7xl
                        font-futura-bold
                    "
                >
                    {dict.home.title}
                </h1>

                <span
                    className="
                        mt-3
                        block
                        font-mono
                        text-xs
                        uppercase
                        tracking-[0.3em]
                        opacity-0
                        transition-all
                        duration-500
                        group-hover:translate-y-1
                        group-hover:opacity-100
                        group-focus-visible:translate-y-1
                        group-focus-visible:opacity-100
                        md:text-sm
                    "
                >
                    {locale === 'pt'
                        ? ''
                        : ''}
                </span>
            </Link>
        </main>
    )
}

function isVideo(url: string) {
    const cleanUrl = url
        .split('?')[0]
        .toLowerCase()

    return [
        '.mp4',
        '.mov',
        '.webm',
        '.m4v',
        '.avi',
    ].some((extension) =>
        cleanUrl.endsWith(extension)
    )
}