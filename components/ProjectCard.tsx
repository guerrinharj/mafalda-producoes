import Image from 'next/image'
import Link from 'next/link'

import type { Locale } from '@/lib/dictionaries'
import type { Project } from '@/types/database'

type ProjectCardProps = {
    project: Project
    locale: Locale
}

export default function ProjectCard({
    project,
    locale,
}: ProjectCardProps) {
    const title =
        locale === 'en' && project.name_en
            ? project.name_en
            : project.name_pt

    const cover = project.media?.[0]

    return (
        <Link
            href={`/${locale}/projetos/${project.slug}`}
            className="group block"
        >
            <div
                className="
                    relative
                    aspect-[4/3]
                    overflow-hidden
                    bg-neutral-100
                "
            >
                {cover ? (
                    <Image
                        src={cover}
                        alt={title}
                        fill
                        sizes="
                            (max-width:768px) 100vw,
                            (max-width:1200px) 50vw,
                            33vw
                        "
                        className="
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-[1.02]
                        "
                    />
                ) : (
                    <div
                        className="
                            flex
                            h-full
                            items-center
                            justify-center
                            text-sm
                            text-neutral-400
                        "
                    >
                        Sem imagem
                    </div>
                )}
            </div>

            <div
                className="
                    mt-4
                    flex
                    items-start
                    justify-between
                    gap-6
                "
            >
                <h2
                    className="
                        text-xl
                        leading-tight
                    "
                >
                    {title}
                </h2>

                {project.year && (
                    <span
                        className="
                            shrink-0
                            text-sm
                            text-neutral-500
                        "
                    >
                        {project.year}
                    </span>
                )}
            </div>
        </Link>
    )
}