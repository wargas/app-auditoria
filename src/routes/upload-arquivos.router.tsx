
import { Item, ItemContent } from "#components/ui/item";
import { UploadNFCE } from "#components/upload-nfce";
import { UploadNFE } from "#components/upload-nfe";
import { UploadSped } from "#components/upload-sped";
import { useParams } from "react-router";


export function Component() {

    const { id } = useParams()

    return <div className="p-4 flex flex-col gap-4">
        <Item variant={`outline`}>
            <ItemContent>
                <UploadSped id={id!} />
            </ItemContent>
        </Item>

        <Item variant={`outline`}>
            <ItemContent>
                <UploadNFCE id={id!} />
            </ItemContent>
        </Item>
        <Item variant={`outline`}>
            <ItemContent>
                <UploadNFE id={id!} />
            </ItemContent>
        </Item>
    </div>
}