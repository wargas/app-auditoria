import { Grid } from "#components/grid"
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

    const campos = "vl_tot_debitos;vl_aj_debitos;vl_tot_aj_debitos;vl_estornos_cred;vl_tot_creditos;vl_aj_creditos;vl_tot_aj_creditos;vl_estornos_deb;vl_sld_credor_ant;vl_sld_apurado;vl_tot_ded;vl_icms_recolher;vl_sld_credor_transportar;deb_esp".split(";")

    



    return <div className="h-full">
            <Grid columnDefs={[
                { field: `periodo` },
                // { field: `line` },
                ...campos.map(c => ({ field: c }))
            ]} rowData={query.data} />
        
    </div>
}