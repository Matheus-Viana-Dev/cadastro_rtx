// Estado do mercado para o gráfico de fundo
let marketState = {
    currentPrice: 67428.50,
    previousPrice: 67428.50,
    priceHistory: [],
    candleIndex: 0,
    priceRange: { min: 45000, max: 85000 },
    marketCycle: 'neutral',
    cycleStrength: 0,
    volatilityBoost: 1,
    consecutiveMoves: 0,
    lastDirection: 0,
    extremeEventCountdown: 0
};

// Gerar vela com sistema otimizado para fundo
function generateUltraVolatileCandle(index) {
    updateMarketCycle();
    
    let directionBias = 0.5;
    
    switch(marketState.marketCycle) {
        case 'bull':
            directionBias = 0.75;
            break;
        case 'bear':
            directionBias = 0.25;
            break;
        case 'crash':
            directionBias = 0.05;
            break;
        case 'moon':
            directionBias = 0.95;
            break;
        case 'neutral':
            directionBias = 0.5;
            break;
    }
    
    const isBullish = Math.random() < directionBias;
    
    if (marketState.lastDirection < 0 && marketState.consecutiveMoves > 2) {
        directionBias *= 0.4;
    } else if (marketState.lastDirection > 0 && marketState.consecutiveMoves > 2) {
        directionBias *= 1.6;
    }
    
    let priceChange = 0;
    let volatilityMultiplier = marketState.volatilityBoost;
    
    if (marketState.marketCycle === 'crash') {
        priceChange = -(Math.random() * 8000 + 2000) * volatilityMultiplier;
    } else if (marketState.marketCycle === 'moon') {
        priceChange = (Math.random() * 10000 + 3000) * volatilityMultiplier;
    } else if (isBullish) {
        priceChange = (Math.random() * 3000 + 100) * volatilityMultiplier;
    } else {
        priceChange = -(Math.random() * 2500 + 100) * volatilityMultiplier;
    }
    
    if (Math.random() < 0.02) {
        const extremeMove = (Math.random() - 0.5) * 15000;
        priceChange += extremeMove;
    }
    
    const open = marketState.currentPrice;
    const close = open + priceChange;
    const finalClose = Math.max(20000, Math.min(150000, close));
    const actualChange = finalClose - open;
    
    const wickRange = Math.abs(actualChange) * 1.5 + 500;
    const high = Math.max(open, finalClose) + Math.random() * wickRange;
    const low = Math.min(open, finalClose) - Math.random() * wickRange;
    
    marketState.priceHistory.push(finalClose);
    if (marketState.priceHistory.length > 20) {
        marketState.priceHistory.shift();
    }
    
    if ((actualChange > 0 && marketState.lastDirection > 0) || 
        (actualChange < 0 && marketState.lastDirection < 0)) {
        marketState.consecutiveMoves++;
    } else {
        marketState.consecutiveMoves = 1;
    }
    marketState.lastDirection = actualChange > 0 ? 1 : -1;
    
    updateDynamicRange(finalClose);
    
    return {
        open,
        close: finalClose,
        high: Math.max(high, Math.max(open, finalClose)),
        low: Math.min(low, Math.min(open, finalClose)),
        isBullish: actualChange > 0,
        priceChange: actualChange,
        volatility: Math.abs(high - low),
        isExtreme: Math.abs(actualChange) > 2000 || Math.abs(high - low) > 5000,
        volume: Math.random() * 2000 + 500 + (Math.abs(actualChange) / 10)
    };
}

// Atualizar ciclo de mercado
function updateMarketCycle() {
    marketState.extremeEventCountdown--;
    
    if (marketState.extremeEventCountdown <= 0 && Math.random() < 0.08) {
        if (Math.random() < 0.4) {
            marketState.marketCycle = 'crash';
            marketState.volatilityBoost = 2.5;
            marketState.extremeEventCountdown = 5;
        } else {
            marketState.marketCycle = 'moon';
            marketState.volatilityBoost = 2.8;
            marketState.extremeEventCountdown = 6;
        }
        return;
    }
    
    if (marketState.extremeEventCountdown <= 0 && 
        (marketState.marketCycle === 'crash' || marketState.marketCycle === 'moon')) {
        marketState.marketCycle = 'neutral';
        marketState.volatilityBoost = 1;
    }
    
    if (marketState.priceHistory.length >= 10) {
        const recent = marketState.priceHistory.slice(-10);
        const trend = recent[recent.length - 1] - recent[0];
        const volatility = Math.max(...recent) - Math.min(...recent);
        
        if (trend > 5000 && volatility > 8000) {
            marketState.marketCycle = 'bull';
            marketState.volatilityBoost = 1.3;
        } else if (trend < -5000 && volatility > 8000) {
            marketState.marketCycle = 'bear';
            marketState.volatilityBoost = 1.4;
        } else {
            marketState.marketCycle = 'neutral';
            marketState.volatilityBoost = Math.random() * 0.8 + 0.8;
        }
    }
}

