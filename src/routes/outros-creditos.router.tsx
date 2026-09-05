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

            return db.select<any[]>('select * from ajuste_creditos')
        }
    })

    return <div className="h-full">

        <div className="h-full">
            <Grid rowData={query.data} columnDefs={[{
                field: `periodo`, flex: 1, headerName: 'PERIODO'
            },
            { field: `codigo`, flex: 1 },
            { field: `descricao`, flex: 2 },
            { field: `valor`, flex: 1 }
            ]} />
        </div>

    </div>
}