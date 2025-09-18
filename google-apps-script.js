// CÓDIGO PARA GOOGLE APPS SCRIPT
// Cole este código no Google Apps Script (script.google.com)

// CONFIGURAÇÃO - PLANILHA ESPECÍFICA DO USUÁRIO
const PLANILHA_ID = '1yU1DiEvfHwjX4xVitAX7Auw5be5E12KKqxWmfsk10YU'; // ID da planilha do usuário
const NOME_ABA = 'Cadastros'; // Nome da aba onde os dados serão salvos

// Função principal que processa as requisições
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        
        if (data.action === 'adicionarCadastro') {
            return adicionarCadastro(data.dados);
        } else if (data.action === 'obterDados') {
            return obterDados();
        } else {
            return ContentService
                .createTextOutput(JSON.stringify({
                    success: false,
                    message: 'Ação não reconhecida'
                }))
                .setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                message: 'Erro no servidor: ' + error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Função para obter dados (GET)
function doGet(e) {
    if (e.parameter.action === 'obterDados') {
        return obterDados();
    }
    
    return ContentService
        .createTextOutput(JSON.stringify({
            success: false,
            message: 'Ação não reconhecida'
        }))
        .setMimeType(ContentService.MimeType.JSON);
}

// Função para adicionar um novo cadastro
function adicionarCadastro(dados) {
    try {
        // Abrir a planilha
        const planilha = SpreadsheetApp.openById(PLANILHA_ID);
        let aba = planilha.getSheetByName(NOME_ABA);
        
        // Se a aba não existir, criar
        if (!aba) {
            aba = planilha.insertSheet(NOME_ABA);
            // Adicionar cabeçalhos
            aba.getRange(1, 1, 1, 6).setValues([[
                'Nome',
                'Email', 
                'CPF',
                'Senha',
                'Tipo',
                'Data Cadastro'
            ]]);
            
            // Formatar cabeçalhos
            const cabecalho = aba.getRange(1, 1, 1, 6);
            cabecalho.setBackground('#4285f4');
            cabecalho.setFontColor('#ffffff');
            cabecalho.setFontWeight('bold');
        }
        
        // Adicionar nova linha (garantindo que comece na linha 2)
        const ultimaLinha = aba.getLastRow();
        const proximaLinha = Math.max(ultimaLinha + 1, 2); // Começar na linha 2
        aba.getRange(proximaLinha, 1, 1, dados.length).setValues([dados]);
        
        return ContentService
            .createTextOutput(JSON.stringify({
                success: true,
                message: 'Cadastro adicionado com sucesso!'
            }))
            .setMimeType(ContentService.MimeType.JSON);
            
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                message: 'Erro ao adicionar cadastro: ' + error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Função para obter todos os dados
function obterDados() {
    try {
        // Abrir a planilha
        const planilha = SpreadsheetApp.openById(PLANILHA_ID);
        const aba = planilha.getSheetByName(NOME_ABA);
        
        if (!aba) {
            return ContentService
                .createTextOutput(JSON.stringify({
                    success: true,
                    dados: []
                }))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        // Obter dados (excluindo cabeçalho)
        const ultimaLinha = aba.getLastRow();
        if (ultimaLinha <= 1) {
            return ContentService
                .createTextOutput(JSON.stringify({
                    success: true,
                    dados: []
                }))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        const dados = aba.getRange(2, 1, ultimaLinha - 1, 6).getValues();
        
        return ContentService
            .createTextOutput(JSON.stringify({
                success: true,
                dados: dados
            }))
            .setMimeType(ContentService.MimeType.JSON);
            
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                message: 'Erro ao obter dados: ' + error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Função de teste
function testarConexao() {
    const resultado = obterDados();
    Logger.log(resultado.getContent());
    return resultado;
}


