// Elementos do DOM
const cadastroScreen = document.getElementById('cadastro-screen');
const agradecimentoScreen = document.getElementById('agradecimento-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const cadastroForm = document.getElementById('cadastro-form');
const voltarBtn = document.getElementById('voltar-btn');
const dashboardBtn = document.getElementById('dashboard-btn');
const voltarDashboardBtn = document.getElementById('voltar-dashboard-btn');
const refreshBtn = document.getElementById('refresh-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const limparDadosBtn = document.getElementById('limpar-dados-btn');

// Variáveis para gráficos
let cadastrosChart = null;
let horariosChart = null;

// Dados do formulário
let formData = {};

// Configuração do Google Sheets
const GOOGLE_SHEETS_CONFIG = {
    // URL da sua planilha específica
    sheetsId: '1yU1DiEvfHwjX4xVitAX7Auw5be5E12KKqxWmfsk10YU',
    // URL do Google Apps Script (será configurada após criar o script)
    scriptUrl: 'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec',
    // URL pública da planilha
    sheetsUrl: 'https://docs.google.com/spreadsheets/d/1yU1DiEvfHwjX4xVitAX7Auw5be5E12KKqxWmfsk10YU/edit'
};

// URL do webhook - ALTERE ESTA URL PARA SEU WEBHOOK
const WEBHOOK_URL = 'https://seu-webhook-aqui.com/endpoint';

// Forçar modo escuro em todos os dispositivos
function forcarModoEscuro() {
    // Configurar color-scheme para dark
    document.documentElement.style.colorScheme = 'dark';
    
    // Para iOS - configurar status bar
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        // Adicionar meta tag para status bar escura
        const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (statusBarMeta) {
            statusBarMeta.content = 'black-translucent';
        }
        
        // Configurar viewport para iOS
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        }
    }
    
    // Para Android - configurar status bar
    if (navigator.userAgent.includes('Android')) {
        // Configurar tema para Android
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Forçar background escuro no body
    document.body.style.backgroundColor = '#0B0E11';
    document.body.style.color = '#ffffff';
    
    // Configurar scrollbar para modo escuro
    document.documentElement.style.scrollbarWidth = 'thin';
    document.documentElement.style.scrollbarColor = '#333 #0B0E11';
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    forcarModoEscuro();
});

// Função para aplicar máscara de CPF
function aplicarMascaraCPF(input) {
    let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (value.length <= 11) {
        // Aplica a máscara: 000.000.000-00
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    input.value = value;
}

// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let dv1 = resto < 2 ? 0 : resto;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let dv2 = resto < 2 ? 0 : resto;
    
    return dv1 === parseInt(cpf.charAt(9)) && dv2 === parseInt(cpf.charAt(10));
}

// Função para validar senha forte
function validarSenhaForte(senha) {
    const requisitos = {
        comprimento: senha.length >= 8,
        caracteresEspeciais: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)
    };
    
    return requisitos;
}

// Função para alternar entre telas
function showScreen(screenId) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar a tela selecionada
    document.getElementById(screenId).classList.add('active');
}

// Função para validar formulário
function validateForm(formData) {
    const errors = [];
    
    if (!formData.nome || formData.nome.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push('E-mail inválido');
    }
    
    if (!formData.cpf || !validarCPF(formData.cpf)) {
        errors.push('CPF inválido');
    }
    
    if (!formData.senha || formData.senha.trim().length < 8) {
        errors.push('Senha deve ter pelo menos 8 caracteres');
    } else {
        const requisitosSenha = validarSenhaForte(formData.senha);
        const requisitosFaltando = [];
        
        if (!requisitosSenha.comprimento) requisitosFaltando.push('pelo menos 8 caracteres');
        if (!requisitosSenha.caracteresEspeciais) requisitosFaltando.push('caracteres especiais (!@#$%^&*)');
        
        if (requisitosFaltando.length > 0) {
            errors.push(`Senha deve conter: ${requisitosFaltando.join(' e ')}`);
        }
    }
    
    if (!formData.tipoUsuario) {
        errors.push('Selecione um tipo de usuário');
    }
    
    return errors;
}

// Função para validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para formatar telefone
function formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
}

