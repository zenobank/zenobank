const { registerPaymentMethod } = wc.wcBlocksRegistry;
const { getPaymentMethodData } = wc.wcSettings;
const { createElement } = wp.element;

const settings = getPaymentMethodData('cfw_gateway') || {};

registerPaymentMethod({
    name: 'cfw_gateway',
    label: settings.title || 'Crypto Gateway',
    content: createElement('p', null, settings.description || 'Paga con criptomonedas.'),
    edit: createElement('p', null, settings.description || 'Paga con criptomonedas.'),
    canMakePayment: () => true,
    ariaLabel: settings.title || 'Crypto Gateway',
    supports: {
        features: settings.supports || [],
    },
});
