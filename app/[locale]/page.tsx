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
                items-center
                justify-center
                overflow-hidden
                px-6
            "
        >
            <HomeMediaCarousel media={media} />

            <h1
                className="
                    relative
                    z-10
                    text-center
                    text-4xl
                    font-franklin
                    tracking-tight
                    text-[#F4EEDB]
                    mix-blend-difference
                    md:text-7xl
                "
            >
                {dict.home.title}
            </h1>
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