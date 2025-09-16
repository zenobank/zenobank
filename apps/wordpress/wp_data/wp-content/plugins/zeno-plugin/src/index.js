import { decodeEntities } from '@wordpress/html-entities';

const { registerPaymentMethod } = window.wc.wcBlocksRegistry;
const { getSetting } = window.wc.wcSettings;

const settings = getSetting('zeno_data', {});

const label = decodeEntities(settings.title || 'Crypto payment');

const Content = () => {
	return decodeEntities(settings.description || 'Pay with crypto');
};

const Icon = () => {
	return settings.icon 
		? <img src={settings.icon} style={{ float: 'right', marginRight: '20px', maxHeight: '32px' }} alt={label} /> 
		: '';
};

const Label = () => {
	return (
        <span style={{ width: '100%' }}>
            {label}
            <Icon />
        </span>
    );
};

registerPaymentMethod({
	name: "zeno",
	label: <Label />,
	content: <Content />,
	edit: <Content />,
	canMakePayment: () => true,
	ariaLabel: label,
	supports: {
		features: settings.supports || [],
	}
});