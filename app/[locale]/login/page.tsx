import { notFound, redirect } from 'next/navigation'

import LoginForm from '@/components/LoginForm'
import PageContainer from '@/components/PageContainer'

import {
    isLocale,
    type Locale,
} from '@/lib/dictionaries'

import { createClient } from '@/lib/supabase/server'

type LoginPageProps = {
    params: Promise<{
        locale: string
    }>
}

export default async function LoginPage({
    params,
}: LoginPageProps) {
    const { locale } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        redirect(`/${locale}/login`)
    }

    return (
        <PageContainer>
            <main
                className="
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    px-6
                    py-24
                "
            >
                <div
                    className="
                        flex
                        w-full
                        max-w-md
                        flex-col
                        gap-12
                    "
                >
                    <h1
                        className="
                            text-4xl
                            font-medium
                            tracking-tight
                            md:text-6xl
                        "
                    >
                        Login
                    </h1>

                    <LoginForm
                        locale={locale as Locale}
                    />
                </div>
            </main>
        </PageContainer>
    )
}