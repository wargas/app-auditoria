import Database from "@tauri-apps/plugin-sql";

export async function getProjectDb(id: string) {
    const name = `sqlite:db-${id}.sqlite`;

    const db = await Database.load(name);

    await db.execute(`create table if not exists sped_df (periodo text, chave text primary key, valor_icms float, line text)`)
    await db.execute(`create table if not exists apuracao (periodo text, line text)`)
    await db.execute(`create table if not exists ajuste_creditos (periodo text, line text)`)
    
    
    return db;
}

