'use client'

import {
    FormEvent,
    useState,
} from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Locale } from '@/lib/dictionaries'

type Props = {
    locale: Locale
}

export default function LoginForm({
    locale,
}: Props) {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setError(null)
        setIsLoading(true)

        const {
            error: loginError,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (loginError) {
            setError(
                locale === 'pt'
                    ? 'E-mail ou senha inválidos.'
                    : 'Invalid email or password.'
            )

            setIsLoading(false)
            return
        }

        router.push(`/${locale}`)
        router.refresh()
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="
                flex
                w-full
                max-w-md
                flex-col
                gap-8
            "
        >
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="email"
                    className="text-sm"
                >
                    E-mail
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    autoComplete="email"
                    required
                    className="
                        w-full
                        border-b
                        border-current
                        bg-transparent
                        px-0
                        py-3
                        outline-none
                        transition-opacity
                        focus:opacity-60
                    "
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="password"
                    className="text-sm"
                >
                    {locale === 'pt'
                        ? 'Senha'
                        : 'Password'}
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    required
                    className="
                        w-full
                        border-b
                        border-current
                        bg-transparent
                        px-0
                        py-3
                        outline-none
                        transition-opacity
                        focus:opacity-60
                    "
                />
            </div>

            {error && (
                <p
                    role="alert"
                    className="text-sm text-red-500"
                >
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="
                    w-fit
                    border
                    border-current
                    px-6
                    py-3
                    transition-colors
                    hover:bg-[#f3eddf]
                    hover:text-black
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                "
            >
                {isLoading
                    ? locale === 'pt'
                        ? 'Entrando...'
                        : 'Signing in...'
                    : locale === 'pt'
                        ? 'Entrar'
                        : 'Login'}
            </button>
        </form>
    )
}