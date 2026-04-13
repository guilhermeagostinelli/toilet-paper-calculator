const i18n = {
    en: {
        pageTitle: "Toilet Paper Calculator",
        mainHeading: "Toilet Paper Price Calculator",
        subtitle: "Find the best value by comparing true costs.",
        addTitle: "Add an Option",
        lblBrand: "Brand / Name",
        phBrand: "e.g. Cottonelle Ultra",
        lblPrice: "Price",
        phPrice: "0.00",
        lblRolls: "Number of Rolls",
        phRolls: "12",
        lblRegionalUnit: "Sheets per Roll",
        phRegionalUnit: "200",
        btnAdd: "Add to Compare",
        btnClear: "Clear All",
        resTitle: "Comparison",
        metricBadge: "Price per 100 Sheets",
        emptyState: "Add some options to start comparing!",
        bestValue: "Best Value",
        lblRollsCard: "Rolls",
        calcUnitLabel: "/ 100 sheets",
        regionalCardLabel: "Sheets/Roll",
        currencySymbol: "$",
        btnDonate: "Buy me a <s>coffee</s> Toilet Paper"
    },
    pt: {
        pageTitle: "Calculadora de Papel Higiênico",
        mainHeading: "Calculadora de Preço de Papel Higiênico",
        subtitle: "Encontre o melhor custo-benefício comparando os preços reais.",
        addTitle: "Adicionar Opção",
        lblBrand: "Marca / Nome",
        phBrand: "ex. Neve Folha Dupla",
        lblPrice: "Preço",
        phPrice: "0,00",
        lblRolls: "Quantidade de Rolos",
        phRolls: "12",
        lblRegionalUnit: "Metros por Rolo",
        phRegionalUnit: "30",
        btnAdd: "Adicionar Comparação",
        btnClear: "Limpar Tudo",
        resTitle: "Comparação",
        metricBadge: "Preço por Metro",
        emptyState: "Adicione algumas opções para começar a comparar!",
        bestValue: "Melhor Valor",
        lblRollsCard: "Rolos",
        calcUnitLabel: "/ metro",
        regionalCardLabel: "Metros/Rolo",
        currencySymbol: "R$ ",
        btnDonate: "Me paga um <s>cafezinho</s> Papel Higiênico?"
    }
};

let currentLang = 'en';
let items = [];

// DOM Elements
const form = document.getElementById('tp-form');
const priceInput = document.getElementById('price');
const btnEn = document.getElementById('btn-en');
const btnPt = document.getElementById('btn-pt');
const resultsGrid = document.getElementById('results-grid');
const btnClear = document.getElementById('btn-clear');
const emptyState = document.getElementById('empty-state');
const cardTemplate = document.getElementById('card-template');

// Initialize
function init() {
    form.reset();

    // Detect Language
    const savedLang = localStorage.getItem('tp_lang');
    if (savedLang) {
        currentLang = savedLang;
    } else {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('pt')) {
            currentLang = 'pt';
        }
    }

    // Load Items
    const savedItems = localStorage.getItem('tp_items');
    if (savedItems) {
        items = JSON.parse(savedItems);
    }

    setLanguage(currentLang);
    renderItems();
}

// Language Handling
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tp_lang', lang);
    document.documentElement.lang = lang;

    const dict = i18n[lang];

    // Update buttons
    btnEn.classList.toggle('active', lang === 'en');
    btnPt.classList.toggle('active', lang === 'pt');

    // Update text content for data-i18n items
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });

    // Update currency symbol in form
    document.getElementById('currency-symbol').textContent = dict.currencySymbol;

    // Reformat existing price input if it has a value
    if (priceInput.value) {
        reformatPriceInput();
    }

    // Re-render items as their labels might have changed
    renderItems();
}

btnEn.addEventListener('click', () => setLanguage('en'));
btnPt.addEventListener('click', () => setLanguage('pt'));

