import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui/table"
import { getProjectDb } from "#lib/database"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"

export function Component() {

    const params = useParams()

    const query = useQuery({
        queryKey: ["apuracao"],
        queryFn: async () => {
            const db = await getProjectDb(params.id!)

            return db.select<any[]>('select * from apuracao')
        }
    })

    const campos = "VL_TOT_DEBITOS;VL_AJ_DEBITOS;VL_TOT_AJ_DEBITOS;VL_ESTORNOS_CRED;VL_TOT_CREDITOS;VL_AJ_CREDITOS;VL_TOT_AJ_CREDITOS;VL_ESTORNOS_DEB;VL_SLD_CREDOR_ANT;VL_SLD_APURADO;VL_TOT_DED;VL_ICMS_RECOLHER;VL_SLD_CREDOR_TRANSPORTAR;DEB_ESP".split(";")


    return <div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Periodo</TableHead>
                    {campos.map(c => (
                        <TableHead key={c}>{c}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {query.data?.map(l => ({ ...l, partes: l.line.split("|") })).map(r => (
                    <TableRow key={r.id}>
                        <TableCell>{r.periodo}</TableCell>
                        {Array(14).fill(1).map((_, i) => (
                            <TableCell key={i}>{r.partes.at(i + 2)}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
}