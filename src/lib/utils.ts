import { open } from "@tauri-apps/plugin-fs"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function readFileByLine(path: string, callback: (line: string, size: number, read: number) => Promise<void | null>) {

  return new Promise(async acc => {

    const handle = await open(path, { read: true })

    const stat = await handle.stat()


    const buffer = new Uint8Array(1024)
    let leftOver = ``;
    let fileBytesRead = 0

    while (true) {
      const bytesRead = await handle.read(buffer);
      if (bytesRead == null || bytesRead == 0) break;

      fileBytesRead += bytesRead

      const chunk = leftOver + new TextDecoder().decode(buffer.subarray(0, bytesRead));

      const lines = chunk.split('\n');

      leftOver = lines.pop() ?? ''

      for await (var line of lines) {
        await callback(line, stat.size, fileBytesRead)
      }
    }

    acc(true)
  })
}