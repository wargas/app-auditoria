
import { Item, ItemContent } from "#components/ui/item";
import { UploadNFCE } from "#components/upload-nfce";
import { UploadNFE } from "#components/upload-nfe";
import { UploadSped } from "#components/upload-sped";


export function Component() {

    return <div className="p-4 flex flex-col gap-4">
        <Item variant={`outline`}>
            <ItemContent>
                <UploadSped  />
            </ItemContent>
        </Item>

        <Item variant={`outline`}>
            <ItemContent>
                <UploadNFCE  />
            </ItemContent>
        </Item>
        <Item variant={`outline`}>
            <ItemContent>
                <UploadNFE  />
            </ItemContent>
        </Item>
    </div>
}