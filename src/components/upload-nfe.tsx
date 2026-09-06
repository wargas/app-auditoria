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
import Papa from 'papaparse';
import { useApp } from "../app-context";

export function UploadNFE() {

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

        mutation.mutate(filesSpeed, {
            onError: (error) => {
                console.log(error)
            }
        })
    }

    async function processar(files: string[]) {
        
        const db = app.db!
        await db.execute('drop table if exists nfe_temp; create table nfe_temp (line text)');

        setMessage(`processando...`)

        // setCountReadFiles(0)
        const count = {
            files: 1,
            lines: 0
        }

        for await (const file of files) {
            //   setProgress(0)

            updateProgress(0)

            for await (const { lines, size, fileBytesRead } of readFileStream(file, 1024 * 10)) {

                const values = lines
                    .filter(l => !l.trim().startsWith('Nota;'))
                    .filter(l => !l.trim().startsWith('Chave'))
                    // .filter(l => !l.startsWith('Chave Acesso;'))
                    // .filter(l => l.includes("26240504265871000198550050002434201238136167"))
                    .map(l => l.replace(/=/g, '').replace(/'/g, ""))
                    .map(l => Papa.parse(l).data[0])
                    .map(l => JSON.stringify(l))
                    .map(l => `('${l}')`)



                if (values.length > 0) {
                    const sql = `insert into nfe_temp (line) values ${values.join(`,`)}`

                    await db.execute(sql)
                }

                count.lines += lines.length

                updateProgress((fileBytesRead / size) * 100)
                // console.log(lines);

                setMessage(`${count.files} de ${files.length} (${prettyBytes(fileBytesRead)} de ${prettyBytes(size)})`)
            }

            count.files++



        }
        setMessage(`salvando dados`)

        // const chave = partes[0]
        //                 const numItem = partes[18]
        //                 const emitente = partes[8]
        //                 const destinatario = partes[12]
        //                 const tipoOperacao = partes[16]
        //                 const id = `${chave}:${numItem}`
        //                 let valorICMS = parseFloat(partes[47].replace(/\./g, "").replace(/,/g, "."))


        await db.execute(`
            insert or ignore into nfe (id, chave, valor_icms, emitente, destinatario, tipo_operacao, line)
            select 
            concat(json_extract(line, '$[0]'), ':', json_extract(line, '$[18]')) as id,
            json_extract(line, '$[0]') as chave,
            replace(json_extract(line, '$[47]'), ',', '.') valor_icms,
            json_extract(line, '$[8]') as emitente,
            json_extract(line, '$[12]') as destinatario,
            json_extract(line, '$[16]') as tipo_operacao,
            line
            from nfe_temp    
        `)

        setMessage(`concluido`)
    }

    return <Field className="">
        <FieldLabel>Arquivos NFE (55)</FieldLabel>
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