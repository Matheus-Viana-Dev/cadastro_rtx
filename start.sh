#!/bin/bash

echo "🚀 Iniciando RTX Operações - Sistema de Cadastro Web"
echo "=================================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    echo "   Acesse: https://nodejs.org/"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências"
        exit 1
    fi
    echo "✅ Dependências instaladas com sucesso"
else
    echo "✅ Dependências já instaladas"
fi

# Criar pasta de dados se não existir
if [ ! -d "data" ]; then
    echo "📁 Criando pasta de dados..."
    mkdir -p data
    echo "✅ Pasta de dados criada"
fi

# Verificar se o arquivo de dados existe
if [ ! -f "data/cadastros.json" ]; then
    echo "📄 Criando arquivo de dados inicial..."
    echo "[]" > data/cadastros.json
    echo "✅ Arquivo de dados criado"
fi

echo ""
echo "🎯 Configuração:"
echo "   - Porta: 8081 (ou PORT definida no ambiente)"
echo "   - Acesso: http://localhost:8081"
echo "   - Admin: admin / rtx2024"
echo ""

# Iniciar o servidor
echo "🚀 Iniciando servidor..."
echo "   Pressione Ctrl+C para parar o servidor"
echo ""

node server.js
