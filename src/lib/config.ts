import { Store } from "@tauri-apps/plugin-store"

type Config = {
    buffer_size: number
    dark: boolean,
}

const DEFAULT_CONFIG:Config = {
    buffer_size: 1,
    dark: false,
}

export async function getConfig() {
    const store = await Store.load('app.json')

    
    return await store.get<Config>('config') || DEFAULT_CONFIG
}

export async function setConfig(input: Partial<Config>) {
    const store = await Store.load('app.json')
    const prevConfig = await getConfig();

    await store.set('config', {...prevConfig, ...input})
}