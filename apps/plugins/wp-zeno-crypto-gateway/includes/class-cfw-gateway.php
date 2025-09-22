<?php
if (!defined('ABSPATH')) exit;

class CFW_Gateway extends WC_Payment_Gateway
{
    private $api_key_live;
    private $secret_live;
    private $debug;
    private $test_mode;

    public function __construct()
    {
        $this->id                 = 'cfw_gateway';
        $this->method_title       = esc_html__('Crytpo Gateway', 'crypto-for-woocommerce');
        $this->method_description = esc_html__('Redirect to the external gateway to complete the payment.', 'crypto-for-woocommerce');
        $this->has_fields         = true;
        $this->supports           = ['products'];

        $this->init_form_fields();
        $this->init_settings();

        $this->enabled       = $this->get_option('enabled', 'no');
        $this->title         = $this->get_option('title', __('Pay with Crypto', 'crypto-for-woocommerce'));
        $this->description   = $this->get_option('description', esc_html__('Pay securely with cryptocurrency. You will be redirected to our secure payment page to complete your transaction.', 'crypto-for-woocommerce'));

        $this->api_key_live  = $this->get_option('api_key_live', '');
        $this->secret_live   = $this->get_option('secret_live', '');
        $this->test_mode     = true; // Always enabled by default
        $this->debug         = $this->get_option('debug', 'no') === 'yes';

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
    }

    public function init_form_fields()
    {
        $this->form_fields = [
            'enabled' => [
                'title'   => __('Enable/Disable', 'crypto-for-woocommerce'),
                'type'    => 'checkbox',
                'label'   => __('Enable Crypto Gateway', 'crypto-for-woocommerce'),
                'default' => 'no',
            ],
            'title' => [
                'title'       => __('Title', 'crypto-for-woocommerce'),
                'type'        => 'text',
                'description' => __('Text that the customer sees in the checkout.', 'crypto-for-woocommerce'),
                'default'     => __('Crypto Payment Gateway', 'crypto-for-woocommerce'),
            ],
            'description' => [
                'title'       => __('Description', 'crypto-for-woocommerce'),
                'type'        => 'textarea',
                'default'     => __('Pay securely with cryptocurrency ', 'crypto-for-woocommerce'),
            ],
        ];

        // Only show wallet field if no valid wallet is configured
        if (!$this->has_valid_wallet()) {
            $this->form_fields['wallet_address'] = [
                'title'       => __('Wallet Address', 'crypto-for-woocommerce'),
                'type'        => 'text',
                'placeholder' => __('0x000...000', 'crypto-for-woocommerce'),
                'description' => sprintf(
                    // translators: 1: Link to MetaMask Chrome extension, 2: Link to MetaMask Firefox add-on.
                    __('Wallet address to receive payments. <br><br><strong>Don’t have a wallet?</strong> Download the MetaMask extension (%1$s | %2$s), create your wallet, and start receiving payments.', 'crypto-for-woocommerce'),
                    '<a href="' . esc_url('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn') . '" target="_blank" rel="noreferrer noopener">Chrome</a>',
                    '<a href="' . esc_url('https://addons.mozilla.org/firefox/addon/ether-metamask/') . '" target="_blank" rel="noreferrer noopener">Firefox</a>'
                ),
            ];
        } else {
            // Show configured wallet information
            $wallet_address = $this->get_option('wallet_address', '');
            $this->form_fields['wallet_info'] = [
                'title' => __('Configured Wallet', 'crypto-for-woocommerce'),
                'type'  => 'title',
                'description' => sprintf(
                    // translators: %s: configured wallet address.
                    __('Wallet Address: %s', 'crypto-for-woocommerce'),
                    $wallet_address
                ),
            ];
        }
    }


