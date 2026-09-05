import { open } from "@tauri-apps/plugin-fs"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function* readFileStream(path: string, bufferSize = 1024) {
  const handle = await open(path, { read: true })

  const stat = await handle.stat()

  const buffer = new Uint8Array(bufferSize)
  let leftOver = ``;
  let fileBytesRead = 0

  while (true) {
    const bytesRead = await handle.read(buffer);
    if (bytesRead == null || bytesRead == 0) break;

    fileBytesRead += bytesRead

    const chunk = leftOver + new TextDecoder('latin1').decode(buffer.subarray(0, bytesRead));

    const lines = chunk.split('\n');

    leftOver = lines.pop() ?? ''

    yield { lines, size: stat.size, fileBytesRead }
  }
  

  return ;
}


export function normalizeCSV(line:string) {
  let normalizeLine = line.replace(/;\s+/g, ";").replace(/\s+;/g, ";")
        .replace(/^"/, "[@@@]")
        .replace(/"$/, "[@@@]")
        .replace(/";"/g, "[@@]")
        .replace(/"/g, "")
        .replace(/\[@@\]/g, '";"')
        .replace(/\[@@@\]/g, '"')

    normalizeLine.match(/"(.*?)"/g)?.forEach(m => {
        if(m.includes(";")) {
            normalizeLine = normalizeLine.replace(m, m.replace(/;/g, "_"))
        }
    })

    return normalizeLine   
}