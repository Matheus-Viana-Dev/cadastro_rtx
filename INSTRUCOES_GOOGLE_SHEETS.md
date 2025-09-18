# 📊 Configuração do Google Sheets - RTX Operações

## 🎯 Passo a Passo Completo

### 1. ✅ Sua Planilha Já Está Configurada!

**URL da sua planilha**: https://docs.google.com/spreadsheets/d/1yU1DiEvfHwjX4xVitAX7Auw5be5E12KKqxWmfsk10YU/edit

**ID da planilha**: `1yU1DiEvfHwjX4xVitAX7Auw5be5E12KKqxWmfsk10YU`

**Importante**: Os dados começarão na **linha 2** da planilha (a linha 1 pode ser usada para cabeçalhos se necessário).

### 2. Configurar Google Apps Script

1. **Acesse**: https://script.google.com
2. **Clique** em "Novo projeto"
3. **Cole o código** do arquivo `google-apps-script.js` (já está configurado com sua planilha!)
4. **Verifique as configurações** (já estão corretas):
   ```javascript
   const PLANILHA_ID = '1yU1DiEvfHwjX4xVitAX7Auw5be5E12KKqxWmfsk10YU'; // Sua planilha
   const NOME_ABA = 'Cadastros'; // Nome da aba (opcional)
   ```

### 3. Salvar e Executar

1. **Salve** o projeto (Ctrl+S)
2. **Nomeie** como "RTX Webhook"
3. **Clique** em "Executar" para autorizar
4. **Autorize** o acesso à planilha quando solicitado

### 4. Deploy do Script

1. **Clique** em "Implantar" → "Nova implantação"
2. **Tipo**: Aplicativo da web
3. **Configurações**:
   - Descrição: "RTX Cadastros API"
   - Executar como: Eu
   - Quem tem acesso: Qualquer pessoa
4. **Clique** em "Implantar"
5. **Copie a URL** gerada

### 5. Configurar no Site

1. **Abra** o arquivo `script.js`
2. **Substitua** a URL:
   ```javascript
   const GOOGLE_SHEETS_CONFIG = {
       scriptUrl: 'SUA_URL_DO_APPS_SCRIPT_AQUI',
   };
   ```

## 🔧 Estrutura da Planilha

A planilha será criada automaticamente com as colunas:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Nome | Email | CPF | Senha | Tipo | Data Cadastro |

## 📱 Como Funciona

1. **Usuário preenche** o formulário no site
2. **Dados são enviados** para o Google Apps Script
3. **Script salva** na planilha do Google Sheets
4. **Dashboard carrega** os dados da planilha em tempo real

## 🎨 Dashboard

O dashboard mostra:
- ✅ **Total de cadastros**
- ✅ **Quantidade de clientes**
- ✅ **Quantidade de GN**
- ✅ **Tabela com últimos 10 cadastros**
- ✅ **Atualização em tempo real**

## 🔒 Segurança

- ✅ Dados salvos no Google Sheets (nuvem segura)
- ✅ Acesso controlado por você
- ✅ Backup automático do Google
- ✅ Histórico de alterações

## 🚀 Vantagens

- ✅ **Gratuito** (Google Sheets)
- ✅ **Acesso de qualquer lugar**
- ✅ **Backup automático**
- ✅ **Fácil de exportar**
- ✅ **Compartilhamento seguro**
- ✅ **Interface familiar**

## ❗ Problemas Comuns

### Erro de CORS
- **Solução**: Use a URL do Apps Script (não a planilha direta)

### Erro de Autorização
- **Solução**: Execute o script uma vez para autorizar

### Planilha não encontrada
- **Solução**: Verifique se o ID da planilha está correto

### Dados não aparecem
- **Solução**: Verifique se o nome da aba está correto

## 📞 Suporte

Se tiver problemas:
1. Verifique se todos os IDs estão corretos
2. Execute o script no Google Apps Script
3. Verifique as permissões da planilha
4. Teste a URL do webhook no navegador


