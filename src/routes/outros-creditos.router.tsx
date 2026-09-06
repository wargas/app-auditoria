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
                field: `periodo`, flex: 1, headerName: 'PERIODO'
            },
            { field: `codigo`, flex: 1 },
            { field: `descricao`, flex: 2 },
            { field: `valor`, flex: 1 }
            ]} />
        </div>

    </div>
}