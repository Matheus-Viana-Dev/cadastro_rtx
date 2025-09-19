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

// URL do webhook - ATUALIZADA PARA SUA URL
const WEBHOOK_URL = 'https://nodesapi.tecskill.com.br/webhook/b6b01855-86d6-4d1f-9399-03f40dab6f9f';

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

// Função ATUALIZADA para enviar dados APENAS para o webhook
async function enviarParaWebhook(dados) {
    try {
        console.log('Enviando dados para webhook:', dados);
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        console.log('Status da resposta:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (response.ok) {
            const responseData = await response.text();
            console.log('Resposta do webhook:', responseData);
            return { 
                success: true, 
                message: 'Dados enviados com sucesso para o webhook!',
                data: responseData
            };
        } else {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            return { 
                success: false, 
                message: `Erro ${response.status}: ${errorText || 'Erro no servidor'}` 
            };
        }
    } catch (error) {
        console.error('Erro ao enviar para webhook:', error);
        return { 
            success: false, 
            message: `Erro de conexão: ${error.message}. Verifique sua internet e tente novamente.` 
        };
    }
}

// Event listener ATUALIZADO para o formulário de cadastro
cadastroForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Coletar dados do formulário
    formData = {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        senha: document.getElementById('senha').value.trim(),
        tipoUsuario: document.getElementById('user-type').value,
        dataCadastro: new Date().toISOString(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        origem: 'formulario_rtx'
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
    
    try {
        const result = await enviarParaWebhook(formData);
        
        if (result.success) {
            // Mostrar tela de agradecimento
            showScreen('agradecimento-screen');
            showNotification('Cadastro realizado com sucesso!');
            
            // Limpar formulário
            cadastroForm.reset();
            
            // Limpar seleção de tipo de usuário
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById('user-type').value = '';
            
            // Limpar indicador de senha
            const indicator = document.getElementById('senha-indicator');
            if (indicator) {
                indicator.classList.remove('active');
            }
            
            formData = {};
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Erro inesperado:', error);
        showNotification('Erro inesperado. Tente novamente.', 'error');
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
    
    // Limpar seleção de tipo de usuário
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('user-type').value = '';
    
    // Limpar indicador de senha
    const indicator = document.getElementById('senha-indicator');
    if (indicator) {
        indicator.classList.remove('active');
    }
    
    formData = {};
});

// Event listener para formatação do telefone
const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
    telefoneInput.addEventListener('input', function(e) {
        const formatted = formatPhoneNumber(e.target.value);
        e.target.value = formatted;
    });
}

// Event listener para animação de foco nos inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Event listeners para navegação do dashboard (removido funcionalidades do Google Sheets)
if (dashboardBtn) {
    dashboardBtn.addEventListener('click', function() {
        showScreen('dashboard-screen');
        showNotification('Dashboard simplificado - apenas para navegação');
    });
}

if (voltarDashboardBtn) {
    voltarDashboardBtn.addEventListener('click', function() {
        showScreen('cadastro-screen');
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que a tela de cadastro esteja ativa inicialmente
    showScreen('cadastro-screen');
    
    // Adicionar efeito de partículas no fundo (opcional)
    createParticleEffect();
    
    console.log('Sistema iniciado - Webhook URL:', WEBHOOK_URL);
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