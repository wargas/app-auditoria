import Database from "@tauri-apps/plugin-sql";
import { parse as parseCSV } from 'papaparse';


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
        const colunas = [
            "CHAVE_ACESSO",
            "SERIE",
            "NUMERO",
            "DATA_EMISSAO",
            "HORA_EMISSAO",
            "SITUACAO",
            "NOME_EMITENTE",
            "DOCUMENTO_EMITENTE",
            "IE_EMITENTE",
            "NOME_DESTINATARIO",
            "DOCUMENTO_DESTINATARIO",
            "NUMERO_DO_ITEM",
            "CODIGO",
            "CODIGO_EAN",
            "TRIBUTACAO_ICMS__CST",
            "CODIGO_SITUACAO_OPERACAO__CSOSN",
            "MODALIDADE_BC",
            "MODALIDADE_BC_ICMS_ST",
            "PC_REDUCAO_BC",
            "PC_REDUCAO_ICMS_ST",
            "VALOR_BC",
            "VALOR_BC_FCP",
            "VALOR_BC_ICMS_ST",
            "VALOR_ICMS",
            "CFOP",
            "PRODUTO",
            "VALOR_TOTAL_DOS_PRODUTOS",
            "NCM",
            "CEST",
            "ALIQUOTA",
            "UNIDADE_COMERCIAL",
            "QUANTIDADE_COMERCIAL",
            "VALOR_UNITARIO_COMERCIALIZACAO",
            "UNIDADE_TRIBUTAVEL",
            "QUANTIDADE_TRIBUTAVEL",
            "VALOR_UNITARIO_DE_TRIBUTACAO",
            "VALOR_DO_DESCONTO",
            "TOTAL_DA_NFCE",
            "CST_DO_IBS",
            "CCLASSTRIB",
            "INDICADOR_DE_DOACAO",
            "BASE_DE_CALCULO_DO_IBS",
            "ALIQUOTA_DO_IBS_ESTADUAL",
            "PERCENTUAL_DO_DIFERIMENTO_DO_IBS_ESTADUAL",
            "DIFERIMENTO_DO_IBS_ESTADUAL",
            "DEVOLUCAO_DO_IBS_ESTADUAL",
            "PERCENTUAL_DE_REDUCAO_DE_ALIQUOTA_DO_IBS_ESTADUAL",
            "ALIQUOTA_EFETIVA_DO_IBS_ESTADUAL",
            "VALOR_DO_IBS_ESTADUAL",
            "VALOR_TOTAL_DO_IBS_ESTORNADO",
            "CST_REGULAR_DO_IBS",
            "CCLASSTRIB_REGULAR",
            "ALIQUOTA_EFETIVA_DO_IBS_ESTADUAL_REGULAR",
            "VALOR_DO_IBS_ESTADUAL_REGULAR",
            "TOTAL_VALOR_PAGAMENTO",
            "TROCO",
            "TIPO_EMISSAO",
            "FORMA_DE_PAGAMENTO_1",
            "VALOR_DO_PAGAMENTO_1",
            "TIPO_DE_INTEGRACAO_1",
            "CNPJ_DA_CREDENCIADORA_DE_CARTAO_1",
            "BANDEIRA_DA_OPERADORA_DE_CARTAO_1",
            "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_1",
            "FORMA_DE_PAGAMENTO_2",
            "VALOR_DO_PAGAMENTO_2",
            "TIPO_DE_INTEGRACAO_2",
            "CNPJ_DA_CREDENCIADORA_DE_CARTAO_2",
            "BANDEIRA_DA_OPERADORA_DE_CARTAO_2",
            "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_2",
            "FORMA_DE_PAGAMENTO_3",
            "VALOR_DO_PAGAMENTO_3",
            "TIPO_DE_INTEGRACAO_3",
            "CNPJ_DA_CREDENCIADORA_DE_CARTAO_3",
            "BANDEIRA_DA_OPERADORA_DE_CARTAO_3",
            "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_3",
            "FORMA_DE_PAGAMENTO_4",
            "VALOR_DO_PAGAMENTO_4",
            "TIPO_DE_INTEGRACAO_4",
            "CNPJ_DA_CREDENCIADORA_DE_CARTAO_4",
            "BANDEIRA_DA_OPERADORA_DE_CARTAO_4",
            "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_4",
            "FORMA_DE_PAGAMENTO_5",
            "VALOR_DO_PAGAMENTO_5",
            "TIPO_DE_INTEGRACAO_5",
            "CNPJ_DA_CREDENCIADORA_DE_CARTAO_5",
            "BANDEIRA_DA_OPERADORA_DE_CARTAO_5",
            "NUMERO_DE_AUTORIZACAO_DA_OPERACAO_5"
        ]

        const sql = `
                insert or ignore into nfce (ID, ${colunas.join(', ')})
                select 
                concat(json_extract(line, '$[0]'), ':', json_extract(line, '$[11]')) as ID,
                ${colunas.map((c, i) => `replace(json_extract(line, '$[${i}]'), '"', '') as ${c}`)}
                from nfce_temp    
            `


        await db.execute(sql)
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
        const colunas = [
            "CHAVE_ACESSO",
            "SERIE",
            "NUMERO",
            "DATA_EMISSAO",
            "HORA_EMISSAO",
            "SITUACAO",
            "NOME_EMITENTE",
            "UF_EMITENTE",
            "DOCUMENTO_EMITENTE",
            "IE_EMITENTE",
            "NOME_DESTINATARIO",
            "UF_DESTINATARIO",
            "DOCUMENTO_DESTINATARIO",
            "IE_DESTINATARIO",
            "FONE_DESTINATARIO",
            "EMAIL_DESTINATARIO",
            "TIPO_OPERACAO",
            "NATUREZA_OPERACAO",
            "NUMERO_ITEM",
            "CODIGO_PRODUTO",
            "CODIGO_EAN",
            "DESCRICAO_PRODUTO",
            "CODIGO_NCM",
            "EXTIPI",
            "CFOP",
            "UNIDADE_COMERCIAL",
            "QUANTIDADE_COMERCIAL",
            "VALOR_UNITARIO_COMERCIALIZACAO",
            "VALOR_PRODUTO",
            "CODIGO_EAN_UNIDADE_TRIBUTAVEL",
            "UNIDADE_TRIBUTAVEL",
            "QUANTIDADE_TRIBUTAVEL",
            "VALOR_UNITARIO_DE_TRIBUTACAO",
            "VALOR_FRETE",
            "VALOR_SEGURO",
            "VALOR_DESCONTO",
            "OUTRAS_DESPESAS_ACESSORIAS",
            "COMPOE_VALOR_TOTAL",
            "INFORMACOES_ADICIONAIS_DO_PRODUTO",
            "GRUPO_DE_TRIBUTACAO",
            "ORIGEM_MERCADORIA",
            "TRIBUTACAO_ICMS",
            "CODIGO_SITUACAO_OPERACAO",
            "MODALIDADE_BC",
            "PC_REDUCAO_BC",
            "VALOR_BC",
            "ALIQUOTA_IMPOSTO",
            "VALOR_ICMS",
            "PC_FCP",
            "VALOR_FCP",
            "VALOR_BC_FCP",
            "PC_FCP_ST",
            "VALOR_FCP_ST",
            "VALOR_BC_FCP_ST",
            "PC_ST",
            "PC_FCP_ST_RETIDO",
            "VALOR_FCP_ST_RETIDO",
            "VALOR_BC_FCP_ST_RETIDO",
            "VALOR_BC_FCP_UF_DESTINO",
            "PC_FCP_UF_DESTINO",
            "VALOR_FCP_UF_DESTINO",
            "MOTIVO_DESONERACAO",
            "MODALIDADE_BC_ICMS_ST",
            "PC_MARGEM_VALOR_ADIC_ICMS_ST",
            "PC_REDUCAO_ICMS_ST",
            "VALOR_BC_ICMS_ST",
            "ALIQUOTA_IMPOSTO_ICMS_ST",
            "VALOR_ICMS_ST",
            "VALOR_BC_ICMS_ST_RETIDO",
            "VALOR_ICMS_ST_RETIDO",
            "VALOR_BC_ICMS_ST_RET_DESTINO",
            "VALOR_ICMS_ST_RET_DESTINO",
            "ALIQUOTA_CREDITO",
            "VALOR_CREDITO",
            "PC_BC",
            "UF_ICMS_ST",
            "VALOR_DO_ICMS_DESONERADO",
            "QUANTIDADE_TRIBUTADA",
            "ALIQUOTA_AD_REM_DO_IMPOSTO",
            "VALOR_DO_ICMS_PROPRIO_DEVIDO",
            "QUANTIDADE_TRIBUTADA_SUJEITA_A_RETENCAO",
            "ALIQUOTA_AD_REM_DO_IMPOSTO_COM_RETENCAO",
            "VALOR_DO_ICMS_COM_RETENCAO",
            "PERCENTUAL_DE_REDUCAO_DA_ALIQUOTA_AD_REM",
            "MOTIVO_DA_REDUCAO_AD_REM",
            "VALOR_DO_ICMS_DA_OPERACAO",
            "PERCENTUAL_DO_DIFERIMENTO",
            "VALOR_DO_ICMS_DIFERIDO",
            "QUANTIDADE_TRIBUTADA_RETIDA_ANTERIORMENTE",
            "ALIQUOTA_DO_IMPOSTO_RETIDO_ANTERIORMENTE",
            "VALOR_DO_ICMS_RETIDO_ANTERIORMENTE",
            "VALOR_TOTAL_DOS_PRODUTOS",
            "VALOR_TOTAL_DO_FRETE",
            "VALOR_TOTAL_DO_SEGURO",
            "VALOR_TOTAL_DO_DESCONTO",
            "VALOR_TOTAL_DO_II",
            "VALOR_TOTAL_DO_IPI",
            "VALOR_DO_PIS",
            "VALOR_DO_COFINS",
            "TOTAL_OUTRAS_DESPESAS_ACESSORIAS",
            "BASE_DE_CALCULO",
            "BASE_DE_CALCULO_ICMS_SUBSTITUTO",
            "TOTAL_VALOR_ICMS",
            "TOTAL_VALOR_FCP",
            "TOTAL_VALOR_FCP_ST",
            "TOTAL_VALOR_FCP_ST_RETIDO",
            "TOTAL_VALOR_FCP_UF_DESTINO",
            "ICMS_SUBSTITUTO",
            "VALOR_ICMS_INTERESTADUAL_UF_DESTINO",
            "VALOR_DA_NOTA",
            "TOTAL_DO_ICMS_DESONERADO",
            "TOTAL_QUANTIDADE_TRIBUTADA_DO_ICMS_MONOFASICO_PROPRIO",
            "TOTAL_ICMS_MONOFASICO_PROPRIO",
            "TOTAL_DA_QUANTIDADE_TRIBUTADA_DO_ICMS_MONOFASICO_SUJEITO_A_RETENCAO",
            "TOTAL_ICMS_MONOFASICO_SUJEITO_A_RETENCAO",
            "TOTAL_DA_QUANTIDADE_TRIBUTADA_DO_ICMS_MONOFASICO_RETIDO_ANTERIORMENTE",
            "TOTAL_ICMS_MONOFASICO_RETIDO_ANTERIORMENTE"
        ]

        const sql = `
                insert or ignore into nfe (ID, ${colunas.join(', ')})
                select 
                concat(json_extract(line, '$[0]'), ':', json_extract(line, '$[18]')) as ID,
                ${colunas.map((c, i) => `replace(json_extract(line, '$[${i}]'), '"', '') as ${c}`)}
                from nfe_temp    
            `
        await db.execute(sql)

        // const erros = await db.select<any[]>(`select * from nfe where nfe.CFOP = 'UN'`)

        // if(erros.length > 0) {
        //     console.log(erros)
        //     throw new Error("Erro plantado")
        // }
    }

}

