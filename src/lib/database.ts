import Database from "@tauri-apps/plugin-sql";
import { camposC100, camposNFCE, camposNFE } from "../config";

export async function initDb(db: Database) {
    await db.execute(`create table if not exists sped_df (
        ID text primary key, 
        PERIODO text,
        ${camposC100.map(c => `${c.name} ${c.type}`).join(`,`)}
    )`)


    await db.execute(`create table if not exists apuracao (PERIODO VARCHAR(10) PRIMARY KEY,  VL_TOT_DEBITOS FLOAT,  VL_AJ_DEBITOS FLOAT,  VL_TOT_AJ_DEBITOS FLOAT,  VL_ESTORNOS_CRED FLOAT,  VL_TOT_CREDITOS FLOAT,  VL_AJ_CREDITOS FLOAT,  VL_TOT_AJ_CREDITOS FLOAT,  VL_ESTORNOS_DEB FLOAT,  VL_SLD_CREDOR_ANT FLOAT,  VL_SLD_APURADO FLOAT,  VL_TOT_DED FLOAT,  VL_ICMS_RECOLHER FLOAT,  VL_SLD_CREDOR_TRANSPORTAR FLOAT,  DEB_ESP FLOAT)`)

    await db.execute(`create table if not exists ajuste_creditos (ID TEXT PRIMARY KEY, PERIODO TEXT, CODIGO TEXT, DESCRICAO TEXT, VALOR FLOAT, LINE TEXT)`)
    
    await db.execute(`create table if not exists nfce (
            ID text primary key, 
            ${camposNFCE.map(c => ({...c, type: c.type == 'percent' ? 'float' : c.type})).map(c => `${c.name} ${c.type}`).join(',\n')}
        )`)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS nfe (
            ID TEXT PRIMARY KEY,
            ${camposNFE.map(c => ({...c, type: c.type == 'percent' ? 'float' : c.type})).map(c => `${c.name} ${c.type}`).join(',\n')}
        )    
        
    `)
    await db.execute(`create table if not exists cadastro (CNPJ TEXT PRIMARY KEY, NOME TEXT, IE TEXT)`)

}