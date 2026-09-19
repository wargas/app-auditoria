import { Button } from "#components/ui/button";
import { readFileStream } from "#lib/utils";
import { open } from "@tauri-apps/plugin-dialog";
import { parse } from "papaparse"
import { useState } from "react";
import { Table, TableHead, TableRow } from "#components/ui/table";

export function Component() {

    const [path, setPath] = useState('')
    const [header, setHeader] = useState<any[]>([])


    async function selectFile() {
        const file = await open({
            filters: [{ name: "Arquivo CSV", extensions: ["csv"] }]
        })

        if (!file) return;

        setPath(file)

        await configure()
    }

    async function configure() {
        for await (var { lines,  } of readFileStream(path, 10 * 1024, "utf8")) {
            if (lines.length == 0) continue;

            const header = parse(lines.join("\n"), {
                delimiter: ";",
                header: false,
                newline: "\n"
            });

            setHeader(header.data)

            break;
        }
    }

    return <div className="p-4">
        <Button onClick={selectFile}>Arquivo CSV</Button>

        <br />
        {/* {path} */}

        <br />
        <Table>
            {header.map((h:string) => (
                <TableRow>
                    <TableHead>{h}</TableHead>
                </TableRow>
            ))}
        </Table>
    </div>
}