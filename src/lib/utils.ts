import { open } from "@tauri-apps/plugin-fs"
import { load } from "@tauri-apps/plugin-store"
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


  return;
}

export async function getProject() {
  const store = await load('auditoria.json')

  return await store.get<string>('project-path')
}

export async function setProject(path: string) {
  const store = await load('auditoria.json')

  return await store.set('project-path', path)
}