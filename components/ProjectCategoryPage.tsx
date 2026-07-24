import ProjectGrid from '@/components/ProjectGrid'

import type { Locale } from '@/lib/dictionaries'
import { createClient } from '@/lib/supabase/server'

import type {
    Project,
    ProjectCategory,
} from '@/types/database'

type ProjectCategoryPageProps = {
    locale: Locale
    category: ProjectCategory
}

export default async function ProjectCategoryPage({
    locale,
    category,
}: ProjectCategoryPageProps) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('category', category)
        .order('year', {
            ascending: false,
        })
        .order('created_at', {
            ascending: false,
        })

    if (error) {
        console.error(
            'Erro ao buscar projetos:',
            error
        )

        return (
            <p className="text-sm text-red-600">
                Não foi possível carregar os projetos.
            </p>
        )
    }

    const projects = (data ?? []) as Project[]

    return (
        <ProjectGrid
            projects={projects}
            locale={locale}
        />
    )
}