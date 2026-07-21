import type { Locale } from '@/lib/dictionaries'
import type { Project } from '@/types/database'

import ProjectCard from './ProjectCard'

type ProjectGridProps = {
    projects: Project[]
    locale: Locale
}

export default function ProjectGrid({
    projects,
    locale,
}: ProjectGridProps) {
    if (projects.length === 0) {
        return null
    }

    return (
        <div
            className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-x-8
                gap-y-16
            "
        >
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    locale={locale}
                />
            ))}
        </div>
    )
}