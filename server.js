const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Caminho para os arquivos de dados
const DATA_FILE = path.join(__dirname, 'data', 'cadastros.json');
const STATS_FILE = path.join(__dirname, 'data', 'estatisticas.json');

// Garantir que o diretório data existe
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Inicializar arquivo de dados se não existir
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Inicializar arquivo de estatísticas se não existir
if (!fs.existsSync(STATS_FILE)) {
    const initialStats = {
        totalAcessos: 0,
        cadastrosCompletos: 0,
        cadastrosIncompletos: 0,
        ultimoAcesso: null,
        primeiroAcesso: null
    };
    fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2));
}

// Função para ler dados
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler dados:', error);
        return [];
    }
}

// Função para salvar dados
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
}

// Função para ler estatísticas
function readStats() {
    try {
        const data = fs.readFileSync(STATS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler estatísticas:', error);
        return {
            totalAcessos: 0,
            cadastrosCompletos: 0,
            cadastrosIncompletos: 0,
            ultimoAcesso: null,
            primeiroAcesso: null
        };
    }
}

// Função para salvar estatísticas
function saveStats(stats) {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar estatísticas:', error);
        return false;
    }
}

// Função para registrar acesso
function registrarAcesso() {
    const stats = readStats();
    const agora = new Date().toISOString();
    
    stats.totalAcessos++;
    stats.ultimoAcesso = agora;
    
    if (!stats.primeiroAcesso) {
        stats.primeiroAcesso = agora;
    }
    
    saveStats(stats);
    return stats;
}

