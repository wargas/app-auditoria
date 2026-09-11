import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";
import { Store } from "@tauri-apps/plugin-store";
import { ComponentProps, useState } from "react";

type Props = {
    sql: string
}

export function DialogSaveSQL({ sql }:ComponentProps<"div"> & Props) {

    const [name, setName] = useState('')
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    

    const mutationSaveSQL = useMutation({
        mutationFn: async () => {
            const store = await Store.load('saved-sql.json')

            const list = await store.get<any[]>(`saveds`) ?? []

            await store.set('saveds', [{ id: crypto.randomUUID(), name: name, sql }, ...list])

            queryClient.refetchQueries({ queryKey: ['saved-sql'] })

            setOpen(false)
        }
    })

    return <Dialog onOpenChange={setOpen} open={open}>
    <DialogTrigger asChild>
        <Button variant={'outline'}>
            {mutationSaveSQL.isPending && (<Spinner />)}
            Salvar consulta
        </Button>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Salvar consulta</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">

            <Input value={name} onChange={v => setName(v.target.value)} placeholder='Nome da consulta' />

            <Textarea value={sql}></Textarea>

            <Button onClick={() => mutationSaveSQL.mutate()} variant={'outline'}>Salvar</Button>
        </div>
    </DialogContent>
</Dialog>
}