// Atualizar range de preços
function updateDynamicRange(currentPrice) {
    const buffer = 15000;
    
    if (currentPrice > marketState.priceRange.max - buffer) {
        marketState.priceRange.max = currentPrice + buffer;
    }
    
    if (currentPrice < marketState.priceRange.min + buffer) {
        marketState.priceRange.min = Math.max(20000, currentPrice - buffer);
    }
}

// Criar velas otimizadas para fundo
function createUltraVolatileCandles() {
    const container = document.getElementById('candlesticks');
    if (!container) return;
    
    const existingCandles = Array.from(container.children);
    existingCandles.forEach((candle) => {
        const currentTransform = candle.style.transform || '';
        const currentX = parseFloat(currentTransform.match(/translateX\(([^)]+)\)/)?.[1] || 0);
        candle.style.transform = `translateX(${currentX - 12}px)`;
        
        const device = detectDevice();
        const maxCandles = device.isMobile ? 25 : 50;
        
        if (currentX < -60 && existingCandles.length > maxCandles) {
            setTimeout(() => {
                if (candle.parentNode) candle.remove();
            }, 600);
        }
    });

    const candleData = generateUltraVolatileCandle(marketState.candleIndex++);
    const candle = document.createElement('div');
    
    let candleClasses = `candle ${candleData.isBullish ? 'bullish' : 'bearish'}`;
    
    if (Math.abs(candleData.priceChange) > 5000 && candleData.isBullish) {
        candleClasses += ' moon-shot';
    } else if (Math.abs(candleData.priceChange) > 4000 && !candleData.isBullish) {
        candleClasses += ' market-crash';
    } else if (candleData.isExtreme) {
        candleClasses += candleData.isBullish ? ' extreme-pump' : ' extreme-dump';
    }
    
    candle.className = candleClasses;
    
    const bodyHeight = Math.max(8, Math.abs(candleData.close - candleData.open) / 80);
    const wickTopHeight = Math.max(4, (candleData.high - Math.max(candleData.open, candleData.close)) / 80);
    const wickBottomHeight = Math.max(4, (Math.min(candleData.open, candleData.close) - candleData.low) / 80);
    
    const priceRange = marketState.priceRange.max - marketState.priceRange.min;
    const pricePosition = ((candleData.close - marketState.priceRange.min) / priceRange) * 85 + 5;
    candle.style.bottom = Math.max(5, Math.min(95, pricePosition)) + '%';
    
    candle.innerHTML = `
        <div class="candle-wick-top" style="height: ${Math.min(100, wickTopHeight)}px;"></div>
        <div class="candle-body" style="height: ${Math.min(120, bodyHeight)}px;"></div>
        <div class="candle-wick-bottom" style="height: ${Math.min(100, wickBottomHeight)}px;"></div>
    `;
    
    container.appendChild(candle);
    
    marketState.previousPrice = marketState.currentPrice;
    marketState.currentPrice = candleData.close;
}

