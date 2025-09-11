import { sprintf, __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { getSetting } from '@woocommerce/settings';
import { registerPaymentMethod } from '@woocommerce/blocks-registry';

const settings = getSetting('wc_payerurl_gateway_data', {});

const defaultLabel = __(
  'Payerurl',
  'ABC-crypto-currency-payment-gateway-for-wooCommerce'
);

const label = decodeEntities(settings.title) || defaultLabel;

const Content = (props) => {
  return decodeEntities(settings.description);
};

const Label = (props) => {
  const { PaymentMethodLabel } = props.components;
  return <PaymentMethodLabel text={label} />;
};

const Payerurl = {
  name: 'wc_payerurl_gateway',
  label: (
    <div>
      <img
        src={`/wp-content/plugins/payerurl-crypto-currency-payment-gateway-for-woocommerce/assets/images/coin_high.png`}
        alt={decodeEntities(settings.title)}
      />
      &nbsp;
      {label}
    </div>
  ),
  content: <Content />,
  edit: <Content />,
  canMakePayment: () => true,
  ariaLabel: label,
  supports: {
    features: settings.supports,
  },
};

registerPaymentMethod(Payerurl);
