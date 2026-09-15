import { Button } from '#components/ui/button'
import { Field, FieldLabel } from '#components/ui/field'
import { Input } from '#components/ui/input'
import { Textarea } from '#components/ui/textarea'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useApp } from '../app-context'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function Component() {
    const queryClient = useQueryClient()
    const { db } = useApp()
    const form = useForm({
        defaultValues: {
            description: '',
            sql: ''
        }
    })

    useEffect(() => {
        getCurrentWindow().setTitle("Novo Relatorio")
    }, [])

    async function handleSubmit(_data: { description: string; sql: string }, ) {
        const insert = await db?.execute(`insert into relatorios (name, sql) values ($1, $2)`, [_data.description, _data.sql]);

        if(insert?.lastInsertId) {
            toast.success('Salvo com sucesso')

            await queryClient.refetchQueries({queryKey: ['relatorios']})

            await getCurrentWindow().close()
        }
    }

    return <div className="h-screen p-4 flex flex-col gap-4">
        <Field>
            <FieldLabel>Descrição</FieldLabel>
            <Input {...form.register('description')} />
        </Field>
        <Field className='flex-1'>
            <FieldLabel>Consulta SQL</FieldLabel>
            <div className='h-full'>
                <Textarea {...form.register('sql')} className='h-full' />
            </div>
        </Field>

        <div className='flex gap-4 justify-end'>
            <Button onClick={() => getCurrentWindow().close()} variant={'outline'}>Fechar</Button>
            <Button variant={'default'} onClick={form.handleSubmit(handleSubmit)}>Salvar</Button>
        </div>
    </div>
}