// Volume correlacionado
function createCorrelatedVolume() {
    const container = document.getElementById('volume');
    if (!container) return;
    
    const existingBars = Array.from(container.children);
    existingBars.forEach((bar) => {
        const currentTransform = bar.style.transform || '';
        const currentX = parseFloat(currentTransform.match(/translateX\(([^)]+)\)/)?.[1] || 0);
        bar.style.transform = `${currentTransform} translateX(${currentX - 12}px)`;
        
        const device = detectDevice();
        const maxBars = device.isMobile ? 25 : 50;
        
        if (currentX < -60 && existingBars.length > maxBars) {
            setTimeout(() => {
                if (bar.parentNode) bar.remove();
            }, 600);
        }
    });

    const priceDiff = Math.abs(marketState.currentPrice - marketState.previousPrice);
    const baseVolume = 15;
    const volatilityVolume = (priceDiff / 100) * 2;
    const cycleVolume = marketState.marketCycle === 'crash' || marketState.marketCycle === 'moon' ? 25 : 5;
    
    const totalVolume = Math.min(55, baseVolume + volatilityVolume + cycleVolume + Math.random() * 15);
    
    const isGreen = marketState.currentPrice > marketState.previousPrice;
    const isVolumeExplosion = totalVolume > 45;
    
    const bar = document.createElement('div');
    bar.className = isVolumeExplosion ? 'volume-bar volume-explosion' : 'volume-bar';
    bar.style.height = totalVolume + 'px';
    
    const intensity = isVolumeExplosion ? '1' : '0.8';
    if (isGreen) {
        bar.style.background = `linear-gradient(180deg, rgba(14, 203, 129, ${intensity}) 0%, rgba(14, 203, 129, ${intensity * 0.6}) 100%)`;
    } else {
        bar.style.background = `linear-gradient(180deg, rgba(246, 70, 93, ${intensity}) 0%, rgba(246, 70, 93, ${intensity * 0.6}) 100%)`;
    }
    
    container.appendChild(bar);
}

// Atualizar indicadores
function updateAllIndicators() {
    const currentPriceLine = document.getElementById('currentPriceLine');
    if (currentPriceLine) {
        const priceRange = marketState.priceRange.max - marketState.priceRange.min;
        const pricePosition = ((marketState.currentPrice - marketState.priceRange.min) / priceRange) * 85 + 5;
        currentPriceLine.style.top = Math.max(5, Math.min(95, 100 - pricePosition)) + '%';
    }
    
    const trendLine = document.getElementById('trendLine');
    if (trendLine) {
        trendLine.className = `trend-line ${marketState.marketCycle === 'bull' ? 'bull-run' : 
                                             marketState.marketCycle === 'bear' ? 'bear-market' : 'sideways'}`;
    }
    
    updateDynamicPriceLabels();
}

// Labels de preço dinâmicos
function updateDynamicPriceLabels() {
    const container = document.getElementById('price-sidebar');
    if (!container) return;
    
    container.innerHTML = '';

    const priceRange = marketState.priceRange.max - marketState.priceRange.min;
    const step = priceRange / 8;
    const levels = [5, 17.5, 30, 42.5, 55, 67.5, 80, 92.5];

    levels.forEach((level, index) => {
        const label = document.createElement('div');
        label.className = 'price-tag';
        const price = marketState.priceRange.min + (step * index);
        label.textContent = '$' + Math.floor(price).toLocaleString('en-US');
        label.style.top = (100 - level) + '%';
        
        if (Math.abs(price - marketState.currentPrice) < step * 0.3) {
            label.classList.add('current');
        }
        
        container.appendChild(label);
    });
}

// Preços flutuantes otimizados
function createExtremePrices() {
    const container = document.getElementById('floating-data');
    if (!container) return;
    
    const priceDiff = marketState.currentPrice - marketState.previousPrice;
    const changePercent = (priceDiff / marketState.previousPrice) * 100;
    const isExtreme = Math.abs(priceDiff) > 1500;
    
    const phrases = [
        { text: () => '$' + Math.floor(marketState.currentPrice).toLocaleString(), color: 'yellow' },
        { text: () => (priceDiff > 0 ? '+' : '') + priceDiff.toFixed(0), color: priceDiff > 0 ? 'green' : 'red' },
        { text: () => (priceDiff > 0 ? '+' : '') + changePercent.toFixed(2) + '%', color: priceDiff > 0 ? 'green' : 'red' },
        { text: () => Math.abs(priceDiff) > 3000 ? '🚀 INSANE! 🚀' : '📈 PUMP', color: 'green' },
        { text: () => Math.abs(priceDiff) > 3000 ? '💥 DUMP! 💥' : '📉 DUMP', color: 'red' },
        { text: () => marketState.marketCycle === 'crash' ? '🔥 FIRE! 🔥' : 'HODL', color: 'white' },
        { text: () => marketState.marketCycle === 'moon' ? '🌙 MOON! 🌙' : 'BTC', color: 'yellow' },
        { text: () => 'VOL: ' + Math.floor((Math.abs(priceDiff) / 100) * 1000 + 50000).toLocaleString(), color: 'white' },
        { text: () => isExtreme ? '⚡ MOVE! ⚡' : 'CRYPTO', color: isExtreme ? 'yellow' : 'white' }
    ];

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const float = document.createElement('div');
    
    float.className = `price-float ${phrase.color} ${isExtreme ? 'extreme' : ''}`;
    float.textContent = phrase.text();
    float.style.left = Math.random() * 80 + 5 + '%';
    float.style.fontSize = isExtreme ? '16px' : '12px';
    
    container.appendChild(float);

    setTimeout(() => {
        if (float.parentNode) float.remove();
    }, 6000);
}

