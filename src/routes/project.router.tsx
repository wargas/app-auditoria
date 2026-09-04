import { useParams } from "react-router"

export function Component() {
    const params = useParams()
    return <div>
        PROJETO

        {JSON.stringify(params)}
    </div>
}