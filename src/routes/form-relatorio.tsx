import { Button } from '#components/ui/button'
import { Field, FieldLabel } from '#components/ui/field'
import { Input } from '#components/ui/input'
import { Textarea } from '#components/ui/textarea'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

export function Component() {
    const form = useForm({
        defaultValues: {
            description: '',
            sql: ''
        }
    })

    useEffect(() => {
        getCurrentWindow().setTitle("Novo Relatorio")
    }, [])

    function handleSubmit(data: { description: string; sql: string }, ) {
        console.log(data)
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
            <Button variant={'outline'}>Fechar</Button>
            <Button variant={'default'} onClick={form.handleSubmit(handleSubmit)}>Salvar</Button>
        </div>
    </div>
}