'use client'

import Link from 'next/link'

export default function AddProjectButton() {
    return (
        <Link
            href="/projetos/novo"
            aria-label="Adicionar projeto"
            className="
                fixed
                right-6
                top-1/2
                z-50
                -translate-y-1/2
                text-5xl
                font-light
                leading-none
                transition-transform
                duration-300
                hover:rotate-90
            "
        >
            +
        </Link>
    )
}