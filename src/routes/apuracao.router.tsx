import { Grid } from "#components/grid"
import { useQuery } from "@tanstack/react-query"
import { useApp } from "../app-context"

export function Component() {

    const app = useApp()

    const query = useQuery({
        queryKey: ["apuracao"],
        queryFn: async () => {
            const db = app.db!

            return db.select<any[]>('select * from apuracao')
        }
    })

    const campos = "VL_TOT_DEBITOS;VL_AJ_DEBITOS;VL_TOT_AJ_DEBITOS;VL_ESTORNOS_CRED;VL_TOT_CREDITOS;VL_AJ_CREDITOS;VL_TOT_AJ_CREDITOS;VL_ESTORNOS_DEB;VL_SLD_CREDOR_ANT;VL_SLD_APURADO;VL_TOT_DED;VL_ICMS_RECOLHER;VL_SLD_CREDOR_TRANSPORTAR;DEB_ESP".split(";")

    
    return <div className="h-full">
            <Grid columnDefs={[
                { field: `PERIODO` },
                // { field: `line` },
                ...campos.map(c => ({ field: c }))
            ]} rowData={query.data} />
        
    </div>
}