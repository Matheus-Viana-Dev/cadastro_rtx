// Elementos do DOM
const cadastroScreen = document.getElementById('cadastro-screen');
const agradecimentoScreen = document.getElementById('agradecimento-screen');
const adminLoginScreen = document.getElementById('admin-login-screen');
const adminDashboardScreen = document.getElementById('admin-dashboard-screen');
const cadastroForm = document.getElementById('cadastro-form');
const voltarBtn = document.getElementById('voltar-btn');
const downloadExcelBtn = document.getElementById('download-excel-btn');
const adminAccessBtn = document.getElementById('admin-access-btn');
const backToCadastroBtn = document.getElementById('back-to-cadastro-btn');
const adminLoginForm = document.getElementById('admin-login-form');
const logoutBtn = document.getElementById('logout-btn');
const viewCadastrosBtn = document.getElementById('view-cadastros-btn');
const cadastrosList = document.getElementById('cadastros-list');
const cadastrosContent = document.getElementById('cadastros-content');
const totalCadastrosSpan = document.getElementById('total-cadastros');
const cadastrosHojeSpan = document.getElementById('cadastros-hoje');
const crescimentoSpan = document.getElementById('crescimento');
const ultimoCadastroSpan = document.getElementById('ultimo-cadastro');
const totalAcessosSpan = document.getElementById('total-acessos');
const taxaConversaoSpan = document.getElementById('taxa-conversao');
const cadastrosCompletosSpan = document.getElementById('cadastros-completos');
const cadastrosIncompletosSpan = document.getElementById('cadastros-incompletos');
const refreshDataBtn = document.getElementById('refresh-data-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const limparDadosBtn = document.getElementById('limpar-dados-btn');
const searchCadastros = document.getElementById('search-cadastros');
const filterCadastros = document.getElementById('filter-cadastros');
const chartPeriod = document.getElementById('chart-period');

// Variáveis para gráficos
let cadastrosChart = null;
let horariosChart = null;

// Dados do formulário
let formData = {};
let cadastros = []; // Array para armazenar todos os cadastros

// URL base da API
const API_BASE_URL = window.location.origin + '/api';

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

// Credenciais administrativas (em produção, isso deveria estar em um servidor)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'rtx2024'
};

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

// Lista de senhas comuns que devem ser rejeitadas
const senhasComuns = [
    '123456', '123456789', '12345678', '12345', '1234567', '1234567890',
    'password', '123123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'abc123', '111111', 'dragon', 'master', 'hello',
    'freedom', 'whatever', 'qazwsx', 'trustno1', '654321', 'jordan23',
    'harley', 'password1', '1234', 'robert', 'matthew', 'jordan',
    'asshole', 'daniel', 'andrew', 'charlie', 'superman', '123456789',
    'password123', 'senha', '123456', '12345', '1234', '123',
    'senha123', 'admin123', 'user123', 'teste123', 'brasil123',
    'amor123', 'feliz123', 'casa123', 'trabalho123', 'familia123'
];


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

// Event listener para o formulário de cadastro
cadastroForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Coletar dados do formulário
    formData = {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        senha: document.getElementById('senha').value.trim(),
        tipoUsuario: document.getElementById('user-type').value
    };
    
    // Validar formulário
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return;
    }
    
    // Enviar para o servidor
    const submitBtn = cadastroForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/cadastrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Mostrar tela de agradecimento
            showScreen('agradecimento-screen');
            showNotification('Cadastro realizado com sucesso!');
            
            // Limpar formulário
            cadastroForm.reset();
            formData = {};
        } else {
            showNotification(result.message || 'Erro ao cadastrar', 'error');
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
    } finally {
        // Resetar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Event listener para o botão voltar
voltarBtn.addEventListener('click', function() {
    showScreen('cadastro-screen');
    
    // Limpar formulário
    cadastroForm.reset();
    formData = {};
});

// Event listener para o botão de download Excel
downloadExcelBtn.addEventListener('click', function() {
    saveToExcel();
});

// Event listener para acesso à área administrativa
adminAccessBtn.addEventListener('click', function() {
    showScreen('admin-login-screen');
});

// Event listener para voltar ao cadastro da área admin
backToCadastroBtn.addEventListener('click', function() {
    showScreen('cadastro-screen');
});

// Event listener para login administrativo
adminLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();
    
    if (checkAdminLogin(username, password)) {
        showScreen('admin-dashboard-screen');
        updateDashboardStats();
        showNotification('Login realizado com sucesso!');
    } else {
        showNotification('Usuário ou senha incorretos!', 'error');
    }
});

