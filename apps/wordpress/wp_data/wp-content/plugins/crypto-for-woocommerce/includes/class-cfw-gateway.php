<?php
if (!defined('ABSPATH')) exit;

class CFW_Gateway extends WC_Payment_Gateway
{

    public function __construct()
    {
        $this->id                 = 'cfw_gateway';
        $this->method_title       = __('Crytpo Gateway', 'crypto-for-woocommerce');
        $this->method_description = __('Redirección a la pasarela externa para completar el pago.', 'crypto-for-woocommerce');
        $this->has_fields         = true;
        $this->supports           = ['products'];

        $this->init_form_fields();
        $this->init_settings();

        $this->enabled       = $this->get_option('enabled', 'no');
        $this->title         = $this->get_option('title', __('Crytpo (Tarjeta/Cripto)', 'crypto-for-woocommerce'));
        $this->description   = $this->get_option('description', '');

        $this->api_key_live  = $this->get_option('api_key_live', '');
        $this->secret_live   = $this->get_option('secret_live', '');
        $this->debug         = $this->get_option('debug', 'no') === 'yes';

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
    }

    public function init_form_fields()
    {
        $this->form_fields = [
            'enabled' => [
                'title'   => __('Enable/Disable', 'crypto-for-woocommerce'),
                'type'    => 'checkbox',
                'label'   => __('Enable Crytpo Gateway', 'crypto-for-woocommerce'),
                'default' => 'no',
            ],
            'title' => [
                'title'       => __('Title', 'crypto-for-woocommerce'),
                'type'        => 'text',
                'description' => __('Text that the customer sees in the checkout.', 'crypto-for-woocommerce'),
                'default'     => __('Crytpo (Card/Crypto)', 'crypto-for-woocommerce'),
            ],
            'description' => [
                'title'       => __('Description', 'crypto-for-woocommerce'),
                'type'        => 'textarea',
                'default'     => __('You will be redirected to a secure payment page.', 'crypto-for-woocommerce'),
            ],
            'endpoint_live' => [
                'title'   => __('Endpoint Live', 'crypto-for-woocommerce'),
                'type'    => 'text',
                'default' => 'https://api.example.com',
            ],
            'wallet_address' => [
                'title'   => __('Wallet Address', 'crypto-for-woocommerce'),
                'type'    => 'text',
                'description' => __('Wallet address to receive the payment.', 'crypto-for-woocommerce'),
            ],

            'api_key_live' => [
                'title' => __('API Key Live', 'crypto-for-woocommerce'),
                'type'  => 'password',
            ],

        ];
    }

    public function process_admin_options()
    {
        $saved = parent::process_admin_options();

        // Validar campos obligatorios
        $errors = [];

        if (empty($this->get_option('title'))) {
            $errors[] = __('The "Title" field is required.', 'crypto-for-woocommerce');
        }

        if (empty($this->get_option('api_key_live')) && $this->get_option('mode') === 'live') {
            $errors[] = __('You must configure the API Key Live when the mode is Live.', 'crypto-for-woocommerce');
        }


        // Show errors in the admin
        if (! empty($errors)) {
            foreach ($errors as $error) {
                WC_Admin_Settings::add_error($error);
            }
            return false; // Avoid saving with errors
        }

        return $saved;
    }


    public function payment_fields()
    {
        $template = locate_template('crypto-for-woocommerce/checkout-payment-fields.php');
        if (!$template) {
            $template = CFW_PLUGIN_DIR . 'templates/checkout-payment-fields.php';
        }
        $title = $this->title;
        $description = $this->description;
        include $template;
    }

    private function current_endpoint(): string
    {
        return $this->endpoint_live;
    }
    private function current_api_key(): string
    {
        return $this->api_key_live;
    }
    private function current_secret(): string
    {
        return $this->secret_live;
    }

    public function process_payment($order_id)
    {
        $order   = wc_get_order($order_id);
        $amount  = $order->get_total();
        $currency = $order->get_currency();

        $return_url = add_query_arg([
            'order_id' => $order_id,
            'hash'     => hash_hmac('sha256', (string)$order_id, $this->current_secret()),
        ], WC()->api_request_url('cfw_return'));

        $payload = [
            'plugin_version' => CFW_VERSION,
            'amount'       => $amount,
            'currency'     => $currency,
            'order_id'     => $order_id,
            'return_url'   => $return_url,
            'callback_url' => rest_url('cfw/v1/webhook'),
        ];

        $args = [
            'headers' => [
                'Authorization'   => 'Bearer ' . $this->current_api_key(),
                'Content-Type'    => 'application/json',
                'Accept'          => 'application/json',
            ],
            'body'    => wp_json_encode($payload),
            'timeout' => 25,
        ];

        $response = wp_remote_post($this->current_endpoint() . '/charges', $args);

        if (is_wp_error($response)) {
            wc_add_notice(__('Error conectando con la pasarela.', 'crypto-for-woocommerce'), 'error');
            return ['result' => 'failure'];
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        $payment_url = $body['payment_url'] ?? '';

        if (!$payment_url) {
            wc_add_notice(__('No se pudo generar la URL de pago.', 'crypto-for-woocommerce'), 'error');
            return ['result' => 'failure'];
        }

        $order->update_status('pending', __('Esperando pago en Crytpo Gateway', 'crypto-for-woocommerce'));
        // Guardar la URL de pago como meta
        update_post_meta($order_id, '_cfw_payment_url', esc_url_raw($payment_url));


        return ['result' => 'success', 'redirect' => esc_url_raw($payment_url)];
    }

    public static function handle_return()
    {
        $order_id = (int)($_GET['order_id'] ?? 0);
        $hash     = isset($_GET['hash']) ? sanitize_text_field($_GET['hash']) : '';

        if (!$order_id || !($order = wc_get_order($order_id))) {
            wp_safe_redirect(wc_get_page_permalink('shop'));
            exit;
        }

        $gateways = WC()->payment_gateways()->payment_gateways();
        $gw = $gateways['cfw_gateway'] ?? null;
        if (!$gw instanceof self) {
            wp_safe_redirect($order->get_checkout_payment_url());
            exit;
        }

        $expected = hash_hmac('sha256', (string)$order_id, $gw->current_secret());
        if (!hash_equals($expected, $hash)) {
            $order->add_order_note(__('Return inválido: firma incorrecta.', 'crypto-for-woocommerce'));
            wp_safe_redirect($order->get_checkout_payment_url());
            exit;
        }

        $order->payment_complete();
        $order->add_order_note(__('Pago confirmado en return URL.', 'crypto-for-woocommerce'));
        wp_safe_redirect($gw->get_return_url($order));
        exit;
    }
}