// Função para mostrar notificação
function showNotification(message, type = 'success') {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Adicionar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(45deg, #00d4ff, #0099cc)';
    } else {
        notification.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
    }
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Adicionar estilos para animações de notificação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Função para atualizar indicador de requisitos da senha
function atualizarIndicadorSenha(senha) {
    const indicator = document.getElementById('senha-indicator');
    if (!indicator) return;
    
    const requisitos = indicator.querySelectorAll('.requisito');
    
    if (senha.length === 0) {
        indicator.classList.remove('active');
        return;
    }
    
    indicator.classList.add('active');
    
    const requisitosSenha = validarSenhaForte(senha);
    
    // Atualizar requisitos individuais
    requisitos.forEach(requisito => {
        const tipoRequisito = requisito.dataset.requisito;
        const icon = requisito.querySelector('i');
        
        if (requisitosSenha[tipoRequisito]) {
            requisito.classList.add('satisfeito');
            icon.className = 'fas fa-check';
        } else {
            requisito.classList.remove('satisfeito');
            icon.className = 'fas fa-times';
        }
    });
}

// Event listener para o campo de CPF
document.getElementById('cpf').addEventListener('input', function(e) {
    aplicarMascaraCPF(e.target);
});

// Event listener para o campo de senha
document.getElementById('senha').addEventListener('input', function(e) {
    atualizarIndicadorSenha(e.target.value);
});

// Event listeners para seletor de tipo de usuário
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remover classe active de todos os botões
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        
        // Adicionar classe active ao botão clicado
        this.classList.add('active');
        
        // Atualizar valor do input hidden
        const tipo = this.dataset.type;
        document.getElementById('user-type').value = tipo;
    });
});

// Função para enviar dados para o webhook
async function enviarParaWebhook(dados) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        if (response.ok) {
            return { success: true, message: 'Dados enviados para webhook!' };
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Erro no servidor' }));
            return { success: false, message: errorData.message || 'Erro ao enviar dados para webhook' };
        }
    } catch (error) {
        console.error('Erro ao enviar para webhook:', error);
        return { success: false, message: 'Erro de conexão com webhook. Verifique sua internet.' };
    }
}

// Função para enviar dados para o Google Sheets
async function enviarParaGoogleSheets(dados) {
    try {
        // Converter dados para formato de linha da planilha
        const linhaPlanilha = [
            dados.nome,
            dados.email,
            dados.cpf,
            dados.senha,
            dados.tipoUsuario === 'cliente' ? 'Cliente' : 'GN',
            dados.dataCadastro
        ];
        
        // Enviar para Google Apps Script
        const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'adicionarCadastro',
                dados: linhaPlanilha
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                return { success: true, message: 'Dados salvos no Google Sheets!' };
            } else {
                return { success: false, message: result.message || 'Erro ao salvar dados' };
            }
        } else {
            return { success: false, message: 'Erro no servidor do Google Sheets' };
        }
    } catch (error) {
        console.error('Erro ao enviar para Google Sheets:', error);
        return { success: false, message: 'Erro de conexão. Verifique sua internet.' };
    }
}

// Event listener para o formulário de cadastro
cadastroForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Coletar dados do formulário
    formData = {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        senha: document.getElementById('senha').value.trim(),
        tipoUsuario: document.getElementById('user-type').value,
        dataCadastro: new Date().toLocaleString('pt-BR')
    };
    
    // Validar formulário
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return;
    }
    
    // Enviar para o webhook
    const submitBtn = cadastroForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Enviar para ambos (Google Sheets e webhook)
    const [sheetsResult, webhookResult] = await Promise.allSettled([
        enviarParaGoogleSheets(formData),
        enviarParaWebhook(formData)
    ]);
    
    // Verificar resultados
    const sheetsSuccess = sheetsResult.status === 'fulfilled' && sheetsResult.value.success;
    const webhookSuccess = webhookResult.status === 'fulfilled' && webhookResult.value.success;
    
    let result;
    if (sheetsSuccess && webhookSuccess) {
        result = { success: true, message: 'Dados salvos no Google Sheets e enviados para webhook!' };
    } else if (sheetsSuccess) {
        result = { success: true, message: 'Dados salvos no Google Sheets! (Webhook falhou)' };
    } else if (webhookSuccess) {
        result = { success: true, message: 'Dados enviados para webhook! (Google Sheets falhou)' };
    } else {
        result = { success: false, message: 'Erro ao salvar dados em ambos os locais.' };
    }
    
    if (result.success) {
        // Mostrar tela de agradecimento
        showScreen('agradecimento-screen');
        showNotification('Cadastro realizado com sucesso!');
        
        // Limpar formulário
        cadastroForm.reset();
        formData = {};
    } else {
        showNotification(result.message, 'error');
    }
    
    // Resetar botão
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
});

