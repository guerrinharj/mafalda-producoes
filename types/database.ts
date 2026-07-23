export type ProjectCategory =
    | 'events'
    | 'audiovisual'
    | 'art_jewelry'

export type RequestStatus =
    | 'new'
    | 'in_progress'
    | 'completed'
    | 'archived'

export type Project = {
    id: string
    name_pt: string
    name_en: string | null
    slug: string
    category: ProjectCategory
    client: string | null
    year: string | null
    media: string[]
    description_pt: string | null
    description_en: string | null
    is_featured: boolean
    created_at: string
}

export type ProjectInsert = {
    name_pt: string
    name_en?: string | null
    slug: string
    category: ProjectCategory
    year?: string | null
    media?: string[]
    description_pt?: string | null
    description_en?: string | null
    is_featured?: boolean
}

export type ProjectUpdate = Partial<ProjectInsert>

export type Request = {
    id: string
    name: string
    email: string
    request: string
    status: RequestStatus
    created_at: string
    updated_at: string
}

export type RequestInsert = {
    name: string
    email: string
    request: string
}

export type RequestUpdate = {
    name?: string
    email?: string
    request?: string
    status?: RequestStatus
}