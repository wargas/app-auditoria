import { Button } from "#components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "#components/ui/card"
import { Spinner } from "#components/ui/spinner"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useApp } from "../app-context"
import { Field, FieldLabel } from "#components/ui/field"
import { Input } from "#components/ui/input"

export function Component() {

    const app = useApp()
    const db = app.db!

    const queryCadastro = useQuery({
        queryKey: ["cadastro"],
        queryFn: async () => {
            const result = await db.select<{cnpj:string, nome: string, ie: string}[]>('select * from cadastro limit 1')

            if(result.length == 0 ) {
                return  {cnpj: '', nome: '', ie: ''}
            }

            return result[0]
        }
    })

    

    const queryDF = useQuery({
        queryKey: ["count_sped"],
        queryFn: async () => {


            return db.select<any[]>('select count(*) as count from sped_df')
        }
    })

    const queryNFCENE = useQuery({
        queryKey: ["count_nfcene"],
        queryFn: async () => {
            return db.select<any[]>('select count(*) as count from (select chave from nfce_sem_escrituracao group by chave) tb')
        }
    })

    const queryNFENE = useQuery({
        queryKey: ["count_nfene"],
        queryFn: async () => {
            return db.select<any[]>('select count(*) as count from (select chave from nfe_sem_escrituracao group by chave) tb')
        }
    })


    const mutationRelatorios = useMutation({
        mutationFn: async () => {
            const db = app.db!

            await db.execute('drop table if exists nfce_sem_escrituracao; create table nfce_sem_escrituracao as select chave from nfce where chave not in (select chave from sped_df)')
            await db.execute('drop table if exists nfe_sem_escrituracao; create table nfe_sem_escrituracao as select chave from nfe where chave not in (select chave from sped_df)')

            await queryNFCENE.refetch();
            await queryNFENE.refetch();
        }
    })

    return <div className="p-4 flex flex-col gap-4">

        <div>
            <Button onClick={() => mutationRelatorios.mutate()}>
                {mutationRelatorios.isPending && (
                    <Spinner />
                )}
                Atualizar Relatorios
            </Button>
        </div>

        <div className="flex gap-4">
                <Field className="flex-5">
                    <FieldLabel>CNPJ</FieldLabel>
                    
                    <Input disabled value={queryCadastro.data?.cnpj} />
                </Field>

                <Field className="flex-12">
                    <FieldLabel>NOME</FieldLabel>
                    
                    <Input disabled value={queryCadastro.data?.nome} />
                </Field>

                <Field className="flex-4">
                    <FieldLabel>IE</FieldLabel>
                    
                    <Input disabled value={queryCadastro.data?.ie} />
                </Field>
        </div>

        <div className="grid grid-cols-3 gap-4 ">

            <Card>
                <CardContent>
                    <CardTitle className="text-4xl">
                        {queryDF.data?.find(_ => true)?.count}
                    </CardTitle>
                    <CardDescription>
                        DFe Escriturados
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