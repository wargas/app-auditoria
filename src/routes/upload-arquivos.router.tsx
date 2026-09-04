
import { UploadSped } from "#components/upload-sped";
import { useParams } from "react-router";


export function Component() {

    const {id} = useParams()

    return <div className="p-4 flex flex-col gap-4">
        <UploadSped id={id!} />
    </div>
}