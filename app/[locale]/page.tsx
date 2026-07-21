import {
    getDictionary,
    isLocale,
} from '@/lib/dictionaries'
import { notFound } from 'next/navigation'

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

    return (
        <main className="flex min-h-screen items-center justify-center px-6">
            <h1 className="text-center text-4xl font-medium tracking-tight md:text-7xl">
                {dict.home.title}
            </h1>
        </main>
    )
}