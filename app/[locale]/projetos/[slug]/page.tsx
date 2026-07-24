import { notFound } from 'next/navigation'
import Link from 'next/link'

import PageContainer from '@/components/PageContainer'
import EditProjectButton from '@/components/EditProjectButton'
import DeleteProjectButton from '@/components/DeleteProjectButton'

import {
    isLocale,
    type Locale,
} from '@/lib/dictionaries'

import { createClient } from '@/lib/supabase/server'

type Props = {
    params: Promise<{
        locale: string
        slug: string
    }>
}

type Project = {
    id: string
    name_pt: string
    name_en: string | null
    slug: string
    category: string
    year: string | null
    media: string[] | null
    description_pt: string | null
    description_en: string | null
    is_featured: boolean
}

function isVideo(url: string) {
    const cleanUrl = url
        .split('?')[0]
        .toLowerCase()

    return [
        '.mp4',
        '.webm',
        '.mov',
        '.m4v',
    ].some((extension) =>
        cleanUrl.endsWith(extension)
    )
}

export default async function ProjectPage({
    params,
}: Props) {
    const {
        locale,
        slug,
    } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const supabase = await createClient()

    const {
        data: project,
        error,
    } = await supabase
        .from('projects')
        .select(`
            id,
            name_pt,
            name_en,
            slug,
            category,
            year,
            media,
            description_pt,
            description_en,
            is_featured
        `)
        .eq('slug', slug)
        .single<Project>()

    if (error || !project) {
        notFound()
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const projectName =
        locale === 'pt'
            ? project.name_pt
            : project.name_en ||
              project.name_pt

    const description =
        locale === 'pt'
            ? project.description_pt
            : project.description_en ||
              project.description_pt

    const media = project.media ?? []

    return (
        <PageContainer>
            <main
                className="
                    min-h-screen
                    px-6
                    pb-24
                    md:px-12
                "
            >

            {media.length > 0 && (
                    <section
                        className="
                            mx-auto
                            flex
                            w-full
                            max-w-6xl
                            flex-col
                            gap-8
                        "
                    >
                        {media.map(
                            (mediaUrl, index) => (
                                <div
                                    key={`${mediaUrl}-${index}`}
                                    className="
                                        w-full
                                        overflow-hidden
                                    "
                                >
                                    {isVideo(
                                        mediaUrl
                                    ) ? (
                                        <video
                                            src={
                                                mediaUrl
                                            }
                                            controls
                                            playsInline
                                            preload="metadata"
                                            className="
                                                h-auto
                                                w-full
                                                object-cover
                                            "
                                        />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={
                                                mediaUrl
                                            }
                                            alt={`${projectName} ${index + 1}`}
                                            className="
                                                h-auto
                                                w-full
                                                object-cover
                                            "
                                        />
                                    )}
                                </div>
                            )
                        )}
                    </section>
                )}

                <header
                    className="
                        mx-auto
                        mb-16
                        mt-8
                        flex
                        w-full
                        max-w-6xl
                        flex-col
                        gap-6
                    "
                >
                    <div
                        className="
                            flex
                            items-start
                            justify-between
                            gap-6
                        "
                    >
                        <h1
                            className="
                                text-4xl
                                font-franklin
                                leading-none
                                md:text-6xl
                            "
                        >
                            {projectName}
                        </h1>

                        {user && (
                            <EditProjectButton
                                locale={
                                    locale as Locale
                                }
                                slug={project.slug}
                            />
                        )}

                        {user && (
                            <DeleteProjectButton
                                locale={locale as Locale}
                                id={project.id}
                                slug={project.slug}
                            />
                            )}
                    </div>

                    <div
                        className="
                            flex
                            flex-wrap
                            gap-x-8
                            gap-y-2
                            text-sm
                        "
                    >

                        {project.year && (
                            <span>
                                {project.year}
                            </span>
                        )}
                    </div>

                    {description && (
                        <p
                            className="
                                max-w-3xl
                                whitespace-pre-line
                                leading-relaxed
                            "
                        >
                            {description}
                        </p>
                    )}
                </header>

                

                <Link
                    href={`/${locale}/projetos`}
                    className="
                        mt-16
                        inline-block
                        text-sm
                        uppercase
                        transition-opacity
                        hover:opacity-50
                    "
                >
                    {locale === 'pt'
                        ? ''
                        : ''}
                </Link>
            </main>
        </PageContainer>
    )
}