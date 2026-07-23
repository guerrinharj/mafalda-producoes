'use client'

import {
    useActionState,
    useEffect,
    useRef,
} from 'react'
import { useFormStatus } from 'react-dom'

import { createRequest } from '../app//[locale]/arte-e-joalheria/solicitacao/actions'

import type { RequestFormState } from '@/types/database'

const initialState: RequestFormState = {
    success: false,
    message: '',
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="
                border
                border-current
                px-6
                py-3
                text-sm
                uppercase
                tracking-wide
                transition-colors
                hover:bg-[#f4eedf]
                hover:text-black
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
        >
            {pending ? 'Enviando...' : 'Enviar solicitação'}
        </button>
    )
}

export default function RequestForm() {
    const formRef = useRef<HTMLFormElement>(null)

    const [state, formAction] = useActionState(
        createRequest,
        initialState
    )

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
        }
    }, [state.success])

    return (
        <form
            ref={formRef}
            action={formAction}
            className="flex w-full max-w-2xl flex-col gap-8"
        >
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="name"
                    className="text-sm uppercase tracking-wide"
                >
                    Nome
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="
                        border-b
                        border-current
                        bg-transparent
                        py-3
                        outline-none
                        transition-opacity
                        focus:opacity-70
                    "
                />

                {state.errors?.name && (
                    <p className="text-sm text-red-400">
                        {state.errors.name}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="email"
                    className="text-sm uppercase tracking-wide"
                >
                    E-mail
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="
                        border-b
                        border-current
                        bg-transparent
                        py-3
                        outline-none
                        transition-opacity
                        focus:opacity-70
                    "
                />

                {state.errors?.email && (
                    <p className="text-sm text-red-400">
                        {state.errors.email}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="request"
                    className="text-sm uppercase tracking-wide"
                >
                    Solicitação
                </label>

                <textarea
                    id="request"
                    name="request"
                    required
                    rows={8}
                    className="
                        resize-y
                        border
                        border-current
                        bg-transparent
                        p-4
                        outline-none
                        transition-opacity
                        focus:opacity-70
                    "
                />

                {state.errors?.request && (
                    <p className="text-sm text-red-400">
                        {state.errors.request}
                    </p>
                )}
            </div>

            <div
                aria-hidden="true"
                className="absolute left-[-9999px]"
            >
                <label htmlFor="website">
                    Website
                </label>

                <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            <div className="flex flex-col items-start gap-4">
                <SubmitButton />

                {state.message && (
                    <p
                        aria-live="polite"
                        className={
                            state.success
                                ? 'text-sm text-green-400'
                                : 'text-sm text-red-400'
                        }
                    >
                        {state.message}
                    </p>
                )}
            </div>
        </form>
    )
}