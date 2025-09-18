# RTX Operações - Sistema de Cadastro Web

Sistema completo de cadastro web com backend Node.js para armazenamento de dados em servidor.

## 🚀 Funcionalidades

- **Cadastro de usuários** com validação completa
- **Área administrativa** com dashboard e estatísticas
- **Exportação de dados** em Excel e CSV
- **Interface responsiva** com tema escuro
- **Gráficos interativos** de fundo estilo Binance
- **Armazenamento no servidor** (não mais localStorage)

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)

## 🛠️ Instalação

1. **Clone ou baixe os arquivos** do projeto para seu servidor

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor**:
   ```bash
   npm start
   ```

   Ou para desenvolvimento com auto-reload:
   ```bash
   npm run dev
   ```

4. **Acesse o sistema**:
   - Abra seu navegador em: `http://localhost:8081`
   - Ou acesse pelo IP do servidor: `http://SEU_IP:8081`

## 📁 Estrutura do Projeto

```
rtx_cadastro_web/
├── server.js              # Servidor Node.js
├── package.json           # Dependências e scripts
├── index.html             # Interface principal
├── script.js              # Lógica do frontend
├── styles.css             # Estilos CSS
├── chart-background.js    # Gráficos de fundo
├── data/                  # Pasta de dados (criada automaticamente)
│   └── cadastros.json     # Arquivo de dados dos cadastros
└── README.md              # Este arquivo
```

## 🔧 Configuração

### Porta do Servidor
Por padrão, o servidor roda na porta 8081. Para alterar:

```bash
PORT=8080 npm start
```

### Credenciais Administrativas
Para acessar a área administrativa:
- **Usuário**: `admin`
- **Senha**: `rtx2024`

⚠️ **IMPORTANTE**: Altere essas credenciais em produção!

## 📊 API Endpoints

### Cadastro
- `POST /api/cadastrar` - Cadastrar novo usuário
- `GET /api/cadastros` - Listar todos os cadastros
- `GET /api/estatisticas` - Obter estatísticas

### Exportação
- `GET /api/exportar/excel` - Exportar dados em Excel
- `GET /api/exportar/csv` - Exportar dados em CSV

### Status
- `GET /api/status` - Verificar status do servidor

## 🚀 Deploy em Produção

### Opção 1: Servidor VPS/Dedicado
1. Faça upload dos arquivos para o servidor
2. Instale o Node.js no servidor
3. Execute `npm install`
4. Execute `npm start`
5. Configure um proxy reverso (nginx) se necessário

### Opção 2: Heroku
1. Crie um arquivo `Procfile`:
   ```
   web: node server.js
   ```
2. Faça deploy no Heroku
3. O Heroku automaticamente detectará o `package.json`

### Opção 3: Vercel/Netlify
1. Configure o build command: `npm install`
2. Configure o start command: `npm start`
3. Faça deploy

## 🔒 Segurança

- As senhas dos usuários são armazenadas no servidor (considere criptografar)
- Validação de email e CPF únicos
- CORS configurado para permitir requisições
- Validação de dados no frontend e backend

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Smartphone
- Modo escuro forçado

## 🎨 Personalização

### Cores e Tema
Edite o arquivo `styles.css` para personalizar:
- Cores principais
- Gradientes
- Animações
- Layout

### Logo
Substitua o arquivo `logo_rtx.png` pela sua logo.

## 🐛 Solução de Problemas

### Erro de Porta em Uso
```bash
# Encontre o processo usando a porta 8081
lsof -ti:8081

# Mate o processo
kill -9 PID_DO_PROCESSO
```

### Erro de Permissão
```bash
# Dê permissão de execução
chmod +x server.js
```

### Dados não Carregam
1. Verifique se o servidor está rodando
2. Verifique se a pasta `data/` existe
3. Verifique as permissões de escrita

## 📞 Suporte

Para suporte ou dúvidas:
- Verifique os logs do servidor no console
- Verifique o console do navegador (F12)
- Verifique se todas as dependências estão instaladas

## 🔄 Atualizações

Para atualizar o sistema:
1. Pare o servidor (Ctrl+C)
2. Faça backup da pasta `data/`
3. Substitua os arquivos
4. Execute `npm install` (se houver novas dependências)
5. Inicie o servidor novamente

---

**RTX Operações** - Sistema de Cadastro Web v1.0