export class ReadFileSPED implements ReadFile {
    name = "SPED";
    periodo = '';

    validate(line: string) {
        return line.startsWith('|0000|')
    }

    async onReadFile(db: Database) {


        await db.execute('delete from apuracao');
        await db.execute('delete from ajuste_creditos');
        await db.execute('delete from sped_df');

        await db.execute('drop table if exists sped_temp; create table sped_temp (registro text, periodo, line text)');
    }

    async onReadLines(lines: string[], db: Database) {


        const registros = ['0000', 'E110', 'E111', 'C100']

        const lineAbertura = lines.find(f => f.startsWith('|0000|'))


        if (lineAbertura) {
            const partes = lineAbertura.split('|')

            await db.execute(`insert or ignore into cadastro (cnpj, nome, ie) values ($1, $2, $3)`, [partes[7], partes[6], partes[10]])

            this.periodo = partes[4]
        }

        const linesSelecionadas = lines.filter(l => {
            const partes = l.split('|')


            return registros.includes(partes[1])
        })


        if (linesSelecionadas.length > 1) {


            const values = linesSelecionadas.map(l => {
                const partes = l.split('|')


                return `('${partes[1]}', '${this.periodo}', '${JSON.stringify(partes)}')`
            })

            await db.execute(`insert into sped_temp (registro, periodo, line) values ${values.join(',')}`)
        }
    }

    async onEndReadFile(db: Database) {
        await db.execute(`
            insert or ignore into sped_df (id, periodo, chave, modelo, valor_icms, tipo_emitente, tipo_operacao) select 
            concat(json_extract(line, '$[9]'), json_extract(line, '$[4]'), json_extract(line, '$[7]'), json_extract(line, '$[8]')) as id,
            periodo,
            json_extract(line, '$[9]') chave,
            json_extract(line, '$[5]') modelo,
            replace(json_extract(line, '$[22]'), ',', '.') valor_icms,
            json_extract(line, '$[3]') tipo_emitente,
            json_extract(line, '$[2]') tipo_operacao
          from sped_temp where registro = 'C100'
        `);

        await db.execute(`
            insert or ignore into ajuste_creditos (periodo, codigo, descricao, valor) select 
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