import { getProjectDb } from "#lib/database";
import { Button } from "./ui/button";
import { Field, FieldContent, FieldLabel } from "./ui/field";
import { open } from '@tauri-apps/plugin-dialog'
import { readFileByLine } from "#lib/utils";
import { useState } from "react";
import { Progress } from "./ui/progress";

export function UploadSped({ id }: { id: string }) {

    const [files, setFiles] = useState(0)
    const [filesProcessados, setFilesProcessados] = useState(0)

    async function processarSped() {

        const db = await getProjectDb(id)

        const filesSpeed = await open({
            multiple: true,
            directory: false
        })

        if (!filesSpeed) return;

        setFiles(filesSpeed.length)

        setFilesProcessados(0)

        await db.execute('delete from apuracao');
        await db.execute('delete from ajuste_creditos');
        await db.execute('delete from sped_df');
        // setCountFiles(filesSpeed.length)

        // setCountReadFiles(0)

        for await (const file of filesSpeed) {
            //   setProgress(0)

            var periodo = ''

            await readFileByLine(file, async (line) => {
                const partes = line.split('|')

                if (line.startsWith('|0000|')) {

                    periodo = partes[4].substring(2)

                }

                if (line.startsWith('|E110|')) {
                    await db.execute('insert into apuracao (periodo, line) values ($1, $2)', [periodo, line])
                }

                if (line.startsWith('|E111|')) {
                    await db.execute('insert into ajuste_creditos (periodo, line) values ($1, $2)', [periodo, line])
                }

                if (line.startsWith(`|C100|`)) {

                    const chave = partes[9]
                    const valorICMS = partes[21].replace(',', '.')

                    if (chave.length > 0) {
                        try {
                            await db.execute("insert into sped_df (periodo, chave, valor_icms, line) values ($1, $2, $3, $4)", [periodo, chave, valorICMS, line])

                        } catch (error) {
                            console.log(error);

                            console.log(`Erro na chave ${chave} do arquivo ${file}`)
                        }
                    }
                    // console.log({ size, bytesRead }, (bytesRead / size).toLocaleString(`pt-BR`, { style: 'percent' }))
                }

                // setProgress((bytesRead / size) * 100)

            })

            setFilesProcessados(c => c + 1)
            //   setCountReadFiles(c => c + 1)
            //   setProgress(100)

        }

    }

    return <Field className="">
        <FieldLabel>Arquivos SPED</FieldLabel>
        <FieldContent>

            {files == 0 && (
                <Button className="w-48" variant={`outline`} onClick={processarSped}>Selecionar</Button>
            )}
            {files > 0 && (
                <div className="flex flex-col">
                    <span className="text-end text-sm">{filesProcessados} de {files}</span>

                    <div className="flex items-center">

                        <Progress value={filesProcessados / files * 100} />

                        <Button onClick={() => setFiles(0)} size={`sm`} variant={`ghost`}>Cancelar</Button>
                    </div>
                </div>
            )}
        </FieldContent>
    </Field>
}