// Rota para cadastrar usuário
app.post('/api/cadastrar', (req, res) => {
    try {
        const { nome, email, cpf, senha, tipoUsuario } = req.body;
        
        // Validações básicas
        if (!nome || !email || !cpf || !senha || !tipoUsuario) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos os campos são obrigatórios' 
            });
        }
        
        // Verificar se email já existe
        const cadastros = readData();
        const emailExiste = cadastros.some(cadastro => cadastro.email === email);
        
        if (emailExiste) {
            return res.status(400).json({ 
                success: false, 
                message: 'E-mail já cadastrado' 
            });
        }
        
        // Verificar se CPF já existe
        const cpfExiste = cadastros.some(cadastro => cadastro.cpf === cpf);
        
        if (cpfExiste) {
            return res.status(400).json({ 
                success: false, 
                message: 'CPF já cadastrado' 
            });
        }
        
        // Criar novo cadastro
        const novoCadastro = {
            id: Date.now().toString(),
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            cpf: cpf.trim(),
            senha: senha.trim(),
            tipoUsuario: tipoUsuario,
            dataCadastro: new Date().toLocaleString('pt-BR'),
            timestamp: Date.now()
        };
        
        // Adicionar ao array de cadastros
        cadastros.push(novoCadastro);
        
        // Atualizar estatísticas
        const stats = readStats();
        stats.cadastrosCompletos++;
        saveStats(stats);
        
        // Salvar dados
        if (saveData(cadastros)) {
            res.json({ 
                success: true, 
                message: 'Cadastro realizado com sucesso!',
                data: {
                    id: novoCadastro.id,
                    nome: novoCadastro.nome,
                    email: novoCadastro.email,
                    tipoUsuario: novoCadastro.tipoUsuario,
                    dataCadastro: novoCadastro.dataCadastro
                }
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Erro ao salvar cadastro' 
            });
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para listar todos os cadastros (área administrativa)
app.get('/api/cadastros', (req, res) => {
    try {
        const cadastros = readData();
        
        // Remover senhas dos dados retornados por segurança
        const cadastrosSemSenha = cadastros.map(cadastro => {
            const { senha, ...cadastroSemSenha } = cadastro;
            return cadastroSemSenha;
        });
        
        res.json({ 
            success: true, 
            data: cadastrosSemSenha,
            total: cadastros.length
        });
        
    } catch (error) {
        console.error('Erro ao listar cadastros:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para obter estatísticas
app.get('/api/estatisticas', (req, res) => {
    try {
        const cadastros = readData();
        const stats = readStats();
        const hoje = new Date().toDateString();
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        const ontemString = ontem.toDateString();
        
        const cadastrosHoje = cadastros.filter(cadastro => {
            const dataCadastro = new Date(cadastro.dataCadastro.split(',')[0]);
            return dataCadastro.toDateString() === hoje;
        }).length;
        
        const cadastrosOntem = cadastros.filter(cadastro => {
            const dataCadastro = new Date(cadastro.dataCadastro.split(',')[0]);
            return dataCadastro.toDateString() === ontemString;
        }).length;
        
        // Calcular crescimento
        let crescimento = 0;
        if (cadastrosOntem > 0) {
            crescimento = Math.round(((cadastrosHoje - cadastrosOntem) / cadastrosOntem) * 100);
        } else if (cadastrosHoje > 0) {
            crescimento = 100;
        }
        
        // Último cadastro
        let ultimoCadastro = '--:--';
        if (cadastros.length > 0) {
            const ultimo = cadastros[cadastros.length - 1];
            const dataUltimo = new Date(ultimo.dataCadastro);
            ultimoCadastro = dataUltimo.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        // Calcular taxa de conversão
        const taxaConversao = stats.totalAcessos > 0 ? 
            Math.round((stats.cadastrosCompletos / stats.totalAcessos) * 100) : 0;
        
        res.json({
            success: true,
            data: {
                total: cadastros.length,
                hoje: cadastrosHoje,
                crescimento: crescimento,
                ultimoCadastro: ultimoCadastro,
                totalAcessos: stats.totalAcessos,
                cadastrosCompletos: stats.cadastrosCompletos,
                cadastrosIncompletos: stats.cadastrosIncompletos,
                taxaConversao: taxaConversao,
                primeiroAcesso: stats.primeiroAcesso,
                ultimoAcesso: stats.ultimoAcesso
            }
        });
        
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para exportar dados em Excel (retorna JSON para o frontend processar)
app.get('/api/exportar/excel', (req, res) => {
    try {
        const cadastros = readData();
        
        if (cadastros.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nenhum dado para exportar' 
            });
        }
        
        res.json({
            success: true,
            data: cadastros,
            filename: `cadastros_rtx_${new Date().toISOString().slice(0, 10)}.xlsx`
        });
        
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para exportar dados em CSV
app.get('/api/exportar/csv', (req, res) => {
    try {
        const cadastros = readData();
        
        if (cadastros.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nenhum dado para exportar' 
            });
        }
        
        // Criar CSV
        const headers = ['Nome', 'E-mail', 'CPF', 'Tipo de Usuário', 'Data do Cadastro'];
        const csvContent = [
            headers.join(','),
            ...cadastros.map(cadastro => [
                `"${cadastro.nome}"`,
                `"${cadastro.email}"`,
                `"${cadastro.cpf}"`,
                `"${cadastro.tipoUsuario === 'cliente' ? 'Cliente' : 'GN'}"`,
                `"${cadastro.dataCadastro}"`
            ].join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="cadastros_rtx_${new Date().toISOString().slice(0, 10)}.csv"`);
        res.send(csvContent);
        
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para registrar acesso ao site
app.post('/api/acesso', (req, res) => {
    try {
        const stats = registrarAcesso();
        res.json({ 
            success: true, 
            message: 'Acesso registrado',
            data: stats
        });
    } catch (error) {
        console.error('Erro ao registrar acesso:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para limpar todos os dados
app.delete('/api/limpar-dados', (req, res) => {
    try {
        // Limpar cadastros
        const cadastrosVazios = [];
        saveData(cadastrosVazios);
        
        // Resetar estatísticas
        const statsReset = {
            totalAcessos: 0,
            cadastrosCompletos: 0,
            cadastrosIncompletos: 0,
            ultimoAcesso: null,
            primeiroAcesso: null
        };
        saveStats(statsReset);
        
        res.json({ 
            success: true, 
            message: 'Todos os dados foram limpos com sucesso!'
        });
        
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rota para verificar se o servidor está funcionando
app.get('/api/status', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota principal - servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor RTX Operações rodando na porta ${PORT}`);
    console.log(`📊 Acesse: http://localhost:${PORT}`);
    console.log(`📁 Dados salvos em: ${DATA_FILE}`);
});
