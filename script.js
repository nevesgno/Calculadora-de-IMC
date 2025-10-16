// Seleção de elementos DOM
const form = document.getElementById('imc-form');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const resultDisplay = document.getElementById('result-display');
const weightUnit = document.getElementById('weight-unit');
const heightUnit = document.getElementById('height-unit');
const systemToggle = document.getElementById('system-toggle');
const genderToggle = document.getElementById('gender-toggle');
const messageBox = document.getElementById('message-box');
const imcTableItems = document.querySelectorAll('.tabela-item');

// Estrutura de interpretação do IMC (OMS - Padrão)
const IMC_RANGES = [
    { max: 18.5, label: "Abaixo do Peso", category: "abaixo", color: "#f87171" },
    { max: 24.9, label: "Peso Saudável", category: "saudavel", color: "#4ade80" },
    { max: 29.9, label: "Sobrepeso", category: "sobrepeso", color: "#facc15" },
    { max: 34.9, label: "Obesidade Grau I", category: "obesidade1", color: "#fb923c" },
    { max: 39.9, label: "Obesidade Grau II", category: "obesidade2", color: "#ef4444" },
    { max: Infinity, label: "Obesidade Grau III (Mórbida)", category: "obesidade3", color: "#b91c1c" },
];

/**
 * Função para mostrar mensagens de erro/validação.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} [type='error'] - O tipo de mensagem ('error' ou 'success').
 */
function showMessage(message, type = 'error') {
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'bg-red-100', 'bg-green-100', 'border-red-400', 'border-green-400', 'text-red-700', 'text-green-700');

    if (type === 'error') {
        messageBox.className = 'mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg';
    } else {
        messageBox.className = 'mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg';
    }
}

/**
 * Atualiza as unidades de medida (kg/cm ou lbs/ft).
 */
function updateUnits() {
    const isMetric = document.querySelector('input[name="system"]:checked').value === 'metric';

    if (isMetric) {
        weightUnit.textContent = 'kg';
        heightUnit.textContent = 'cm';
        heightInput.step = '1';
        weightInput.step = '0.1';
    } else {
        weightUnit.textContent = 'lbs';
        heightUnit.textContent = 'ft';
        // Para inputs em pés, permitir decimais (ex: 5.8)
        heightInput.step = '0.01'; 
        weightInput.step = '0.1';
    }
}

/**
 * Calcula o Índice de Massa Corporal (IMC).
 * @param {number} weight - O peso (em kg ou lbs).
 * @param {number} height - A altura (em cm ou ft).
 * @param {string} system - O sistema de medida ('metric' ou 'imperial').
 * @returns {string} O valor do IMC arredondado para duas casas decimais.
 */
function calculateIMC(weight, height, system) {
    let finalWeight = parseFloat(weight);
    let finalHeight = parseFloat(height);

    if (system === 'imperial') {
        // Conversão Imperial para Métrico para cálculo do IMC (kg/m²)
        finalHeight = finalHeight * 0.3048; // ft para metros
        finalWeight = finalWeight * 0.453592; // lbs para kg
    } else {
        // Se métrico, converte cm para metros
        finalHeight = finalHeight / 100;
    }
    
    if (finalHeight <= 0 || isNaN(finalHeight)) {
        return 0; 
    }

    const imc = finalWeight / (finalHeight * finalHeight);
    return imc.toFixed(2);
}

/**
 * Obtém a categoria de interpretação do IMC e destaca na tabela.
 * @param {number} imc - O valor calculado do IMC.
 * @returns {object} O objeto de faixa correspondente.
 */
function getInterpretationAndHighlight(imc) {
    let interpretation = IMC_RANGES[0];

    // Encontra a interpretação
    for (const range of IMC_RANGES) {
        if (imc < range.max) {
            interpretation = range;
            break;
        }
    }

    // Destaca a categoria na Tabela de Referência
    imcTableItems.forEach(item => item.classList.remove('active'));
    const itemAtivo = document.querySelector(`.tabela-item[data-category="${interpretation.category}"]`);
    if (itemAtivo) {
        itemAtivo.classList.add('active');
    }

    return interpretation;
}

