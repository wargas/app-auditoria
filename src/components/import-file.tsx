import { Button } from "./ui/button";
import { open } from '@tauri-apps/plugin-dialog'
import { Fragment, useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, RefreshCcw, X } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { cn, readFileStream } from "#lib/utils";
import prettyBytes from 'pretty-bytes'
import { useApp } from "../app-context";
import { getConfig } from "#lib/config";
import { ReadFile, ReadFileNFCE, ReadFileNFE, ReadFileSPED } from "#lib/read-files";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import _ from "lodash";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

type File = {
    path: string,
    name: string,
    size: number,
    read: number,
    reader: ReadFile | undefined,
    status: string,
    progress: number
}

export function ImportFile() {

    const app = useApp()
    const [files, setFiles] = useState<File[]>([])

    const mutation = useMutation({
        mutationFn: processar,
        onError: err => {
            // setMessage("Erro ao importar o arquivo")
            alert(String(JSON.stringify(err)))
        }
    })


    async function selectFiles() {
        const files = await open({
            multiple: true,
            directory: false
        })

        if (!files) return;

        mutatePreparar.mutate(files)
    }

    const mutatePreparar = useMutation({
        mutationFn: async (files: string[]) => {
            for await (const file of files) {
                for await (const { lines, size } of readFileStream(file, 1024 * 10)) {
                    const firstLine = lines[0];

                    const reader = [new ReadFileNFCE(), new ReadFileNFE(), new ReadFileSPED()].find(r => r.validate(firstLine))

                    setFiles(list => [...list, {
                        name: _.last(file.replace(/\\/g, "/").split("/")) ?? "",
                        path: file,
                        size,
                        read: 0,
                        reader: reader,
                        status: '',
                        progress: 0
                    }])

                    break;
                }
            }
        }
    })

    const updateFileStatus = useCallback((filePath: string, input: Partial<File>) => {

        setFiles(list => list.map(item => {

            if (item.path == filePath) {
                return { ...item, ...input }
            }

            return item
        }))

    }, [files])

    async function processar(files: File[]) {

        const db = app.db!

        // setCountReadFiles(0)
        const count = {
            files: 1,
            lines: 0
        }

        for await (const file of files) {

            if (file.status !== '') continue;

            const config = await getConfig()

            let startReader = true
            let reader: ReadFile | undefined;

            updateFileStatus(file.path, {
                progress: 100,
                read: file.size,
                status: 'lendo'
            })


            try {



                for await (const { lines, size, fileBytesRead } of readFileStream(file.path, 1024 * config.buffer_size)) {

                    if (startReader) {
                        const firstLine = lines[0]

                        reader = [new ReadFileNFCE(), new ReadFileNFE(), new ReadFileSPED()].find(r => r.validate(firstLine))

                        startReader = false


                        if (!reader) {
                            throw new Error("Arquivo invalido")
                        }


                        await reader.onReadFile(db)


                    }

                    if (!reader) {
                        throw new Error("Arquivo invalido")
                    }


                    await reader.onReadLines(lines, db)

                    count.lines += lines.length

                    updateFileStatus(file.path, {
                        progress: (fileBytesRead / size) * 100,
                        read: fileBytesRead
                    })

                    // updateProgress((fileBytesRead / size) * 100)

                    // setMessage(`[${reader.name}] ${count.files} de ${files.length} (${prettyBytes(fileBytesRead)} de ${prettyBytes(size)})`)

                }

                await reader?.onEndReadFile(db)

                updateFileStatus(file.path, {
                    progress: 100,
                    read: file.size,
                    status: 'gravando'
                })



                await reader?.onEndReadFile(db)


                updateFileStatus(file.path, {
                    progress: 100,
                    read: file.size,
                    status: 'concluido'
                })

            } catch (error) {
                console.log(error)
                updateFileStatus(file.path, {
                    progress: 0,
                    read: 0,
                    status: 'erro'
                })
            }


        }
    }

    return <div className="">

        <div className="flex gap-4 border-b pb-4">
            <Button disabled={mutation.isPending} className="w-48" variant={`outline`} onClick={() => selectFiles()}>
                {mutatePreparar.isPending && <Spinner />}
                Selecionar</Button>

            <Button disabled={mutation.isPending || files.filter(f => f.status == '').length == 0} className="w-48" variant={`outline`} onClick={() => mutation.mutate(files)}>
                {mutation.isSuccess && <Check />}
                {mutation.isPending && <Spinner />}
                Importar</Button>

            <Button className="w-48" variant={`outline`} onClick={() => setFiles([])}>
                Limpar</Button>

            <div className="span ml-auto">
                {files.filter(s => s.status == 'concluido').length} de {files.length}
            </div>
        </div>


        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            Arquivo
                        </TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>
                            <div className="text-end">Status</div>
                        </TableHead>
                        <TableHead>
                            <div className="text-end">Tamanho</div>
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {files.map(file => (
                        <Fragment key={file.path}>

                            <TableRow key={file.path} >
                                <TableCell className="truncate w-[50%]">
                                    <div className="flex items-center gap-2">
                                        {file.name}
                                    </div>

                                    <Progress className={cn({ 'opacity-0': file.progress == 0 })} value={file.progress} />
                                </TableCell>
                                <TableCell>{file.reader?.name}</TableCell>
                                <TableCell>
                                    <div className="text-end">
                                        <Badge className={cn({ 'bg-green-700': file.status == 'concluido', 'opacity-0': file.status == '' })}>{file.status.toUpperCase()}</Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-end">
                                        {file.read > 0 ? `${prettyBytes(file.read)}/` : ``}{prettyBytes(file.size)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        <Button onClick={() => setFiles(l => l.filter(l => l.path != file.path))} variant={'outline'} size={`icon-xs`}>
                                            <X />
                                        </Button>

                                        <Button onClick={() => updateFileStatus(file.path, { status: '' })} variant={'outline'} size={`icon-xs`}>
                                            <RefreshCcw />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>

                        </Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div >
}