// Event listener para o botão voltar
voltarBtn.addEventListener('click', function() {
    showScreen('cadastro-screen');
    
    // Limpar formulário
    cadastroForm.reset();
    formData = {};
});

// Event listener para formatação do telefone
document.getElementById('telefone').addEventListener('input', function(e) {
    const formatted = formatPhoneNumber(e.target.value);
    e.target.value = formatted;
});

// Event listener para animação de foco nos inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Função para carregar dados do Google Sheets
async function carregarDadosDashboard() {
    try {
        const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptUrl + '?action=obterDados');
        const result = await response.json();
        
        if (result.success) {
            return result.dados;
        } else {
            console.error('Erro ao carregar dados:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        return [];
    }
}

// Função para atualizar estatísticas do dashboard
async function atualizarEstatisticas() {
    const dados = await carregarDadosDashboard();
    
    const totalCadastros = dados.length;
    const totalClientes = dados.filter(d => d[4] === 'Cliente').length;
    const totalGN = dados.filter(d => d[4] === 'GN').length;
    const cadastrosCompletos = dados.filter(d => d[0] && d[1] && d[2] && d[3]).length;
    const cadastrosIncompletos = totalCadastros - cadastrosCompletos;
    
    // Simular acessos (para demonstração - você pode implementar rastreamento real)
    const totalAcessos = Math.max(totalCadastros * 3, 50); // Estimativa
    const taxaConversao = totalAcessos > 0 ? ((totalCadastros / totalAcessos) * 100).toFixed(1) : 0;
    
    document.getElementById('total-acessos').textContent = totalAcessos;
    document.getElementById('total-cadastros').textContent = totalCadastros;
    document.getElementById('cadastros-completos').textContent = cadastrosCompletos;
    document.getElementById('cadastros-incompletos').textContent = cadastrosIncompletos;
    document.getElementById('taxa-conversao').textContent = taxaConversao + '%';
}

// Função para atualizar tabela de cadastros
async function atualizarTabela() {
    const tbody = document.getElementById('cadastros-tbody');
    
    // Mostrar loading
    tbody.innerHTML = '<tr><td colspan="5" class="loading"><i class="fas fa-spinner"></i> Carregando dados...</td></tr>';
    
    const dados = await carregarDadosDashboard();
    
    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #aaa;">Nenhum cadastro encontrado</td></tr>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    const dadosOrdenados = dados.sort((a, b) => new Date(b[5]) - new Date(a[5]));
    
    // Mostrar apenas os últimos 10 cadastros
    const ultimosCadastros = dadosOrdenados.slice(0, 10);
    
    tbody.innerHTML = ultimosCadastros.map(cadastro => `
        <tr>
            <td>${cadastro[0]}</td>
            <td>${cadastro[1]}</td>
            <td>${cadastro[2]}</td>
            <td>${cadastro[4]}</td>
            <td>${cadastro[5]}</td>
        </tr>
    `).join('');
}

// Função para atualizar gráficos
async function atualizarGraficos() {
    const dados = await carregarDadosDashboard();
    
    // Atualizar gráfico de cadastros por dia
    atualizarGraficoCadastros(dados);
    
    // Atualizar gráfico de horários
    atualizarGraficoHorarios(dados);
}

// Função para atualizar gráfico de cadastros por dia
function atualizarGraficoCadastros(dados) {
    const ctx = document.getElementById('cadastros-chart');
    if (!ctx) return;
    
    const cadastrosPorDia = getCadastrosPorDia(dados);
    const labels = Object.keys(cadastrosPorDia);
    const values = Object.values(cadastrosPorDia);
    
    if (cadastrosChart) {
        cadastrosChart.destroy();
    }
    
    cadastrosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cadastros',
                data: values,
                backgroundColor: 'rgba(0, 212, 255, 0.8)',
                borderColor: '#00d4ff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Função para atualizar gráfico de horários
function atualizarGraficoHorarios(dados) {
    const ctx = document.getElementById('horarios-chart');
    if (!ctx) return;
    
    const distribuicaoHorarios = getDistribuicaoHorarios(dados);
    const labels = Object.keys(distribuicaoHorarios);
    const values = Object.values(distribuicaoHorarios);
    
    if (horariosChart) {
        horariosChart.destroy();
    }
    
    horariosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#00d4ff',
                    '#0099cc',
                    '#006699',
                    '#003d5c',
                    '#001a2e'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Função para obter cadastros por dia
function getCadastrosPorDia(dados) {
    const cadastrosPorDia = {};
    
    dados.forEach(cadastro => {
        const data = new Date(cadastro[5]);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        if (cadastrosPorDia[dataFormatada]) {
            cadastrosPorDia[dataFormatada]++;
        } else {
            cadastrosPorDia[dataFormatada] = 1;
        }
    });
    
    return cadastrosPorDia;
}

// Função para obter distribuição por horário
function getDistribuicaoHorarios(dados) {
    const distribuicao = {
        'Manhã (06-12h)': 0,
        'Tarde (12-18h)': 0,
        'Noite (18-24h)': 0,
        'Madrugada (00-06h)': 0
    };
    
    dados.forEach(cadastro => {
        const data = new Date(cadastro[5]);
        const hora = data.getHours();
        
        if (hora >= 6 && hora < 12) {
            distribuicao['Manhã (06-12h)']++;
        } else if (hora >= 12 && hora < 18) {
            distribuicao['Tarde (12-18h)']++;
        } else if (hora >= 18 && hora < 24) {
            distribuicao['Noite (18-24h)']++;
        } else {
            distribuicao['Madrugada (00-06h)']++;
        }
    });
    
    return distribuicao;
}

// Função para exportar para Excel
async function exportarParaExcel() {
    try {
        const dados = await carregarDadosDashboard();
        
        if (dados.length === 0) {
            showNotification('Nenhum dado para exportar!', 'error');
            return;
        }
        
        // Preparar dados para Excel
        const dadosExcel = [
            ['Nome', 'Email', 'CPF', 'Senha', 'Tipo', 'Data Cadastro'],
            ...dados
        ];
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(dadosExcel);
        XLSX.utils.book_append_sheet(wb, ws, 'Cadastros');
        
        // Salvar arquivo
        XLSX.writeFile(wb, `cadastros_rtx_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        showNotification('Arquivo Excel exportado com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        showNotification('Erro ao exportar Excel!', 'error');
    }
}

// Função para exportar para CSV
async function exportarParaCSV() {
    try {
        const dados = await carregarDadosDashboard();
        
        if (dados.length === 0) {
            showNotification('Nenhum dado para exportar!', 'error');
            return;
        }
        
        // Preparar dados para CSV
        const header = 'Nome,Email,CPF,Senha,Tipo,Data Cadastro\n';
        const csvData = dados.map(linha => linha.join(',')).join('\n');
        const csvContent = header + csvData;
        
        // Criar e baixar arquivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `cadastros_rtx_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Arquivo CSV exportado com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        showNotification('Erro ao exportar CSV!', 'error');
    }
}

// Função para limpar dados (apenas local - não afeta Google Sheets)
async function limparDados() {
    if (!confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        // Nota: Como estamos usando Google Sheets, não podemos limpar os dados remotamente
        // Esta função serve apenas para limpar dados locais se houver
        showNotification('Dados limpos localmente! (Google Sheets não afetado)', 'info');
        
        // Atualizar dashboard
        await atualizarDashboard();
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        showNotification('Erro ao limpar dados!', 'error');
    }
}

// Função para atualizar dashboard completo
async function atualizarDashboard() {
    await Promise.all([
        atualizarEstatisticas(),
        atualizarTabela(),
        atualizarGraficos()
    ]);
}

// Event listeners para navegação do dashboard
if (dashboardBtn) {
    dashboardBtn.addEventListener('click', function() {
        showScreen('dashboard-screen');
        atualizarDashboard();
    });
}

if (voltarDashboardBtn) {
    voltarDashboardBtn.addEventListener('click', function() {
        showScreen('cadastro-screen');
    });
}

if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
        atualizarDashboard();
        showNotification('Dados atualizados!');
    });
}

if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', exportarParaExcel);
}

if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportarParaCSV);
}

if (limparDadosBtn) {
    limparDadosBtn.addEventListener('click', limparDados);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que a tela de cadastro esteja ativa inicialmente
    showScreen('cadastro-screen');
    
    // Adicionar efeito de partículas no fundo (opcional)
    createParticleEffect();
});

// Função para criar efeito de partículas no fundo
function createParticleEffect() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.1;
    `;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        };
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = '#00d4ff';
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    // Inicializar partículas
    for (let i = 0; i < 50; i++) {
        particles.push(createParticle());
    }
    
    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
}
