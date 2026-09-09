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


        setMessage(`processando...`)

        // setCountReadFiles(0)
        const count = {
            files: 1,
            lines: 0
        }

        for await (const file of files) {
            //   setProgress(0)
            updateProgress(0)
            await db.execute('drop table if exists nfe_temp; create table nfe_temp (line text)');

            for await (const { lines, size, fileBytesRead } of readFileStream(file, 1024 * 10)) {

                const values = lines
                    .filter(l => !l.trim().startsWith('Nota;'))
                    .filter(l => !l.trim().startsWith('Chave'))
                    // .filter(l => !l.startsWith('Chave Acesso;'))
                    // .filter(l => l.includes("26240504265871000198550050002434201238136167"))
                    .map(l => l.replace(/=/g, '').replace(/'/g, ""))
                    .map(l => Papa.parse<string[]>(l).data[0])
                    .map(csv => csv.map(c => c.replace(/"/g, "")))
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

            const colunas = [
                "CHAVE_ACESSO",
                "SERIE",
                "NUMERO",
                "DATA_EMISSAO",
                "HORA_EMISSAO",
                "SITUACAO",
                "NOME_EMITENTE",
                "UF_EMITENTE",
                "DOCUMENTO_EMITENTE",
                "IE_EMITENTE",
                "NOME_DESTINATARIO",
                "UF_DESTINATARIO",
                "DOCUMENTO_DESTINATARIO",
                "IE_DESTINATARIO",
                "FONE_DESTINATARIO",
                "EMAIL_DESTINATARIO",
                "TIPO_OPERACAO",
                "NATUREZA_OPERACAO",
                "NUMERO_ITEM",
                "CODIGO_PRODUTO",
                "CODIGO_EAN",
                "DESCRICAO_PRODUTO",
                "CODIGO_NCM",
                "EXTIPI",
                "CFOP",
                "UNIDADE_COMERCIAL",
                "QUANTIDADE_COMERCIAL",
                "VALOR_UNITARIO_COMERCIALIZACAO",
                "VALOR_PRODUTO",
                "CODIGO_EAN_UNIDADE_TRIBUTAVEL",
                "UNIDADE_TRIBUTAVEL",
                "QUANTIDADE_TRIBUTAVEL",
                "VALOR_UNITARIO_DE_TRIBUTACAO",
                "VALOR_FRETE",
                "VALOR_SEGURO",
                "VALOR_DESCONTO",
                "OUTRAS_DESPESAS_ACESSORIAS",
                "COMPOE_VALOR_TOTAL",
                "INFORMACOES_ADICIONAIS_DO_PRODUTO",
                "GRUPO_DE_TRIBUTACAO",
                "ORIGEM_MERCADORIA",
                "TRIBUTACAO_ICMS",
                "CODIGO_SITUACAO_OPERACAO",
                "MODALIDADE_BC",
                "PC_REDUCAO_BC",
                "VALOR_BC",
                "ALIQUOTA_IMPOSTO",
                "VALOR_ICMS",
                "PC_FCP",
                "VALOR_FCP",
                "VALOR_BC_FCP",
                "PC_FCP_ST",
                "VALOR_FCP_ST",
                "VALOR_BC_FCP_ST",
                "PC_ST",
                "PC_FCP_ST_RETIDO",
                "VALOR_FCP_ST_RETIDO",
                "VALOR_BC_FCP_ST_RETIDO",
                "VALOR_BC_FCP_UF_DESTINO",
                "PC_FCP_UF_DESTINO",
                "VALOR_FCP_UF_DESTINO",
                "MOTIVO_DESONERACAO",
                "MODALIDADE_BC_ICMS_ST",
                "PC_MARGEM_VALOR_ADIC_ICMS_ST",
                "PC_REDUCAO_ICMS_ST",
                "VALOR_BC_ICMS_ST",
                "ALIQUOTA_IMPOSTO_ICMS_ST",
                "VALOR_ICMS_ST",
                "VALOR_BC_ICMS_ST_RETIDO",
                "VALOR_ICMS_ST_RETIDO",
                "VALOR_BC_ICMS_ST_RET_DESTINO",
                "VALOR_ICMS_ST_RET_DESTINO",
                "ALIQUOTA_CREDITO",
                "VALOR_CREDITO",
                "PC_BC",
                "UF_ICMS_ST",
                "VALOR_DO_ICMS_DESONERADO",
                "QUANTIDADE_TRIBUTADA",
                "ALIQUOTA_AD_REM_DO_IMPOSTO",
                "VALOR_DO_ICMS_PROPRIO_DEVIDO",
                "QUANTIDADE_TRIBUTADA_SUJEITA_A_RETENCAO",
                "ALIQUOTA_AD_REM_DO_IMPOSTO_COM_RETENCAO",
                "VALOR_DO_ICMS_COM_RETENCAO",
                "PERCENTUAL_DE_REDUCAO_DA_ALIQUOTA_AD_REM",
                "MOTIVO_DA_REDUCAO_AD_REM",
                "VALOR_DO_ICMS_DA_OPERACAO",
                "PERCENTUAL_DO_DIFERIMENTO",
                "VALOR_DO_ICMS_DIFERIDO",
                "QUANTIDADE_TRIBUTADA_RETIDA_ANTERIORMENTE",
                "ALIQUOTA_DO_IMPOSTO_RETIDO_ANTERIORMENTE",
                "VALOR_DO_ICMS_RETIDO_ANTERIORMENTE",
                "VALOR_TOTAL_DOS_PRODUTOS",
                "VALOR_TOTAL_DO_FRETE",
                "VALOR_TOTAL_DO_SEGURO",
                "VALOR_TOTAL_DO_DESCONTO",
                "VALOR_TOTAL_DO_II",
                "VALOR_TOTAL_DO_IPI",
                "VALOR_DO_PIS",
                "VALOR_DO_COFINS",
                "TOTAL_OUTRAS_DESPESAS_ACESSORIAS",
                "BASE_DE_CALCULO",
                "BASE_DE_CALCULO_ICMS_SUBSTITUTO",
                "TOTAL_VALOR_ICMS",
                "TOTAL_VALOR_FCP",
                "TOTAL_VALOR_FCP_ST",
                "TOTAL_VALOR_FCP_ST_RETIDO",
                "TOTAL_VALOR_FCP_UF_DESTINO",
                "ICMS_SUBSTITUTO",
                "VALOR_ICMS_INTERESTADUAL_UF_DESTINO",
                "VALOR_DA_NOTA",
                "TOTAL_DO_ICMS_DESONERADO",
                "TOTAL_QUANTIDADE_TRIBUTADA_DO_ICMS_MONOFASICO_PROPRIO",
                "TOTAL_ICMS_MONOFASICO_PROPRIO",
                "TOTAL_DA_QUANTIDADE_TRIBUTADA_DO_ICMS_MONOFASICO_SUJEITO_A_RETENCAO",
                "TOTAL_ICMS_MONOFASICO_SUJEITO_A_RETENCAO",
                "TOTAL_DA_QUANTIDADE_TRIBUTADA_DO_ICMS_MONOFASICO_RETIDO_ANTERIORMENTE",
                "TOTAL_ICMS_MONOFASICO_RETIDO_ANTERIORMENTE"
            ]

            try {
                const sql = `
                insert or ignore into nfe (ID, ${colunas.join(', ')})
                select 
                concat(json_extract(line, '$[0]'), ':', json_extract(line, '$[18]')) as ID,
                ${colunas.map((c, i) => `replace(json_extract(line, '$[${i}]'), '"', '') as ${c}`)}
                from nfe_temp    
            `


                await db.execute(sql)
            } catch (error) {
                console.log(String(error))
                setMessage(`Erro ao salvar os dados`)
                throw new Error(`Erro ao salvar os dados`)
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