// Partículas otimizadas
function createMarketParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const intensity = marketState.marketCycle === 'crash' || marketState.marketCycle === 'moon' ? 15 : 8;
    
    for (let i = 0; i < intensity; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = `particle ${intensity > 12 ? 'intense' : ''}`;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 12 + 's';
            particle.style.animationDuration = (Math.random() * 6 + 8) + 's';
            
            container.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) particle.remove();
            }, 15000);
        }, i * 800);
    }
}

// Detectar dispositivo e plataforma
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isDesktop = !isMobile;
    
    return {
        isIOS,
        isAndroid,
        isMobile,
        isDesktop,
        platform: isIOS ? 'ios' : isAndroid ? 'android' : isDesktop ? 'desktop' : 'unknown'
    };
}

// Configurações adaptadas por dispositivo
function getDeviceConfig() {
    const device = detectDevice();
    
    if (device.isIOS) {
        return {
            candleInterval: 1500, // Mais lento no iOS
            volumeInterval: 1500,
            indicatorInterval: 3000,
            priceInterval: 1000,
            particleInterval: 25000,
            maxCandles: 25, // Menos velas no iOS
            enableParticles: false, // Desabilitar partículas no iOS
            enableFloatingPrices: true,
            animationSpeed: 'slow'
        };
    } else if (device.isAndroid) {
        return {
            candleInterval: 1200,
            volumeInterval: 1200,
            indicatorInterval: 2500,
            priceInterval: 900,
            particleInterval: 20000,
            maxCandles: 30,
            enableParticles: true,
            enableFloatingPrices: true,
            animationSpeed: 'normal'
        };
    } else {
        return {
            candleInterval: 1000, // Mais rápido no desktop
            volumeInterval: 1000,
            indicatorInterval: 2000,
            priceInterval: 800,
            particleInterval: 15000,
            maxCandles: 40,
            enableParticles: true,
            enableFloatingPrices: true,
            animationSpeed: 'fast'
        };
    }
}

// Inicialização otimizada para fundo
function initializeChartBackground() {
    const device = detectDevice();
    const config = getDeviceConfig();
    
    console.log('🚀 Iniciando gráfico de fundo...', {
        device: device.platform,
        config: config
    });
    
    // Configurar histórico inicial
    for (let i = 0; i < 10; i++) {
        marketState.priceHistory.push(marketState.currentPrice + (Math.random() - 0.5) * 5000);
    }
    
    // Criar velas iniciais (menos no mobile)
    const initialCandles = device.isMobile ? 15 : 30;
    for (let i = 0; i < initialCandles; i++) {
        setTimeout(() => {
            createUltraVolatileCandles();
            createCorrelatedVolume();
        }, i * (device.isIOS ? 300 : 200));
    }

    updateAllIndicators();
    
    // Só criar partículas se habilitado
    if (config.enableParticles) {
        createMarketParticles();
    }

    // Loops otimizados por dispositivo
    setInterval(createUltraVolatileCandles, config.candleInterval);
    setInterval(createCorrelatedVolume, config.volumeInterval);
    setInterval(updateAllIndicators, config.indicatorInterval);
    
    if (config.enableFloatingPrices) {
        setInterval(createExtremePrices, config.priceInterval);
    }
    
    if (config.enableParticles) {
        setInterval(createMarketParticles, config.particleInterval);
    }

    console.log('✅ Gráfico de fundo ativo!', {
        device: device.platform,
        candles: config.candleInterval + 'ms',
        particles: config.enableParticles ? 'habilitado' : 'desabilitado'
    });
}

// Iniciar quando carregar
document.addEventListener('DOMContentLoaded', initializeChartBackground);