// Event listener para logout
logoutBtn.addEventListener('click', function() {
    showScreen('cadastro-screen');
    showNotification('Logout realizado com sucesso!');
});

// Event listener para visualizar cadastros
viewCadastrosBtn.addEventListener('click', function() {
    const cadastrosSection = document.getElementById('cadastros-section');
    if (cadastrosSection.style.display === 'none') {
        displayCadastros();
        cadastrosSection.style.display = 'block';
        viewCadastrosBtn.innerHTML = '<i class="fas fa-eye-slash"></i><span>Ocultar Cadastros</span><small>Esconder lista</small>';
    } else {
        cadastrosSection.style.display = 'none';
        viewCadastrosBtn.innerHTML = '<i class="fas fa-list"></i><span>Ver Lista de Cadastros</span><small>Visualizar detalhes</small>';
    }
});

// Event listener para atualizar dados
refreshDataBtn.addEventListener('click', function() {
    updateDashboardStats();
    showNotification('Dados atualizados com sucesso!');
});

// Event listener para exportar CSV
exportCsvBtn.addEventListener('click', function() {
    exportToCSV();
});

// Event listener para limpar dados
limparDadosBtn.addEventListener('click', function() {
    if (confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados permanentemente!\n\nIsso inclui:\n- Todos os cadastros\n- Todas as estatísticas\n- Todos os acessos registrados\n\nTem certeza que deseja continuar?')) {
        if (confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Você tem certeza absoluta?\n\nEsta ação NÃO PODE ser desfeita!')) {
            limparTodosDados();
        }
    }
});

// Event listener para mudança de período do gráfico
chartPeriod.addEventListener('change', function() {
    updateCadastrosChart();
});

// Event listener para busca de cadastros
searchCadastros.addEventListener('input', function() {
    filterCadastrosList();
});

// Event listener para filtro de cadastros
filterCadastros.addEventListener('change', function() {
    filterCadastrosList();
});

// Função para filtrar lista de cadastros
function filterCadastrosList() {
    const searchTerm = searchCadastros.value.toLowerCase();
    const filterValue = filterCadastros.value;
    
    let filteredCadastros = [...cadastros];
    
    // Aplicar filtro de período
    if (filterValue !== 'all') {
        const hoje = new Date();
        filteredCadastros = filteredCadastros.filter(cadastro => {
            const dataCadastro = new Date(cadastro.dataCadastro.split(',')[0]);
            
            switch (filterValue) {
                case 'today':
                    return dataCadastro.toDateString() === hoje.toDateString();
                case 'week':
                    const semanaAtras = new Date(hoje);
                    semanaAtras.setDate(hoje.getDate() - 7);
                    return dataCadastro >= semanaAtras;
                case 'month':
                    const mesAtras = new Date(hoje);
                    mesAtras.setMonth(hoje.getMonth() - 1);
                    return dataCadastro >= mesAtras;
                default:
                    return true;
            }
        });
    }
    
    // Aplicar busca por texto
    if (searchTerm) {
        filteredCadastros = filteredCadastros.filter(cadastro => 
            cadastro.nome.toLowerCase().includes(searchTerm) ||
            cadastro.email.toLowerCase().includes(searchTerm) ||
            cadastro.cpf.includes(searchTerm)
        );
    }
    
    // Exibir resultados filtrados
    if (filteredCadastros.length === 0) {
        cadastrosContent.innerHTML = '<p style="color: #aaa; text-align: center;">Nenhum cadastro encontrado com os filtros aplicados.</p>';
        return;
    }
    
    const cadastrosHTML = filteredCadastros.map((cadastro, index) => `
        <div class="cadastro-item">
            <h4>${cadastro.nome}</h4>
            <p><strong>E-mail:</strong> ${cadastro.email}</p>
            <p><strong>CPF:</strong> ${cadastro.cpf}</p>
            <p><strong>Tipo:</strong> ${cadastro.tipoUsuario === 'cliente' ? 'Cliente' : 'GN'}</p>
            <p><strong>Data:</strong> ${cadastro.dataCadastro}</p>
        </div>
    `).join('');
    
    cadastrosContent.innerHTML = cadastrosHTML;
}

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

