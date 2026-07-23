'use server'

import { Resend } from 'resend'

import { createClient } from '@/lib/supabase/server'

export type RequestFormState = {
    success: boolean
    message: string
    errors?: {
        name?: string
        email?: string
        request?: string
    }
}

const initialErrorState: RequestFormState = {
    success: false,
    message: 'Não foi possível enviar sua solicitação.',
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function createRequest(
    previousState: RequestFormState,
    formData: FormData
): Promise<RequestFormState> {
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '')
        .trim()
        .toLowerCase()
    const request = String(formData.get('request') ?? '').trim()

    // Campo invisível para reduzir spam automatizado.
    const website = String(formData.get('website') ?? '').trim()

    if (website) {
        return {
            success: true,
            message: 'Solicitação enviada com sucesso.',
        }
    }

    const errors: RequestFormState['errors'] = {}

    if (!name) {
        errors.name = 'Informe seu nome.'
    }

    if (!email) {
        errors.email = 'Informe seu e-mail.'
    } else if (!isValidEmail(email)) {
        errors.email = 'Informe um e-mail válido.'
    }

    if (!request) {
        errors.request = 'Descreva sua solicitação.'
    }

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: 'Verifique os campos do formulário.',
            errors,
        }
    }

    const supabase = await createClient()

    const { data: createdRequest, error: databaseError } = await supabase
        .from('requests')
        .insert({
            name,
            email,
            request,
            status: 'new',
        })
        .select('id, created_at')
        .single()

    if (databaseError) {
        console.error(
            'Erro ao criar solicitação:',
            databaseError
        )

        return initialErrorState
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL

    if (!resendApiKey || !fromEmail) {
        console.error(
            'RESEND_API_KEY ou RESEND_FROM_EMAIL não configurado.'
        )

        return {
            success: true,
            message:
                'Sua solicitação foi registrada, mas a notificação por e-mail não pôde ser enviada.',
        }
    }

    const resend = new Resend(resendApiKey)

    const { error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: ['gabrielpessoaguerracavalcanti@gmail.com'],
        replyTo: email,
        subject: `Nova solicitação de ${name}`,
        text: [
            'Uma nova solicitação foi criada pelo site.',
            '',
            `Nome: ${name}`,
            `E-mail: ${email}`,
            `ID: ${createdRequest.id}`,
            `Criada em: ${createdRequest.created_at}`,
            '',
            'Solicitação:',
            request,
        ].join('\n'),
    })

    if (emailError) {
        console.error(
            'Solicitação criada, mas houve erro no e-mail:',
            emailError
        )

        return {
            success: true,
            message:
                'Sua solicitação foi registrada, mas a notificação por e-mail não pôde ser enviada.',
        }
    }

    return {
        success: true,
        message: 'Solicitação enviada com sucesso.',
    }
}