// Calculators
function calculateNormalizedPrice(price, rolls, regionalUnit, lang) {
    // If English (USA rule): Calculate Price per 100 Sheets
    // price / (rolls * sheets) = price per 1 sheet
    // then multiply by 100
    if (lang === 'en') {
        const totalSheets = rolls * regionalUnit;
        return (price / totalSheets) * 100;
    }
    // If Portuguese (BR rule): Calculate Price per Meter
    // price / (rolls * meters)
    else {
        const totalMeters = rolls * regionalUnit;
        return (price / totalMeters);
    }
}

// Price Input Masking
function reformatPriceInput() {
    let digits = priceInput.value.replace(/\D/g, '');
    if (!digits) {
        priceInput.value = '';
        return;
    }
    let num = parseInt(digits, 10) / 100;
    let formatter = new Intl.NumberFormat(currentLang === 'pt' ? 'pt-BR' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    priceInput.value = formatter.format(num);
}

priceInput.addEventListener('input', reformatPriceInput);

// Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = Date.now().toString();
    const name = document.getElementById('brandName').value;

    // Parse the masked value into a proper float
    const priceRaw = priceInput.value.replace(/\D/g, '');
    const price = priceRaw ? parseInt(priceRaw, 10) / 100 : 0;

    const rolls = parseInt(document.getElementById('rolls').value);
    const regionalUnit = parseFloat(document.getElementById('regionalUnit').value);

    const item = {
        id,
        name,
        price,
        rolls,
        regionalUnit
    };

    items.push(item);
    saveItems();
    form.reset();
    renderItems();
});

// Clear All
btnClear.addEventListener('click', () => {
    items = [];
    saveItems();
    renderItems();
});

// Delete Item
function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveItems();
    renderItems();
}

// Save Items
function saveItems() {
    localStorage.setItem('tp_items', JSON.stringify(items));
}

// Render Items
function renderItems() {
    // Clear current non-empty states
    Array.from(resultsGrid.children).forEach(child => {
        if (child.id !== 'empty-state') {
            child.remove();
        }
    });

    if (items.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    const dict = i18n[currentLang];

    // Find the cheapest
    let cheapestId = null;
    let lowestVal = Infinity;

    const calculatedItems = items.map(item => {
        const normalizedVal = calculateNormalizedPrice(item.price, item.rolls, item.regionalUnit, currentLang);
        if (normalizedVal < lowestVal) {
            lowestVal = normalizedVal;
            cheapestId = item.id;
        }
        return { ...item, normalizedVal };
    });

    calculatedItems.forEach(item => {
        const clone = cardTemplate.content.cloneNode(true);
        const cardNode = clone.querySelector('.card');

        if (item.id === cheapestId && calculatedItems.length > 1) {
            cardNode.classList.add('is-cheapest');
            clone.querySelector('.best-value-badge').textContent = dict.bestValue;
        }

        // formatting
        const formatter = new Intl.NumberFormat(currentLang === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: currentLang === 'pt' ? 'BRL' : 'USD'
        });

        const formatCurrency = (val) => {
            let str = formatter.format(val);
            if (currentLang === 'pt') {
                return str.replace(/^R\$\s*/, 'R$ ');
            }
            return str;
        };

        clone.querySelector('.card-title').textContent = item.name;

        // Show normalized price
        clone.querySelector('.calc-price').textContent = formatCurrency(item.normalizedVal);
        clone.querySelector('.calc-unit').textContent = dict.calcUnitLabel;

        // Details
        clone.querySelector('[data-i18n="lblPrice"]').textContent = dict.lblPrice;
        clone.querySelector('.detail-price').textContent = formatCurrency(item.price);

        clone.querySelector('.detail-rolls').textContent = item.rolls;
        clone.querySelector('[data-i18n="lblRollsCard"]').textContent = dict.lblRollsCard;

        clone.querySelector('.detail-regional').textContent = item.regionalUnit;
        clone.querySelector('.detail-regional-label').textContent = dict.regionalCardLabel;

        // Delete button
        clone.querySelector('.btn-delete').addEventListener('click', () => deleteItem(item.id));

        resultsGrid.appendChild(clone);
    });
}

// Start
init();
