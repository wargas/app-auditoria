import { Button } from "#components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "#components/ui/card"
import { Spinner } from "#components/ui/spinner"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useApp } from "../app-context"
import { Field, FieldLabel } from "#components/ui/field"
import { Input } from "#components/ui/input"
import { Check } from "lucide-react"
import { find } from "lodash"

export function Component() {

    const app = useApp()
    const db = app.db!

    const queryCadastro = useQuery({
        queryKey: ["cadastro"],
        queryFn: async () => {
            const result = await db.select<{ CNPJ: string, NOME: string, IE: string }[]>('select * from cadastro limit 1')

            if (result.length == 0) {
                return { CNPJ: '', NOME: '', IE: '' }
            }

            return result[0]
        }
    })



    const queryCount = useQuery({
        queryKey: ["count_sped"],
        queryFn: async () => {


            return db.select<any[]>(`select * from total_dfs`)
        }
    })

    const queryNFCENE = useQuery({
        queryKey: ["count_nfcene"],
        queryFn: async () => {
            return db.select<any[]>('select count(*) as count from (select CHAVE_ACESSO from nfce_sem_escrituracao group by CHAVE_ACESSO) tb')
        }
    })

    const queryNFENE = useQuery({
        queryKey: ["count_nfene"],
        queryFn: async () => {
            return db.select<any[]>('select count(*) as count from (select CHAVE_ACESSO from nfe_sem_escrituracao group by CHAVE_ACESSO) tb')
        }
    })


    const mutationRelatorios = useMutation({
        mutationFn: async () => {
            const db = app.db!

            await db.execute('drop table if exists nfce_sem_escrituracao; create table nfce_sem_escrituracao as select CHAVE_ACESSO from nfce where CHAVE_ACESSO not in (select CHV_NFE from sped_df)')
            await db.execute('drop table if exists nfe_sem_escrituracao; create table nfe_sem_escrituracao as select CHAVE_ACESSO from nfe where CHAVE_ACESSO not in (select CHV_NFE from sped_df)')

            

            await db.execute(`
                drop view if exists nfe_entrada;
                create view nfe_entrada as 
                select * from nfe n
                left join cadastro c on c.CNPJ = n.DOCUMENTO_EMITENTE OR c.CNPJ = n.DOCUMENTO_DESTINATARIO
                where 
                    (n.DOCUMENTO_EMITENTE = c.CNPJ and n.TIPO_OPERACAO = '0') || 
                    (n.DOCUMENTO_EMITENTE <> c.CNPJ and n.TIPO_OPERACAO = '1');
                drop view if exists nfe_saida;
                create view nfe_saida as
                select * from nfe n
                left join cadastro c on c.CNPJ = n.DOCUMENTO_EMITENTE OR c.CNPJ = n.DOCUMENTO_DESTINATARIO
                where 
                    (n.DOCUMENTO_EMITENTE = c.CNPJ and n.TIPO_OPERACAO = '1') || 
                    (n.DOCUMENTO_EMITENTE <> c.CNPJ and n.TIPO_OPERACAO = '0')    
            `)

            await db.execute(`drop table if exists total_dfs; create table total_dfs as 
                select 'sped' as name, count(*) as count from sped_df 
                union select 'nfe_entrada' as name,  count(DISTINCT CHAVE_ACESSO) as count from nfe_entrada
                union select 'nfe_saida' as name,  count(DISTINCT CHAVE_ACESSO) as count from nfe_saida
                union select 'nfce' as name,  count(DISTINCT CHAVE_ACESSO) as count from nfce
            `)

            await queryCount.refetch();
            await queryNFCENE.refetch();
            await queryNFENE.refetch();
        },
    })

    return <div className="p-4 flex flex-col gap-4">

        <div className="flex justify-end">
            <Button variant={`outline`} onClick={() => mutationRelatorios.mutate()}>
                {mutationRelatorios.isPending && (
                    <Spinner />
                )}
                {mutationRelatorios.isSuccess && (
                    <Check />
                )}
                Atualizar Dados
            </Button>
        </div>

        <div className="flex gap-4">
            <Field className="flex-5">
                <FieldLabel>CNPJ</FieldLabel>

                <Input  value={queryCadastro.data?.CNPJ} />
            </Field>

            <Field className="flex-12">
                <FieldLabel>NOME</FieldLabel>

                <Input disabled value={queryCadastro.data?.NOME} />
            </Field>

            <Field className="flex-4">
                <FieldLabel>IE</FieldLabel>

                <Input disabled value={queryCadastro.data?.IE} />
            </Field>
        </div>

        <div className="grid grid-cols-3 gap-4 ">
            <Card>
                <CardContent>
                    <CardTitle className="text-4xl">
                        {find(queryCount?.data, { name: 'sped' })?.count}

                    </CardTitle>
                    <CardDescription>
                        {/* {JSON.stringify(queryCount.data)} */}
                        Documentos Escriturados
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <CardTitle className="text-4xl">
                        {find(queryCount?.data, { name: 'nfe_entrada' })?.count}

                    </CardTitle>
                    <CardDescription>
                        {/* {JSON.stringify(queryCount.data)} */}
                        NFE de entrada
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <CardTitle className="text-4xl">
                        {find(queryCount?.data, { name: 'nfe_saida' })?.count}

                    </CardTitle>
                    <CardDescription>
                        {/* {JSON.stringify(queryCount.data)} */}
                        NFE de saída
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <CardTitle className="text-4xl">
                        {find(queryCount?.data, { name: 'nfce' })?.count}

                    </CardTitle>
                    <CardDescription>
                        {/* {JSON.stringify(queryCount.data)} */}
                        Notas Fiscais do Consumidor
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <CardTitle className="text-4xl">
                        {queryNFENE.data?.find(_ => true)?.count}
                    </CardTitle>
                    <CardDescription>
                        NFE nao Escriturados
                    </CardDescription>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <CardTitle className="text-4xl">
                        {queryNFCENE.data?.find(_ => true)?.count}
                    </CardTitle>
                    <CardDescription>
                        NFCE nao Escriturados
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    </div>
}