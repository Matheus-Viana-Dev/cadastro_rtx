@echo off
echo 🚀 Iniciando RTX Operações - Sistema de Cadastro Web
echo ==================================================

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    echo    Acesse: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado. Por favor, instale o npm primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js e npm encontrados

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas com sucesso
) else (
    echo ✅ Dependências já instaladas
)

REM Criar pasta de dados se não existir
if not exist "data" (
    echo 📁 Criando pasta de dados...
    mkdir data
    echo ✅ Pasta de dados criada
)

REM Verificar se o arquivo de dados existe
if not exist "data\cadastros.json" (
    echo 📄 Criando arquivo de dados inicial...
    echo [] > data\cadastros.json
    echo ✅ Arquivo de dados criado
)

echo.
echo 🎯 Configuração:
echo    - Porta: 8081 (ou PORT definida no ambiente)
echo    - Acesso: http://localhost:8081
echo    - Admin: admin / rtx2024
echo.

REM Iniciar o servidor
echo 🚀 Iniciando servidor...
echo    Pressione Ctrl+C para parar o servidor
echo.

node server.js
