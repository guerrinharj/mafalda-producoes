import { notFound } from 'next/navigation'

import EditProjectForm from '@/components/EditProjectForm'
import { createClient } from '@/lib/supabase/server'
import {
    isLocale,
    type Locale,
} from '@/lib/dictionaries'

type Props = {
    params: Promise<{
        locale: string
        slug: string
    }>
}

export default async function EditProjectPage({
    params,
}: Props) {
    const { locale, slug } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const supabase = await createClient()

    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error || !project) {
        notFound()
    }

    return (
        <EditProjectForm
            project={project}
            locale={locale as Locale}
        />
    )
}