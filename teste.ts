const lineGroups = `Nota;;;;;;;;;;;;;;;;;;Item;;;;;;;;;;;;;;;;;;;;;ICMS;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Total;;;;;;;;;;;;;;;;;;;;;;;;;`;
const lineColumns = `Chave Acesso;Serie;Numero;Data Emissao;Hora Emissao;Situacao;Nome Emitente;UF Emitente;Documento Emitente;IE Emitente;Nome Destinatario;UF Destinatario;Documento Destinatario;IE Destinatario;Fone Destinatario;Email Destinatario;Tipo Operacao;Natureza Operacao;Numero Item;Codigo Produto;Codigo EAN;Descricao Produto;Codigo NCM;EXTIPI;CFOP;Unidade Comercial;Quantidade Comercial;Valor Unitario Comercializacao;Valor Produto;Codigo EAN Unidade Tributavel;Unidade Tributavel;Quantidade Tributavel;Valor Unitario de Tributacao;Valor Frete;Valor Seguro;Valor Desconto;Outras Despesas Acessorias;Compoe Valor Total;Informacoes Adicionais do Produto;Grupo de Tributacao;Origem Mercadoria;Tributacao ICMS;Codigo Situacao Operacao;Modalidade BC;% Reducao BC;Valor BC;Aliquota Imposto;Valor ICMS;% FCP;Valor FCP;Valor BC FCP;% FCP ST;Valor FCP ST;Valor BC FCP ST;% ST;% FCP ST Retido;Valor FCP ST Retido;Valor BC FCP ST Retido;Valor BC FCP UF Destino;% FCP UF Destino;Valor FCP UF Destino;Motivo Desoneracao;Modalidade BC ICMS ST;% Margem Valor Adic. ICMS ST;% Reducao ICMS ST;Valor BC ICMS ST;Aliquota Imposto ICMS ST;Valor ICMS ST;Valor BC ICMS ST Retido;Valor ICMS ST Retido;Valor BC ICMS ST Ret. Destino;Valor ICMS ST Ret. Destino;Aliquota Credito;Valor Credito;% BC;UF ICMS ST;Valor do ICMS desonerado;Quantidade tributada;Aliquota ad rem do imposto;Valor do ICMS proprio devido;Quantidade tributada sujeita a retencao;Aliquota ad rem do imposto com retencao;Valor do ICMS com retencao;Percentual de reducao da aliquota ad rem;Motivo da reducao ad rem;Valor do ICMS da operacao;Percentual do diferimento;Valor do ICMS diferido;Quantidade tributada retida anteriormente;Aliquota do imposto retido anteriormente;Valor do ICMS retido anteriormente;Valor Total dos Produtos;Valor Total do Frete;Valor Total do Seguro;Valor Total do Desconto;Valor Total do II;Valor Total do IPI;Valor do PIS;Valor do COFINS;Outras Despesas Acessorias;Base de Calculo;Base de Calculo ICMS substituto;Valor ICMS;Valor FCP;Valor FCP ST;Valor FCP ST Retido;Valor FCP UF Destino;ICMS Substituto;Valor ICMS Interestadual UF Destino;Valor da Nota;Total do ICMS desonerado;Total quantidade tributada do ICMS monofasico proprio;Total ICMS monofasico proprio;Total da quantidade tributada do ICMS monofasico  sujeito a retencao;Total ICMS monofasico sujeito a retencao;Total da quantidade tributada do ICMS monofasico  retido anteriormente;Total ICMS monofasico retido anteriormente`


const groups = lineGroups.split(";").map(g => {
    return g.toLocaleUpperCase()
        .replace(/\s+/g, "_")
        .replace(/%/g, "PC")
        .replace(/[^A-Z0-9_]/g, "")
})

let prevGroup = ''
const columns = lineColumns.split(";").map((c, i) => {

    let g = groups[i]

    if (g == '') {
        g = prevGroup
    }

    if(g != '') {
        prevGroup = g
    }


    return {
        col: c.toLocaleUpperCase()
            .replace(/\s+/g, "_")
            .replace(/%/g, "PC")
            .replace(/[^A-Z0-9_]/g, ""), group: g
    }
})

const colsSet = new Set<string>()

columns.forEach(c => {
    if(colsSet.has(c.col)) {
        colsSet.add(`${c.group}_${c.col}`)
    } else {
        colsSet.add(c.col)
    }

})

console.log(colsSet)

