// app/api/projetos/[id]/route.ts

import { NextResponse } from 'next/server'

type RouteContext = {
    params: Promise<{
        id: string
    }>
}

export async function GET(
    request: Request,
    { params }: RouteContext
) {
    const { id } = await params

    return NextResponse.json({
        id,
        message: 'Projeto encontrado',
    })
}