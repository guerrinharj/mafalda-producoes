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

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
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

    const { data: createdRequest, error: databaseError } =
        await supabase
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

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeRequest = escapeHtml(request).replaceAll(
        '\n',
        '<br>'
    )

    const createdAt = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo',
    }).format(new Date(createdRequest.created_at))

    const { error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: 'mafaldaproducoesltda@gmail.com',
        replyTo: email,
        subject: `Nova solicitação de ${name}`,

        text: [
            'Uma nova solicitação foi criada pelo site.',
            '',
            `Nome: ${name}`,
            `E-mail: ${email}`,
            `ID: ${createdRequest.id}`,
            `Criada em: ${createdAt}`,
            '',
            'Solicitação:',
            request,
        ].join('\n'),

        html: `
            <!DOCTYPE html>
            <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    />
                    <title>Nova solicitação</title>
                </head>

                <body
                    style="
                        margin: 0;
                        padding: 0;
                        background-color: #f4f0e7;
                        color: #111111;
                        font-family: Arial, Helvetica, sans-serif;
                    "
                >
                    <div
                        style="
                            width: 100%;
                            padding: 40px 16px;
                            box-sizing: border-box;
                        "
                    >
                        <div
                            style="
                                max-width: 640px;
                                margin: 0 auto;
                                background-color: #ffffff;
                                border: 1px solid #111111;
                                padding: 40px;
                                box-sizing: border-box;
                            "
                        >
                            <p
                                style="
                                    margin: 0 0 12px;
                                    font-size: 12px;
                                    text-transform: uppercase;
                                    letter-spacing: 2px;
                                    color: #666666;
                                "
                            >
                                Mafalda Produções Artísticas
                            </p>

                            <h1
                                style="
                                    margin: 0 0 32px;
                                    font-size: 32px;
                                    line-height: 1.1;
                                    font-weight: 500;
                                "
                            >
                                Nova solicitação
                            </h1>

                            <table
                                role="presentation"
                                style="
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin-bottom: 32px;
                                "
                            >
                                <tr>
                                    <td
                                        style="
                                            width: 120px;
                                            padding: 12px 0;
                                            border-bottom: 1px solid #dddddd;
                                            font-size: 13px;
                                            text-transform: uppercase;
                                            letter-spacing: 1px;
                                            color: #666666;
                                            vertical-align: top;
                                        "
                                    >
                                        Nome
                                    </td>

                                    <td
                                        style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #dddddd;
                                            font-size: 16px;
                                            vertical-align: top;
                                        "
                                    >
                                        ${safeName}
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        style="
                                            width: 120px;
                                            padding: 12px 0;
                                            border-bottom: 1px solid #dddddd;
                                            font-size: 13px;
                                            text-transform: uppercase;
                                            letter-spacing: 1px;
                                            color: #666666;
                                            vertical-align: top;
                                        "
                                    >
                                        E-mail
                                    </td>

                                    <td
                                        style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #dddddd;
                                            font-size: 16px;
                                            vertical-align: top;
                                        "
                                    >
                                        <a
                                            href="mailto:${safeEmail}"
                                            style="
                                                color: #111111;
                                                text-decoration: underline;
                                            "
                                        >
                                            ${safeEmail}
                                        </a>
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        style="
                                            width: 120px;
                                            padding: 12px 0;
                                            border-bottom: 1px solid #dddddd;
                                            font-size: 13px;
                                            text-transform: uppercase;
                                            letter-spacing: 1px;
                                            color: #666666;
                                            vertical-align: top;
                                        "
                                    >
                                        Data
                                    </td>

                                    <td
                                        style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #dddddd;
                                            font-size: 16px;
                                            vertical-align: top;
                                        "
                                    >
                                        ${createdAt}
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-bottom: 32px;">
                                <p
                                    style="
                                        margin: 0 0 12px;
                                        font-size: 13px;
                                        text-transform: uppercase;
                                        letter-spacing: 1px;
                                        color: #666666;
                                    "
                                >
                                    Solicitação
                                </p>

                                <div
                                    style="
                                        padding: 20px;
                                        border: 1px solid #dddddd;
                                        font-size: 16px;
                                        line-height: 1.6;
                                        word-break: break-word;
                                    "
                                >
                                    ${safeRequest}
                                </div>
                            </div>

                            <a
                                href="mailto:${safeEmail}"
                                style="
                                    display: inline-block;
                                    padding: 14px 22px;
                                    background-color: #111111;
                                    color: #ffffff;
                                    text-decoration: none;
                                    font-size: 13px;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                "
                            >
                                Responder solicitação
                            </a>

                            <p
                                style="
                                    margin: 32px 0 0;
                                    padding-top: 20px;
                                    border-top: 1px solid #dddddd;
                                    font-size: 12px;
                                    line-height: 1.5;
                                    color: #777777;
                                "
                            >
                                ID da solicitação:
                                ${createdRequest.id}
                            </p>
                        </div>
                    </div>
                </body>
            </html>
        `,
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