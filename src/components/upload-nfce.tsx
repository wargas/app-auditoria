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
import { parse as parseCSV } from "papaparse";
import { useApp } from "../app-context";
import { getConfig } from "#lib/config";

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
        

        setMessage(`processando...`)

        // setCountReadFiles(0)
        const count = {
            files: 1,
            lines: 0
        }

        for await (const file of filesNFCE) {

            await db.execute('drop table if exists nfce_temp; create table nfce_temp (line text)');
            //   setProgress(0)

            updateProgress(0)

            const config = await getConfig()
            
            console.log({config})

            for await (const { lines, size, fileBytesRead } of readFileStream(file, 1024 * config.buffer_size)) {

                const values = lines
                    .filter(l => !l.trim().startsWith('Nota;'))
                    .filter(l => !l.trim().startsWith('Chave'))
                    .map(l => l.replace(/=/g, '').replace(/'/g, ""))
                    .map(l => parseCSV<string[]>(l).data[0])
                    .map(csv => csv.map(c => c.replace(/"/g, "")))
                    .map(l => JSON.stringify(l))
                    .map(l => `('${l}')`)

                if (lines.length > 0) {
                    const sql = `insert into nfce_temp (line) values ${values.join(`,`)}`


                    await db.execute(sql)
                }

                count.lines += lines.length

                updateProgress((fileBytesRead / size) * 100)
                // console.log(lines);

                setMessage(`${count.files} de ${filesNFCE.length} (${prettyBytes(fileBytesRead)} de ${prettyBytes(size)})`)
            }

            count.files++

            const colunas = [
                "CHAVE_ACESSO",
                "SERIE",
                "NUMERO",
                "DATA_EMISSAO",
                "HORA_EMISSAO",
                "SITUACAO",
                "NOME_EMITENTE",
                "DOCUMENTO_EMITENTE",
                "IE_EMITENTE",
                "NOME_DESTINATARIO",
                "DOCUMENTO_DESTINATARIO",
                "NUMERO_DO_ITEM",
                "CODIGO",
                "CODIGO_EAN",
                "TRIBUTACAO_ICMS__CST",
                "CODIGO_SITUACAO_OPERACAO__CSOSN",
                "MODALIDADE_BC",
                "MODALIDADE_BC_ICMS_ST",
                "PC_REDUCAO_BC",
                "PC_REDUCAO_ICMS_ST",
                "VALOR_BC",
                "VALOR_BC_FCP",
                "VALOR_BC_ICMS_ST",
                "VALOR_ICMS",
                "CFOP",
                "PRODUTO",
                "VALOR_TOTAL_DOS_PRODUTOS",
                "NCM",
                "CEST",
                "ALIQUOTA",
                "UNIDADE_COMERCIAL",
                "QUANTIDADE_COMERCIAL",
                "VALOR_UNITARIO_COMERCIALIZACAO",
                "UNIDADE_TRIBUTAVEL",
                "QUANTIDADE_TRIBUTAVEL",
                "VALOR_UNITARIO_DE_TRIBUTACAO",
                "VALOR_DO_DESCONTO",
                "TOTAL_DA_NFCE",
                "CST_DO_IBS",
                "CCLASSTRIB",
                "INDICADOR_DE_DOACAO",
                "BASE_DE_CALCULO_DO_IBS",
                "ALIQUOTA_DO_IBS_ESTADUAL",
                "PERCENTUAL_DO_DIFERIMENTO_DO_IBS_ESTADUAL",
                "DIFERIMENTO_DO_IBS_ESTADUAL",
                "DEVOLUCAO_DO_IBS_ESTADUAL",
                "PERCENTUAL_DE_REDUCAO_DE_ALIQUOTA_DO_IBS_ESTADUAL",
                "ALIQUOTA_EFETIVA_DO_IBS_ESTADUAL",
                "VALOR_DO_IBS_ESTADUAL",
                "VALOR_TOTAL_DO_IBS_ESTORNADO",
                "CST_REGULAR_DO_IBS",
                "CCLASSTRIB_REGULAR",
                "ALIQUOTA_EFETIVA_DO_IBS_ESTADUAL_REGULAR",
                "VALOR_DO_IBS_ESTADUAL_REGULAR",
                "TOTAL_VALOR_PAGAMENTO",
                "TROCO",
                "TIPO_EMISSAO",
                "FORMA_DE_PAGAMENTO_1",
                "VALOR_DO_PAGAMENTO_1",
                "TIPO_DE_INTEGRACAO_1",
                "CNPJ_DA_CREDENCIADORA_DE_CARTAO_1",
                "BANDEIRA_DA_OPERADORA_DE_CARTAO_1",
                "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_1",
                "FORMA_DE_PAGAMENTO_2",
                "VALOR_DO_PAGAMENTO_2",
                "TIPO_DE_INTEGRACAO_2",
                "CNPJ_DA_CREDENCIADORA_DE_CARTAO_2",
                "BANDEIRA_DA_OPERADORA_DE_CARTAO_2",
                "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_2",
                "FORMA_DE_PAGAMENTO_3",
                "VALOR_DO_PAGAMENTO_3",
                "TIPO_DE_INTEGRACAO_3",
                "CNPJ_DA_CREDENCIADORA_DE_CARTAO_3",
                "BANDEIRA_DA_OPERADORA_DE_CARTAO_3",
                "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_3",
                "FORMA_DE_PAGAMENTO_4",
                "VALOR_DO_PAGAMENTO_4",
                "TIPO_DE_INTEGRACAO_4",
                "CNPJ_DA_CREDENCIADORA_DE_CARTAO_4",
                "BANDEIRA_DA_OPERADORA_DE_CARTAO_4",
                "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_4",
                "FORMA_DE_PAGAMENTO_5",
                "VALOR_DO_PAGAMENTO_5",
                "TIPO_DE_INTEGRACAO_5",
                "CNPJ_DA_CREDENCIADORA_DE_CARTAO_5",
                "BANDEIRA_DA_OPERADORA_DE_CARTAO_5",
                "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_5"
            ]
            
            try {
                const sql = `
                insert or ignore into nfce (ID, ${colunas.join(', ')})
                select 
                concat(json_extract(line, '$[0]'), ':', json_extract(line, '$[11]')) as ID,
                ${colunas.map((c, i) => `replace(json_extract(line, '$[${i}]'), '"', '') as ${c}`)}
                from nfce_temp    
            `
            
    
                await db.execute(sql)
            } catch (error) {
                console.log(String(error))
                setMessage(`Erro ao salvar os dados`)
                throw new Error(`Erro ao salvar os dados`)
            }

        }
        setMessage(`salvando dados`)

        


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