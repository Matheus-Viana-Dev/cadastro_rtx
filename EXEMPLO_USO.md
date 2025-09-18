# 📋 Exemplo de Uso - RTX Operações

## 🚀 Como Iniciar o Sistema

### Opção 1: Script Automático (Recomendado)
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

### Opção 2: Manual
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm start
```

## 🌐 Acessando o Sistema

1. **Abra seu navegador** e acesse: `http://localhost:8081`
2. **Para acessar de outros dispositivos** na mesma rede: `http://SEU_IP:8081`

## 👤 Cadastro de Usuários

### Como Cadastrar
1. Preencha o formulário com:
   - Nome completo
   - E-mail válido
   - CPF (com validação)
   - Senha forte (8+ caracteres com símbolos)
   - Tipo: Cliente ou GN

2. Clique em "Cadastrar"
3. Aguarde a confirmação

### Validações
- ✅ E-mail único (não pode repetir)
- ✅ CPF único e válido
- ✅ Senha forte obrigatória
- ✅ Todos os campos obrigatórios

## 🔐 Área Administrativa

### Como Acessar
1. Clique no botão de engrenagem (⚙️) no canto inferior direito
2. Digite as credenciais:
   - **Usuário**: `admin`
   - **Senha**: `rtx2024`

### Funcionalidades Administrativas
- 📊 **Dashboard** com estatísticas em tempo real
- 📈 **Gráficos** de cadastros por dia e horário
- 📋 **Lista completa** de todos os cadastros
- 🔍 **Busca e filtros** por nome, email, CPF
- 📤 **Exportação** em Excel e CSV

## 📊 Exportação de Dados

### Excel (.xlsx)
1. Acesse a área administrativa
2. Clique em "Baixar Planilha Excel"
3. O arquivo será baixado automaticamente

### CSV
1. Acesse a área administrativa
2. Clique em "Exportar CSV"
3. O arquivo será baixado automaticamente

## 🔧 Configurações Avançadas

### Alterar Porta
```bash
PORT=8080 npm start
```

### Alterar Credenciais Admin
Edite o arquivo `server.js` na linha 75-78:
```javascript
const ADMIN_CREDENTIALS = {
    username: 'seu_usuario',
    password: 'sua_senha_forte'
};
```

## 📱 Acesso Mobile

O sistema é totalmente responsivo:
- ✅ Funciona em smartphones
- ✅ Interface adaptada para touch
- ✅ Modo escuro otimizado
- ✅ Formulários mobile-friendly

## 🌐 Deploy em Servidor

### 1. Upload dos Arquivos
Faça upload de todos os arquivos para seu servidor

### 2. Instalar Node.js
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Iniciar Servidor
```bash
npm start
```

### 5. Configurar Proxy (Opcional)
Se usar nginx, adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 Monitoramento

### Verificar Status
Acesse: `http://localhost:8081/api/status`

### Logs do Servidor
Os logs aparecem no terminal onde o servidor está rodando

### Arquivo de Dados
Os dados são salvos em: `data/cadastros.json`

## 🚨 Solução de Problemas

### Erro "Porta em uso"
```bash
# Encontrar processo
lsof -ti:8081

# Parar processo
kill -9 PID_DO_PROCESSO
```

### Erro "Módulo não encontrado"
```bash
npm install
```

### Dados não aparecem
1. Verifique se o servidor está rodando
2. Verifique se a pasta `data/` existe
3. Verifique permissões de escrita

### Erro de conexão no frontend
1. Verifique se o servidor está rodando
2. Verifique se a porta está correta
3. Verifique firewall/antivírus

## 📞 Suporte

Para problemas:
1. Verifique os logs do servidor
2. Verifique o console do navegador (F12)
3. Verifique se todas as dependências estão instaladas
4. Verifique se a pasta `data/` tem permissões de escrita

---

**Sistema RTX Operações** - Pronto para uso! 🚀