/**
 * Renderiza o resultado do IMC na caixa de exibição.
 * @param {string} imc - O valor do IMC.
 * @param {string} gender - O gênero selecionado.
 */
function renderResult(imc, gender) {
    const imcValue = parseFloat(imc);
    const interpretation = getInterpretationAndHighlight(imcValue);
    
    // 1. Limpa e Adiciona a classe de personalização do gênero (para gradiente de fundo)
    resultDisplay.classList.remove('female', 'male');
    resultDisplay.classList.add(gender);
    
    // 2. Define a cor de destaque (fundo da categoria)
    const resultBgColor = interpretation.color;

    // 3. Renderiza o HTML do resultado
    resultDisplay.innerHTML = `
        <p class="text-lg font-bold">Seu IMC é:</p>
        <p class="text-6xl font-extrabold my-2">${imc}</p>
        <p class="text-xl font-semibold mt-1 rounded-full px-4 py-1" style="background-color: ${resultBgColor}; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
            ${interpretation.label}
        </p>
        <p class="text-sm mt-3 opacity-90">
            ${interpretation.label.includes('Saudável') ? 
                'Parabéns! Você está na faixa de peso saudável.' : 
                'Seu resultado indica a categoria de peso: ' + interpretation.label + '.'
            }
        </p>
    `;
    
    messageBox.classList.add('hidden'); // Oculta mensagens de erro
}

/**
 * Configura a variável CSS dinâmica (--color-current-accent) com base no gênero.
 */
function updateAccentColor() {
    const currentGender = document.querySelector('input[name="gender"]:checked').value;
    const isFemale = currentGender === 'female';

    const accentColor = isFemale ? 'var(--color-female-main)' : 'var(--color-male-main)';
    
    // 1. Define a variável global CSS (para botões de toggle)
    document.documentElement.style.setProperty('--color-current-accent', accentColor);
    
    // 2. Define a variável inline do Tailwind (para o foco dos inputs)
    weightInput.style.setProperty('--tw-ring-color', accentColor);
    heightInput.style.setProperty('--tw-ring-color', accentColor);
    
    // 3. Atualiza o display (cor de fundo do result-box)
    resultDisplay.classList.remove('female', 'male');
    resultDisplay.classList.add(currentGender);
}

// ----------------------------------------------------------------------
// LISTENERS DE EVENTOS
// ----------------------------------------------------------------------

// Listener para alternar unidades
systemToggle.addEventListener('change', updateUnits);

// Listener para mudar a personalização por gênero
genderToggle.addEventListener('change', () => {
    updateAccentColor();
    
    // Se o resultado estiver visível, re-renderiza para atualizar as cores
    const imcElement = resultDisplay.querySelector('.text-6xl');
    if (imcElement) {
        const imc = imcElement.textContent;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        renderResult(parseFloat(imc), gender);
    }
});

// Listener principal do formulário
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const age = document.getElementById('age').value;
    const weight = weightInput.value;
    const height = heightInput.value;
    const system = document.querySelector('input[name="system"]:checked').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;

    // Validação de inputs
    if (weight <= 0 || height <= 0 || age < 18 || weight === '' || height === '' || age === '') {
        showMessage("Por favor, insira uma Idade (mín. 18), Peso e Altura válidos e positivos.");
        return;
    }

    // Chama o cálculo
    const imcResult = calculateIMC(weight, height, system);

    // Renderiza o resultado
    renderResult(imcResult, gender);
});

/**
 * Função de inicialização: configura unidades e tema
 */
function initializeApp() {
    updateUnits();
    updateAccentColor(); // Define a cor inicial
    // Inicializa a caixa de mensagem como oculta
    messageBox.classList.add('hidden'); 
    
    // Adiciona o disclaimer legal na caixa de mensagem para reuso
    messageBox.dataset.originalContent = "O IMC é uma medida de referência e não substitui a avaliação de um profissional de saúde.";
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', initializeApp);
