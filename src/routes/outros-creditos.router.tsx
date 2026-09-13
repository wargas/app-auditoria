import { Grid } from "#components/grid"
import { useQuery } from "@tanstack/react-query"
import { useApp } from "../app-context"

export function Component() {

    const app = useApp()

    const query = useQuery({
        queryKey: ["apuracao"],
        queryFn: async () => {
            const db = app.db!

            return db.select<any[]>('select * from ajuste_creditos')
        }
    })

    return <div className="h-full">

        <div className="h-full">
            <Grid rowData={query.data} columnDefs={[{
                field: `PERIODO`, flex: 1, headerName: 'PERIODO'
            },
            { field: `CODIGO`, flex: 1 },
            { field: `DESCRICAO`, flex: 2 },
            { field: `VALOR`, flex: 1 }
            ]} />
        </div>

    </div>
}