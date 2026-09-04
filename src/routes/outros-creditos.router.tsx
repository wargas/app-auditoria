import { Grid } from "#components/grid"
import { getProjectDb } from "#lib/database"
import { useQuery } from "@tanstack/react-query"
import { useRef } from "react"
import { useParams } from "react-router"
import { useResizeObserver } from 'usehooks-ts'

export function Component() {

    const params = useParams()
    const ref = useRef<HTMLDivElement>(null!)

    const {  height } = useResizeObserver({
        ref: ref, 
        box: 'border-box'
    })

    const query = useQuery({
        queryKey: ["apuracao"],
        queryFn: async () => {
            const db = await getProjectDb(params.id!)

            return db.select<any[]>('select * from ajuste_creditos')
        }
    })

    return <div ref={ref} className="h-full">
        
        <div style={{height: (height!-60)}}>
            <Grid rowData={query.data?.map(d => ({
                ...d,
                codigo: d.line.split(`|`).at(2),
                descricao: d.line.split(`|`).at(3),
                valor: d.line.split(`|`).at(4),
                
            }))} columnDefs={[{
                field: `periodo`, headerName: 'PERIODO'
            }, 
            { field: `codigo` },
            { field: `descricao`, flex: 1 },
            { field: `valor` }
            ]} />
        </div>

    </div>
}