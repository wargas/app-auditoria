import Database from "@tauri-apps/plugin-sql";
import { parse as parseCSV } from 'papaparse';
import { campos0200, camposC100, camposH010, camposNFCE, camposNFE } from "../config";


export interface ReadFile {
    name: string
    validate(line: string): boolean
    onReadFile(db: Database): Promise<void>
    onReadLines(lines: string[], db: Database): Promise<void>
    onEndReadFile(db: Database): Promise<void>
}


export class ReadFileNFCE implements ReadFile {
    name = "NFCE"
    validate(line: string) {
        return line.split(";").length == 87
    }

    async onReadFile(db: Database) {
        await db.execute('drop table if exists nfce_temp; create table nfce_temp (line text)');
    }

    async onReadLines(lines: string[], db: Database) {

        const data = lines
            .filter(l => !l.trim().startsWith('Nota;'))
            .filter(l => !l.trim().startsWith('Chave'))
            .map(l => l.replace(/=/g, '').replace(/'/g, ""))
            .map(l => parseCSV<string[]>(l).data[0])


        const values = data.map(csv => csv.map(c => c.replace(/"/g, "")))
            .map(l => JSON.stringify(l))
            .map(l => `('${l}')`)



        if (values.length > 0) {


            const sql = `insert into nfce_temp (line) values ${values.join(`,`)}`

            await db.execute(sql)
        }
    }

    async onEndReadFile(db: Database) {
        const values = camposNFCE.map((c, i) => {

            const primaryValue = `replace(json_extract(line, '$[${i}]'), '"', '')`

            if (c.type == 'float') {
                const removePontos = `replace(${primaryValue}, '.', '')`

                return `cast(replace(${removePontos}, ',', '.') as float) as ${c.name}`
            }

            if (c.type == 'percent') {
                const valueFloat = `replace(${primaryValue}, ',', '.')`;

                return `cast(replace(${valueFloat}, '%', '') as float) as ${c.name}`
            }

            if (c.type == 'date') {
                return `
                substr(${primaryValue}, 7, 4) || '-'  || substr(${primaryValue}, 4, 2) || '-'  || substr(${primaryValue}, 1, 2) as ${c.name}`
            }


            return `${primaryValue} as ${c.name}`
        })

        const sql = `
                insert or ignore into nfce (ID, ${camposNFCE.map(c => c.name).join(', ')})
                select 
                concat(json_extract(line, '$[0]'), ':', json_extract(line, '$[11]')) as ID,
                ${values.join(`,\n`)}
                from nfce_temp    
            `

        await db.execute(sql)

        await db.execute(`drop table nfce_temp`)
    }

}

export class ReadFileNFE implements ReadFile {
    name = "NFE"
    validate(line: string) {
        return line.split(";").length == 117
    }

    async onReadFile(db: Database) {
        await db.execute('drop table if exists nfe_temp; create table nfe_temp (line text)');
    }

    async onReadLines(lines: string[], db: Database) {
        const values = lines
            .filter(l => !l.trim().startsWith('Nota;'))
            .filter(l => !l.trim().startsWith('Chave'))
            .map(l => l.replace(/=/g, '').replace(/'/g, ""))
            .map(l => parseCSV<string[]>(l).data[0])
            .map(csv => csv.map(c => c.replace(/"/g, "")))
            .map(l => JSON.stringify(l))
            .map(l => `('${l}')`)



        if (values.length > 0) {
            const sql = `insert into nfe_temp (line) values ${values.join(`,`)}`

            await db.execute(sql)
        }
    }

    async onEndReadFile(db: Database) {
        const values = camposNFE.map((c, i) => {

            const primaryValue = `replace(json_extract(line, '$[${i}]'), '"', '')`

            if (c.type == 'float') {
                const removePontos = `replace(${primaryValue}, '.', '')`

                return `cast(replace(${removePontos}, ',', '.') as float) as ${c.name}`
            }

            if (c.type == 'percent') {
                const valueFloat = `replace(${primaryValue}, ',', '.')`;

                return `cast(replace(${valueFloat}, '%', '') as float) as ${c.name}`
            }

            if (c.type == 'date') {
                return `
                substr(${primaryValue}, 7, 4) || '-'  || substr(${primaryValue}, 4, 2) || '-'  || substr(${primaryValue}, 1, 2) as ${c.name}`
            }


            return `${primaryValue} as ${c.name}`
        })

        const sql = `
                insert or ignore into nfe (ID, ${camposNFE.map(c => c.name).join(', ')})
                select 
                concat(json_extract(line, '$[0]'), ':', json_extract(line, '$[18]')) as ID,
                ${values.join(`, `)}
                from nfe_temp    
            `



        await db.execute(sql)

        await db.execute('drop table if exists nfe_temp');
    }

}

export class ReadFileSPED implements ReadFile {
    name = "SPED";
    periodo = '';
    dataInventario = ''

    validate(line: string) {
        return line.startsWith('|0000|')
    }

    async onReadFile(db: Database) {
        // await db.execute('delete from apuracao');
        // await db.execute('delete from ajuste_creditos');
        // await db.execute('delete from sped_df');

        await db.execute('drop table if exists sped_temp; create table sped_temp (registro text, periodo, line text)');
    }

    async onReadLines(lines: string[], db: Database) {


        const registros = ['0000', 'E110', 'E111', 'C100', 'H005', 'H010', '0200']

        const lineAbertura = lines.find(f => f.startsWith('|0000|'))


        if (lineAbertura) {
            const partes = lineAbertura.split('|')

            await db.execute(`insert or ignore into cadastro (CNPJ, NOME, IE) values ($1, $2, $3)`, [partes[7], partes[6], partes[10]])

            this.periodo = partes[4].replace(/(\d{2})(\d{2})(\d{4})/, "$3-$2")
        }

        const lineAberturaInventario = lines.find(f => f.startsWith('|H005|'))

        if (lineAberturaInventario) {
            const partes = lineAberturaInventario.split('|')

            this.dataInventario = partes[2]
        }

        const linesSelecionadas = lines.filter(l => {
            const partes = l.split('|')



            return registros.includes(partes[1])
        })



        if (linesSelecionadas.length > 0) {
            const values = linesSelecionadas.map(l => {
                const partes = l.split('|')


                return `('${partes[1]}', '${this.periodo}', '${JSON.stringify(partes)}')`
            })



            await db.execute(`insert into sped_temp (registro, periodo, line) values ${values.join(',')}`)
        }
    }

    async onEndReadFile(db: Database) {
        const mapValues = (c: any, i: number) => {

            const primaryValue = `replace(json_extract(line, '$[${i + 2}]'), '"', '')`

            if (c.type == 'float') {
                const removePontos = `replace(${primaryValue}, '.', '')`

                return `cast(replace(${removePontos}, ',', '.') as float) as ${c.name}`
            }

            if (c.type == 'percent') {
                const valueFloat = `replace(${primaryValue}, ',', '.')`;

                return `cast(replace(${valueFloat}, '%', '') as float) as ${c.name}`
            }

            if (c.type == 'date') {
                return `
                substr(${primaryValue}, 5, 4) || '-'  || substr(${primaryValue}, 3, 2) || '-'  || substr(${primaryValue}, 1, 2) as ${c.name}`
            }


            return `${primaryValue} as ${c.name}`
        }
        const values = camposC100.map(mapValues)
        const values0200 = campos0200.map(mapValues)
        const valuesH010 = camposH010.map(mapValues)

        // const rows = await db.select(`select count(*) as c from sped_temp where registro = 'C100'`)

        await db.execute(`
            insert or ignore into estoque (${camposH010.map(c => c.name).join(`,`)}, DATA) select ${valuesH010.join(',')}, '${this.dataInventario}'
          from sped_temp where registro = 'H010'
        `);

        await db.execute(`
            insert or ignore into produtos (${campos0200.map(c => c.name).join(`,`)}) select ${values0200.join(',')}
          from sped_temp where registro = '0200'
        `);

        await db.execute(`
            insert or ignore into sped_df (ID, PERIODO, ${camposC100.map(c => c.name).join(`,`)}) select 
            concat(json_extract(line, '$[9]'), json_extract(line, '$[4]'), json_extract(line, '$[7]'), json_extract(line, '$[8]')) as ID,
            PERIODO,
            ${values.join(',')}
          from sped_temp where registro = 'C100'
        `);

        await db.execute(`
            insert or ignore into ajuste_creditos (id, periodo, codigo, descricao, valor) select 
            periodo || json_extract(line, '$[2]') as id,
            periodo,
            json_extract(line, '$[2]') codigo,
            json_extract(line, '$[3]') descricao,
            replace(json_extract(line, '$[4]'), ',', '.') valor
            from sped_temp where registro = 'E111'    
        `)

        await db.execute(`
            insert or ignore into apuracao 
            select 
            periodo,
            replace(json_extract(line, '$[2]'), ',', '.'),
            replace(json_extract(line, '$[3]'), ',', '.'),
            replace(json_extract(line, '$[4]'), ',', '.'),
            replace(json_extract(line, '$[5]'), ',', '.'),
            replace(json_extract(line, '$[6]'), ',', '.'),
            replace(json_extract(line, '$[7]'), ',', '.'),
            replace(json_extract(line, '$[8]'), ',', '.'),
            replace(json_extract(line, '$[9]'), ',', '.'),
            replace(json_extract(line, '$[10]'), ',', '.'),
            replace(json_extract(line, '$[11]'), ',', '.'),
            replace(json_extract(line, '$[12]'), ',', '.'),
            replace(json_extract(line, '$[13]'), ',', '.'),
            replace(json_extract(line, '$[14]'), ',', '.'),
            replace(json_extract(line, '$[15]'), ',', '.')
            from sped_temp where registro = 'E110'    
        `)

        await db.execute('drop table if exists sped_temp');
    }

}