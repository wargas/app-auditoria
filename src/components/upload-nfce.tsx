import { Button } from "./ui/button";
import { Field, FieldContent, FieldLabel } from "./ui/field";
import { open } from '@tauri-apps/plugin-dialog'
import { useCallback, useState } from "react";
import { Progress } from "./ui/progress";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { readFileStream } from "#lib/utils";
import prettyBytes from 'pretty-bytes'
import Papa from "papaparse";
import { useApp } from "../app-context";

export function UploadNFCE() {

    const app = useApp()
    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState('')

    const mutation = useMutation({
        mutationFn: processar,
        onError: err => {
            alert(err.message)
        }
    })

    const updateProgress = useCallback((p: number) => {
        if (p == 0 || p == 100) {
            setProgress(Math.ceil(p))
        }

        if (Math.abs(p - progress) > 10) {
            setProgress(Math.ceil(p))
        }

    }, [progress])

    async function selectFiles() {
        const filesSpeed = await open({
            multiple: true,
            directory: false
        })

        if (!filesSpeed) return;

        mutation.mutate(filesSpeed)
    }

    async function processar(filesNFCE: string[]) {

        const db = app.db!
        await db.execute('drop table if exists nfce_temp; create table nfce_temp (line text)');

        setMessage(`processando...`)

        // setCountReadFiles(0)
        const count = {
            files: 0,
            lines: 0
        }

        for await (const file of filesNFCE) {
            //   setProgress(0)

            updateProgress(0)

            for await (const { lines, size, fileBytesRead } of readFileStream(file, 1024 * 10)) {

                const values = lines
                    .filter(l => !l.trim().startsWith('Nota;'))
                    .filter(l => !l.trim().startsWith('Chave'))
                    // .filter(l => !l.startsWith('Chave Acesso;'))
                    // .filter(l => l.includes("26240504265871000198550050002434201238136167"))
                    .map(l => l.replace(/=/g, '').replace(/'/g, ""))
                    .map(l => Papa.parse<string[]>(l).data[0])
                    .map(l => JSON.stringify(l))
                    .map(l => `('${l}')`)

                if (lines.length > 0) {
                    const sql = `insert into nfce_temp (line) values ${values.join(`,`)}`


                    await db.execute(sql)
                }

                count.lines += lines.length

                updateProgress((fileBytesRead / size) * 100)
                // console.log(lines);

                setMessage(`${count.files} de ${filesNFCE.length} ${lines.length} (${prettyBytes(fileBytesRead)} de ${prettyBytes(size)})`)
            }

            count.files++



        }
        setMessage(`salvando dados`)


        await db.execute(`
            insert or ignore into nfce (id, chave, valor_icms, line)
            select 
            concat(json_extract(line, '$[0]'), ':', json_extract(line, '$[11]')) as id,
            replace(json_extract(line, '$[0]'), '"', '') as chave,
            replace(json_extract(line, '$[23]'), ',', '.') valor_icms,
            line
            from nfce_temp    
        `)

        setMessage(`concluido`)
    }

    return <Field className="">
        <FieldLabel>Arquivos NFCE (65)</FieldLabel>
        <FieldContent className="gap-4 flex-row">

            <Button disabled={mutation.isPending} className="w-48" variant={`outline`} onClick={() => selectFiles()}>
                {mutation.isSuccess && <Check />}
                {mutation.isPending && <Spinner />}
                Selecionar</Button>

            <div className="flex flex-1 flex-col">
                <span className="text-end text-sm">{message}</span>

                <div className="flex items-center">

                    <Progress value={progress} />

                </div>
            </div>

        </FieldContent>
    </Field>
}