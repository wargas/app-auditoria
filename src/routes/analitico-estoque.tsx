import { useMutation } from "@tanstack/react-query"
import { useApp } from "../app-context"
import { Input } from "#components/ui/input"
import { Field, FieldLabel } from "#components/ui/field"
import _, { get, sortBy } from "lodash"
import { useState } from "react"
import { Button } from "#components/ui/button"
import { Grid } from "#components/grid"
import { toast } from "sonner"

const TOAST_ID = 'toast-estoque'

export function Component() {

    const [estoque, setEstoque] = useState<any[]>([])
    const app = useApp()


    const mutationEstoque = useMutation({
        mutationFn: async () => {
            toast.loading('iniciando', { id: TOAST_ID })
            setEstoque([])
            const produtos = await app.db!.select<any[]>(`select * from produtos group by COD_ITEM`)

            for await (const produto of produtos) {
                toast.loading(`carregando: ${produtos.indexOf(produto) + 1} de ${produtos.length}`, { id: TOAST_ID })
                const estoque_inicial = await app.db!.select<{ QTD: number }[]>(`select * from estoque where data = $1 and COD_ITEM = $2`, ['31122022', produto.COD_ITEM]);
                const estoque_final = await app.db!.select<{ QTD: number }[]>(`select * from estoque where data = $1 and COD_ITEM = $2`, ['31122023', produto.COD_ITEM]);

                if(estoque_final.length == 0 && estoque_inicial.length == 0) continue;

                const entrada = await app.db!.select(`select sum(QUANTIDADE_COMERCIAL) as QTD from nfe_entrada where CODIGO_EAN = $1 AND DATA_EMISSAO LIKE '2023-%' AND CFOP NOT IN (1202, 2202, 1411)`, [produto.COD_BARRA])
                const saida_nfe = await app.db!.select(`select sum(QUANTIDADE_COMERCIAL) as QTD from nfe_saida where CODIGO_EAN = $1 AND DATA_EMISSAO LIKE '2023-%' AND CFOP NOT IN (1202, 2202, 1411)`, [produto.COD_BARRA])
                const saida_nfce = await app.db!.select(`select sum(QUANTIDADE_COMERCIAL) as QTD from nfce where CODIGO_EAN = $1 AND DATA_EMISSAO LIKE '2023-%' AND CFOP NOT IN (1202, 2202, 1411)`, [produto.COD_BARRA])

                const data = {
                    name: produto.DESCR_ITEM ?? '',
                    cod_barra: get(produto, 'COD_BARRA', ''),
                    qtd_inicial: get(estoque_inicial, '0.QTD', 0),
                    qtd_entrada: get(entrada, '0.QTD', 0),
                    qtd_saida_nfe: get(saida_nfe, '0.QTD', 0),
                    qtd_saida_nfce: get(saida_nfce, '0.QTD', 0),
                    qtd_final: get(estoque_final, '0.QTD', 0),
                    valor_unitario: get(estoque_final, '0.VL_UNIT') ?? get(estoque_inicial, '0.VL_UNIT') ?? 0,
                    saldo: 0,
                    valor_diferenca: 0
                }



                data.saldo = data.qtd_inicial + data.qtd_entrada - data.qtd_saida_nfce - data.qtd_saida_nfe - data.qtd_final
                data.valor_diferenca = data.saldo * data.valor_unitario

                if (data.saldo != 0) {
                    setEstoque(e => [data, ...e])
                }
            }
        },
        onError(err) {
            console.log(err)
        },
        onSettled() {
            toast.dismiss(TOAST_ID)
        }
    })


    return <div className="p-4 flex flex-col">
        <div>
            <Field>
                <FieldLabel>Ano</FieldLabel>
                <Input />
            </Field>
            <Button onClick={() => mutationEstoque.mutate()}>Iniciar</Button>
        </div>
        <div className="flex-1 h-120">
            <Grid rowData={sortBy(estoque, 'valor_diferenca')} autoGenerateColumnDefs />
        </div>

    </div>
}