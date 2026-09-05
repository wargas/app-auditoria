import Database from "@tauri-apps/plugin-sql";

export async function getProjectDb(id: string) {
    const name = `sqlite:db-${id}.sqlite`;

    const db = await Database.load(name);

    await db.execute(`create table if not exists sped_df (id text primary key, periodo text, chave text, modelo varchar(2), tipo_emitente varchar(1), tipo_operacao varchar(1), valor_icms float, line text)`)
    await db.execute(`create table if not exists apuracao (periodo text, line text)`)
    await db.execute(`create table if not exists ajuste_creditos (periodo text, line text)`)
    await db.execute(`create table if not exists nfce (id text primary key, chave text, valor_icms float, line text)`)
    await db.execute(`create table if not exists nfe (id text primary key, chave text, emitente text, destinatario text, tipo_operacao text, valor_icms float, line text)`)
    
    
    return db;
}