// Função para registrar acesso ao site
async function registrarAcesso() {
    try {
        await fetch(`${API_BASE_URL}/acesso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        console.error('Erro ao registrar acesso:', error);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    // Registrar acesso ao site
    await registrarAcesso();
    
    // Carregar cadastros existentes do servidor
    await loadCadastros();
    
    // Garantir que a tela de cadastro esteja ativa inicialmente
    showScreen('cadastro-screen');
    
    // Adicionar efeito de partículas no fundo (opcional)
    createParticleEffect();
});

// Função para salvar dados em Excel
async function saveToExcel() {
    try {
        // Buscar dados do servidor
        const response = await fetch(`${API_BASE_URL}/exportar/excel`);
        const result = await response.json();
        
        if (!result.success) {
            showNotification(result.message || 'Erro ao exportar dados', 'error');
            return;
        }
        
        const cadastrosData = result.data;
        
        // Verificar se há dados para salvar
        if (cadastrosData.length === 0) {
            showNotification('Nenhum dado para salvar', 'error');
            return;
        }
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        
        // Preparar dados para a planilha
        const wsData = [
            ['Nome', 'E-mail', 'CPF', 'Tipo de Usuário', 'Data do Cadastro'], // Cabeçalhos (removido senha por segurança)
            ...cadastrosData.map(cadastro => [
                cadastro.nome,
                cadastro.email,
                cadastro.cpf,
                cadastro.tipoUsuario === 'cliente' ? 'Cliente' : 'GN',
                cadastro.dataCadastro
            ])
        ];
        
        // Criar worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Definir largura das colunas
        ws['!cols'] = [
            { wch: 25 }, // Nome
            { wch: 30 }, // E-mail
            { wch: 20 }, // CPF
            { wch: 15 }, // Tipo
            { wch: 20 }  // Data
        ];
        
        // Adicionar worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Cadastros');
        
        // Gerar nome do arquivo com data e hora
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `cadastros_rtx_${timestamp}.xlsx`;
        
        // Baixar arquivo
        XLSX.writeFile(wb, filename);
        
        showNotification('Planilha salva com sucesso!');
        
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        showNotification('Erro de conexão ao exportar dados', 'error');
    }
}

// Função para carregar cadastros do servidor
async function loadCadastros() {
    try {
        const response = await fetch(`${API_BASE_URL}/cadastros`);
        const result = await response.json();
        
        if (result.success) {
            cadastros = result.data;
            console.log('Cadastros carregados do servidor:', cadastros.length);
        } else {
            console.error('Erro ao carregar cadastros:', result.message);
            cadastros = [];
        }
    } catch (error) {
        console.error('Erro de conexão ao carregar cadastros:', error);
        cadastros = [];
    }
}

// Função para carregar estatísticas do servidor
async function loadEstatisticas() {
    try {
        const response = await fetch(`${API_BASE_URL}/estatisticas`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Erro ao carregar estatísticas:', result.message);
            return {
                total: 0,
                hoje: 0,
                crescimento: 0,
                ultimoCadastro: '--:--'
            };
        }
    } catch (error) {
        console.error('Erro de conexão ao carregar estatísticas:', error);
        return {
            total: 0,
            hoje: 0,
            crescimento: 0,
            ultimoCadastro: '--:--'
        };
    }
}

// Função para verificar login administrativo
function checkAdminLogin(username, password) {
    return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

// Função para atualizar estatísticas do dashboard
async function updateDashboardStats() {
    try {
        // Carregar dados do servidor
        await loadCadastros();
        const stats = await loadEstatisticas();
        
        // Atualizar elementos da interface
        totalCadastrosSpan.textContent = stats.total;
        cadastrosHojeSpan.textContent = stats.hoje;
        crescimentoSpan.textContent = `${stats.crescimento > 0 ? '+' : ''}${stats.crescimento}%`;
        ultimoCadastroSpan.textContent = stats.ultimoCadastro;
        totalAcessosSpan.textContent = stats.totalAcessos || 0;
        taxaConversaoSpan.textContent = `${stats.taxaConversao || 0}%`;
        cadastrosCompletosSpan.textContent = stats.cadastrosCompletos || 0;
        cadastrosIncompletosSpan.textContent = stats.cadastrosIncompletos || 0;
        
        // Atualizar gráficos
        updateCharts();
        
    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
        showNotification('Erro ao carregar dados do servidor', 'error');
    }
}

// Função para exibir lista de cadastros
function displayCadastros() {
    if (cadastros.length === 0) {
        cadastrosContent.innerHTML = '<p style="color: #aaa; text-align: center;">Nenhum cadastro encontrado.</p>';
        return;
    }
    
    const cadastrosHTML = cadastros.map((cadastro, index) => `
        <div class="cadastro-item">
            <h4>${cadastro.nome}</h4>
            <p><strong>E-mail:</strong> ${cadastro.email}</p>
            <p><strong>CPF:</strong> ${cadastro.cpf}</p>
            <p><strong>Tipo:</strong> ${cadastro.tipoUsuario === 'cliente' ? 'Cliente' : 'GN'}</p>
            <p><strong>Data:</strong> ${cadastro.dataCadastro}</p>
        </div>
    `).join('');
    
    cadastrosContent.innerHTML = cadastrosHTML;
}

// Função para atualizar gráficos
function updateCharts() {
    updateCadastrosChart();
    updateHorariosChart();
}

// Função para criar/atualizar gráfico de cadastros por dia
function updateCadastrosChart() {
    const ctx = document.getElementById('cadastrosChart');
    if (!ctx) return;
    
    const period = parseInt(chartPeriod.value);
    const data = getCadastrosPorDia(period);
    
    if (cadastrosChart) {
        cadastrosChart.destroy();
    }
    
    cadastrosChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Cadastros',
                data: data.values,
                borderColor: '#01B271',
                backgroundColor: 'rgba(1, 178, 113, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#01B271',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Função para criar/atualizar gráfico de distribuição por horário
function updateHorariosChart() {
    const ctx = document.getElementById('horariosChart');
    if (!ctx) return;
    
    const data = getDistribuicaoHorarios();
    
    if (horariosChart) {
        horariosChart.destroy();
    }
    
    horariosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#01B271',
                    '#00d4ff',
                    '#ffc107',
                    '#ff6b6b',
                    '#9c88ff',
                    '#ff9ff3'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 20
                    }
                }
            }
        }
    });
}

// Função para obter dados de cadastros por dia
function getCadastrosPorDia(period) {
    const labels = [];
    const values = [];
    const hoje = new Date();
    
    for (let i = period - 1; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        
        const dataString = data.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
        
        labels.push(dataString);
        
        const cadastrosDia = cadastros.filter(cadastro => {
            const dataCadastro = new Date(cadastro.dataCadastro.split(',')[0]);
            return dataCadastro.toDateString() === data.toDateString();
        }).length;
        
        values.push(cadastrosDia);
    }
    
    return { labels, values };
}

// Função para obter distribuição por horários
function getDistribuicaoHorarios() {
    const horarios = {
        'Manhã (6h-12h)': 0,
        'Tarde (12h-18h)': 0,
        'Noite (18h-24h)': 0,
        'Madrugada (0h-6h)': 0
    };
    
    cadastros.forEach(cadastro => {
        const data = new Date(cadastro.dataCadastro);
        const hora = data.getHours();
        
        if (hora >= 6 && hora < 12) {
            horarios['Manhã (6h-12h)']++;
        } else if (hora >= 12 && hora < 18) {
            horarios['Tarde (12h-18h)']++;
        } else if (hora >= 18 && hora < 24) {
            horarios['Noite (18h-24h)']++;
        } else {
            horarios['Madrugada (0h-6h)']++;
        }
    });
    
    return {
        labels: Object.keys(horarios),
        values: Object.values(horarios)
    };
}

// Função para exportar CSV
async function exportToCSV() {
    try {
        // Usar o endpoint direto do servidor para CSV
        const response = await fetch(`${API_BASE_URL}/exportar/csv`);
        
        if (!response.ok) {
            const errorData = await response.json();
            showNotification(errorData.message || 'Erro ao exportar CSV', 'error');
            return;
        }
        
        // Criar blob do CSV
        const csvContent = await response.text();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Criar link de download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `cadastros_rtx_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Arquivo CSV exportado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        showNotification('Erro de conexão ao exportar CSV', 'error');
    }
}

// Função para limpar todos os dados
async function limparTodosDados() {
    try {
        const response = await fetch(`${API_BASE_URL}/limpar-dados`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('✅ Todos os dados foram limpos com sucesso!');
            
            // Atualizar dashboard
            await updateDashboardStats();
            
            // Limpar lista de cadastros se estiver visível
            if (cadastrosContent) {
                cadastrosContent.innerHTML = '<p style="color: #aaa; text-align: center;">Nenhum cadastro encontrado.</p>';
            }
            
        } else {
            showNotification(result.message || 'Erro ao limpar dados', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        showNotification('Erro de conexão ao limpar dados', 'error');
    }
}

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