    public function process_admin_options()
    {
        $saved = parent::process_admin_options();

        $errors = [];

        $enabled          = ('yes' === $this->get_option('enabled', 'no'));
        $title            = trim($this->get_option('title', ''));
        $wallet_address   = trim($this->get_option('wallet_address', ''));
        $current_api_key  = trim($this->get_option('api_key_live', ''));
        $test_mode        = (bool) $this->test_mode;

        if (empty($title)) {
            $errors[] = esc_html__('The "Title" field is required.', 'crypto-for-woocommerce');
        }

        if (!empty($wallet_address) && empty($current_api_key)) {
            $store_data = $this->register_store_with_wallet($wallet_address);
            if ($store_data && isset($store_data['apiKey']) && !empty($store_data['apiKey'])) {
                $this->update_option('api_key_live', $store_data['apiKey']);
                $this->api_key_live = $store_data['apiKey'];
                $current_api_key    = $store_data['apiKey'];

                WC_Admin_Settings::add_message(__('Store registered successfully! API Key has been automatically configured.', 'crypto-for-woocommerce'));
            } else {
                $errors[] = esc_html__('Failed to register store with the provided wallet address. Please check the wallet address and try again.', 'crypto-for-woocommerce');
            }
        }

        if ($enabled) {
            if (empty($wallet_address) && empty($current_api_key)) {
                $errors[] = esc_html__('You cannot enable this payment method without a Wallet Address or an API Key.', 'crypto-for-woocommerce');
            }

            if (!$test_mode && empty($current_api_key)) {
                $errors[] = esc_html__('You must configure the Live API Key when not in test mode.', 'crypto-for-woocommerce');
            }
        }

        if (!empty($errors)) {
            foreach ($errors as $error) {
                WC_Admin_Settings::add_error($error);
            }

            // If it was trying to be enabled, force "enabled" to "no" so it doesn't remain active with bad config
            if ($enabled) {
                $this->update_option('enabled', 'no');
            }

            return false; // Prevent confirming as a "valid" save
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
        return CFW_API_ENDPOINT;
    }
    private function current_api_key(): string
    {
        return $this->api_key_live;
    }
    private function current_secret(): string
    {
        return $this->secret_live;
    }

    private function register_store_with_wallet($wallet_address, $store_name = null, $domain = null)
    {
        if (empty($wallet_address)) {
            return false;
        }

        $store_name = $store_name ?: get_bloginfo('name');
        $domain = $domain ?: sanitize_text_field(wp_unslash($_SERVER['HTTP_HOST'] ?? 'localhost'));

        $payload = [
            'name' => $store_name,
            'domain' => $domain,
            'walletAddress' => $wallet_address
        ];

        $args = [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'body' => wp_json_encode($payload),
            'timeout' => 25,
        ];

        $response = wp_remote_post($this->current_endpoint() . '/api/v1/users/store', $args);

        if (is_wp_error($response)) {
            return false;
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (isset($body['apiKey']) && !empty($body['apiKey'])) {
            return $body;
        }

        return false;
    }

    private function has_valid_wallet(): bool
    {
        $wallet_address = $this->get_option('wallet_address', '');
        $api_key = $this->get_option('api_key_live', '');

        return !empty($wallet_address) && !empty($api_key);
    }

    public function generate_verification_token($order_id)
    {
        return hash_hmac('sha256', (string)$order_id, $this->current_secret());
    }

    public function process_payment($order_id)
    {
        $order   = wc_get_order($order_id);
        $amount  = $order->get_total();
        $currency = $order->get_currency();
        $verification_token = $this->generate_verification_token($order_id);
        $success_url = add_query_arg([
            'order_id' => $order_id,
            'verification_token'     => $verification_token,
            '_wpnonce' => wp_create_nonce('cfw_return_nonce'),
        ], WC()->api_request_url('cfw_return'));

        $webhook_url = add_query_arg([
            'order_id' => $order_id,
            'verification_token'     => $verification_token,
        ], rest_url('cfw/v1/webhook'));

        $payload = [
            'version' => CFW_VERSION,
            'platform' => 'woocommerce',
            'priceAmount'       => $amount,
            'priceCurrency'     => $currency,
            'orderId'     => (string) $order_id,
            'successUrl'   => $success_url,
            'verificationToken' => $verification_token,
            'webhookUrl' => $webhook_url,
        ];

        $args = [
            'headers' => [
                'x-api-key'   => $this->current_api_key(),
                'Content-Type'    => 'application/json',
                'Accept'          => 'application/json',
            ],
            'body'    => wp_json_encode($payload),
            'timeout' => 25,
        ];

        $response = wp_remote_post($this->current_endpoint() . '/api/v1/payments', $args);

        if (is_wp_error($response)) {
            wc_add_notice(esc_html__('Error connecting with the gateway.', 'crypto-for-woocommerce'), 'error');
            return ['result' => 'failure'];
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        $payment_url = $body['paymentUrl'] ?? '';

        if (!$payment_url) {
            wc_add_notice(__('The payment URL could not be generated.', 'crypto-for-woocommerce'), 'error');
            return ['result' => 'failure'];
        }

        $order->update_status('pending', esc_html__('Waiting for payment in Crytpo Gateway', 'crypto-for-woocommerce'));
        // Save payment URL as meta
        update_post_meta($order_id, '_cfw_payment_url', esc_url_raw($payment_url));


        return ['result' => 'success', 'redirect' => esc_url_raw($payment_url)];
    }

    public static function handle_return()
    {
        // Verify nonce for security
        if (!isset($_GET['_wpnonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'cfw_return_nonce')) {
            wp_die(esc_html__('Security check failed. Please try again.', 'crypto-for-woocommerce'));
        }

        $order_id = (int)sanitize_text_field(wp_unslash($_GET['order_id'] ?? 0));
        $hash     = isset($_GET['hash']) ? sanitize_text_field(wp_unslash($_GET['hash'])) : '';

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
            $order->add_order_note(esc_html__('Invalid return: incorrect signature.', 'crypto-for-woocommerce'));
            wp_safe_redirect($order->get_checkout_payment_url());
            exit;
        }

        $order->payment_complete();
        $order->add_order_note(esc_html__('Payment confirmed in return URL.', 'crypto-for-woocommerce'));
        wp_safe_redirect($gw->get_return_url($order));
        exit;
    }
}
