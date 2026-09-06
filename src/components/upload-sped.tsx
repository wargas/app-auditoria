import { Button } from "./ui/button";
import { Field, FieldContent, FieldLabel } from "./ui/field";
import { open } from '@tauri-apps/plugin-dialog'
import { readFileStream } from "#lib/utils";
import { useState } from "react";
import { Progress } from "./ui/progress";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { useApp } from "../app-context";
import prettyBytes from "pretty-bytes";

export function UploadSped() {

    const app = useApp()

    const db = app.db!

    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState('')



    const mutation = useMutation({
        mutationFn: processarSped,
        onError: () => {
            console.log(`error`)
        },
        throwOnError: true
    })

    async function selectFiles() {
        const filesSpeed = await open({
            multiple: true,
            directory: false
        })

        if (!filesSpeed) return;

        mutation.mutate(filesSpeed)
    }

    async function processarSped(filesSpeed: string[]) {
        
        await db.execute('delete from apuracao');
        await db.execute('delete from ajuste_creditos');
        await db.execute('delete from sped_df');
        // setCountFiles(filesSpeed.length)

        // setCountReadFiles(0)
        await db.execute('drop table if exists sped_temp; create table sped_temp (registro text, periodo, line text)');

        const registros = ['0000','E110', 'E111', 'C100']

        const count = {
            files: 1,
            lines: 0
        }

        for await (const file of filesSpeed) {
            setProgress(0)

            var periodo = ''
            // var doneFile = false;


            for await (const { lines, fileBytesRead, size } of readFileStream(file, 1024*10)) {
                const lineAbertura = lines.find(f => f.startsWith('|0000|'))

                if (lineAbertura) {
                    const partes = lineAbertura.split('|')

                    await db.execute(`insert or ignore into cadastro (cnpj, nome, ie) values ($1, $2, $3)`, [partes[7], partes[6], partes[10]])

                }

                const linesSelecionadas = lines.filter(l => {
                    const partes = l.split('|')


                    return registros.includes(partes[1])
                })

                if (linesSelecionadas.length > 1) {
                    const values = linesSelecionadas.map(l => {
                        const partes = l.split('|')


                        return `('${partes[1]}', '${periodo}', '${JSON.stringify(partes)}')`
                    })

                    await db.execute(`insert into sped_temp (registro, periodo, line) values ${values.join(',')}`)
                }




                count.lines += lines.length
                const newProgress = (fileBytesRead / size) * 100
                setProgress(p => (newProgress - p) > 10 ? newProgress : p)
                 setMessage(`${count.files} de ${filesSpeed.length} (${prettyBytes(fileBytesRead)} de ${prettyBytes(size)})`)

            }

            setProgress(100)

            count.files++


        }

        setMessage(`Salvando dados`)

        await db.execute(`
            insert or ignore into sped_df (id, periodo, chave, modelo, valor_icms, tipo_emitente, tipo_operacao) select 
            concat(json_extract(line, '$[9]'), json_extract(line, '$[4]'), json_extract(line, '$[7]'), json_extract(line, '$[8]')) as id,
            periodo,
            json_extract(line, '$[9]') chave,
            json_extract(line, '$[5]') modelo,
            replace(json_extract(line, '$[22]'), ',', '.') valor_icms,
            json_extract(line, '$[3]') tipo_emitente,
            json_extract(line, '$[2]') tipo_operacao
          from sped_temp where registro = 'C100'
        `);

        await db.execute(`
            insert or ignore into ajuste_creditos (periodo, codigo, descricao, valor) select 
            periodo,
            json_extract(line, '$[2]') codigo,
            json_extract(line, '$[3]') descricao,
            replace(json_extract(line, '$[4]'), ',', '.') valor
            from sped_temp where registro = 'E111'    
        `)

        await db.execute(`
            insert or ignore into apuracao 
            select 
            periodo,
            replace(json_extract(line, '$[2]'), ',', '.'),
            replace(json_extract(line, '$[3]'), ',', '.'),
            replace(json_extract(line, '$[4]'), ',', '.'),
            replace(json_extract(line, '$[5]'), ',', '.'),
            replace(json_extract(line, '$[6]'), ',', '.'),
            replace(json_extract(line, '$[7]'), ',', '.'),
            replace(json_extract(line, '$[8]'), ',', '.'),
            replace(json_extract(line, '$[9]'), ',', '.'),
            replace(json_extract(line, '$[10]'), ',', '.'),
            replace(json_extract(line, '$[11]'), ',', '.'),
            replace(json_extract(line, '$[12]'), ',', '.'),
            replace(json_extract(line, '$[13]'), ',', '.'),
            replace(json_extract(line, '$[14]'), ',', '.'),
            replace(json_extract(line, '$[15]'), ',', '.')
            from sped_temp where registro = 'E110'    
        `)

        // await db.execute(`drop table if exists sped_temp`)

        setMessage(`Concluido`)

    }

    return <Field className="">
        <FieldLabel>Arquivos SPED</FieldLabel>
        <FieldContent className="gap-4 flex-row">


            <div className="flex gap-2 items-center">
                <Button disabled={mutation.isPending} className="w-48" variant={`outline`} onClick={() =>selectFiles()}>
                    {mutation.isSuccess && <Check />}
                    {mutation.isPending && <Spinner />}
                    Selecionar
                </Button>

            </div>


            <div className="flex flex-1 flex-col">
                <span className="text-end text-sm">{message}</span>

                <div className="flex items-center">

                    <Progress value={progress} />

                    {/* <Button onClick={() => mutation} size={`sm`} variant={`ghost`}>Cancelar</Button> */}
                </div>
            </div>

        </FieldContent>
    </Field>
}