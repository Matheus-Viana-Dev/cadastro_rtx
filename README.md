# RTX Operações - Sistema de Cadastro com Google Sheets

Sistema de cadastro que salva dados automaticamente no Google Sheets e permite visualização através de um dashboard.

## 🚀 Funcionalidades

- ✅ **Formulário de cadastro** com validação
- ✅ **Salvamento duplo**: Google Sheets + Webhook
- ✅ **Dashboard completo** com estatísticas avançadas
- ✅ **Gráficos interativos** (cadastros por dia, distribuição por horário)
- ✅ **Exportação** para Excel e CSV
- ✅ **Estatísticas detalhadas**:
  - Total de acessos
  - Total de cadastros
  - Cadastros completos/incompletos
  - Taxa de conversão
- ✅ **Interface responsiva** e moderna

## Dados Enviados

Quando um usuário se cadastra, apenas os dados do formulário são enviados para o webhook em formato JSON:

```json
{
  "nome": "Nome do usuário",
  "email": "email@exemplo.com", 
  "cpf": "000.000.000-00",
  "senha": "senha123",
  "tipoUsuario": "cliente",
  "dataCadastro": "01/01/2024, 12:00:00"
}
```

### Campos Incluídos:
- **nome**: Nome completo do usuário
- **email**: E-mail do usuário
- **cpf**: CPF formatado (000.000.000-00)
- **senha**: Senha escolhida pelo usuário
- **tipoUsuario**: "cliente" ou "gn"
- **dataCadastro**: Data e hora do cadastro no formato brasileiro

## ⚙️ Configuração

### 1. Configurar Google Sheets
1. Siga as instruções no arquivo `INSTRUCOES_GOOGLE_SHEETS.md`
2. Configure o Google Apps Script
3. Copie a URL do webhook gerada

### 2. Configurar o Site
1. Abra o arquivo `script.js`
2. Configure as URLs:
   ```javascript
   const GOOGLE_SHEETS_CONFIG = {
       sheetsId: '1yU1DiEvfHwjX4xVitAX7Auw5be5E12KKqxWmfsk10YU', // ✅ Já configurado
       scriptUrl: 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI', // Configure após criar o script
   };
   
   const WEBHOOK_URL = 'https://seu-webhook-aqui.com/endpoint'; // Configure seu webhook
   ```

### 3. Usar o Sistema
1. Abra o arquivo `index.html` em um navegador
2. Os usuários podem se cadastrar normalmente
3. Os dados serão salvos automaticamente no Google Sheets
4. Use o botão "Ver Dashboard" para visualizar os dados

## 📁 Estrutura do Projeto

- `index.html` - Página principal com formulário e dashboard
- `script.js` - Lógica JavaScript para Google Sheets e dashboard
- `styles.css` - Estilos da página e dashboard
- `chart-background.js` - Efeito de fundo animado
- `google-apps-script.js` - Código para Google Apps Script
- `INSTRUCOES_GOOGLE_SHEETS.md` - Instruções detalhadas de configuração

## 🎯 Dashboard

O dashboard permite visualizar:
- **Estatísticas em tempo real**
- **Lista de todos os cadastros**
- **Filtros por tipo de usuário**
- **Atualização automática**

## 📋 Requisitos

- Navegador web moderno
- Conta Google (para Google Sheets)
- Conexão com internet

## 🔒 Segurança

- ✅ Dados salvos no Google Sheets (nuvem segura)
- ✅ Acesso controlado por você
- ✅ Backup automático do Google
- ✅ Histórico de alterações

## 🆘 Suporte

Para problemas ou dúvidas, consulte o arquivo `INSTRUCOES_GOOGLE_SHEETS.md` com instruções detalhadas.