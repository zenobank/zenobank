<?php

/**
 * Plugin Name: ABC Crypto Checkout
 * Plugin URI: https://wordpress.org/plugins/payerurl-crypto-currency-payment-gateway-for-woocommerce/
 * Author: payerurl team
 * Author URI: https://payerurl.com
 * Description: ABC Crypto Checkout is a cryptocurrency payment processor that allows customers to transfer crypto payments directly to the merchant wallet. Merchants can integrate the Binance Pay API, and also can add USDT TRC20, USDT ERC20, ETH ERC20, Bitcoin BTC, TON, USDC ERC20 receiving wallets.
 * Version:1.7.5
 * License: GPLv3
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: ABC-crypto-currency-payment-gateway-for-wooCommerce
 * Domain Path: https://payerurl.com
 * Requires Plugins: woocommerce
 * WC requires at least: 5.5
 * WC tested up to: 9.9.5
 */


if (!defined('WPINC')) die("Direct Access Not Allowed");
if (!class_exists('Payerurl')) {
    final class Payerurl
    {
        const version = "1.7.5";
        protected static $_instance = NULL;
        private $valid_currencies = [];

        private function __construct()
        {
        }

        public static function getInstance()
        {
            if (is_null(self::$_instance))
                self::$_instance = new self;
            return self::$_instance;
        }

        private function define_constant()
        {
            if (!defined('PAYERURL'))
                define('PAYERURL', 'https://api-v2.payerurl.com/api');
            if (!defined('PAYERURL_VERSION')) define('PAYERURL_VERSION', self::version);
            if (!defined('PAYERURL_FILE')) define('PAYERURL_FILE', __FILE__);
            if (!defined('PAYERURL_DIR')) define('PAYERURL_DIR', __DIR__);
            if (!defined('PAYERURL_URL')) define('PAYERURL_URL', plugin_dir_url(PAYERURL_FILE));
            if (!defined('PAYERURL_ID')) define('PAYERURL_ID', 'wc_payerurl_gateway');
        }

        public function init()
        {
            $this->define_constant();

            if (!count($this->valid_currencies)) {
                $this->valid_currencies = payerurl_get_valid_currencies();
            }

            add_filter(
                'plugin_action_links_' . plugin_basename(PAYERURL_FILE),
                array($this, 'plugin_action_links')
            );
            add_action('plugins_loaded', array($this, "plugins_loaded"));
        }

        public function admin_init()
        {
            $this->show_admin_notices();
        }

        public function plugins_loaded()
        {
            add_action('admin_init', array($this, 'admin_init'));

            if ($this->is_valid_for_use()) {
                $this->payment_gateway_init();
            } else {
                return;
            }

            add_action('init', array($this, 'load_plugin_textdomain'));

            if (!is_admin()) {
                add_action('init', array($this, 'frontend_init'));
            } else {
                add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
            }

            if (is_admin() && defined("DOING_AJAX") && DOING_AJAX) {
                add_action('wp_ajax_test_api_creds', array($this, "testApiCreds"));
            }

            add_action('before_woocommerce_init', array($this, 'payerurl_woocommerce_hpos_init'));
        }

        public function load_plugin_textdomain()
        {
            $locale = determine_locale();
            $locale = apply_filters('plugin_locale', $locale, 'ABC-crypto-currency-payment-gateway-for-wooCommerce');
            unload_textdomain('ABC-crypto-currency-payment-gateway-for-wooCommerce');
            load_textdomain(
                'ABC-crypto-currency-payment-gateway-for-wooCommerce',
                WP_LANG_DIR . "/ABC-crypto-currency-payment-gateway-for-wooCommerce/ABC-crypto-currency-payment-gateway-for-wooCommerce-$locale.mo"
            );
            load_plugin_textdomain(
                'ABC-crypto-currency-payment-gateway-for-wooCommerce',
                false,
                PAYERURL_DIR . '/languages/'
            );
        }

        public function woocommerce_add_payerurl_gateway($methods)
        {
            if ($this->is_valid_for_use()) {
                $methods[] = 'WC_Payerurl';
            }
            return $methods;
        }

        public function payerurl_woocommerce_hpos_init()
        {
            if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) { 
                \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true ); 
            }
        }

        /**
         * Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry
         */
        public static function woocommerce_payerurl_block_support()
        {
            if (function_exists('woocommerce_store_api_register_update_callback')) {
                woocommerce_store_api_register_update_callback([
                    'namespace' => 'payerurl-payment-blocks',
                    'callback' => function ($data) {
                        if (isset($data['payment_method'])) {
                            WC()->session->set('chosen_payment_method', $data['payment_method']);
                        }
                        WC()->cart->calculate_totals();
                    },
                ]);
            }

            if (class_exists('Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType')) {
                add_action(
                    'woocommerce_blocks_payment_method_type_registration',
                    function ($payment_method_registry) {
                        $payment_method_registry->register(new WC_Gateway_Payerurl_Blocks_Support());
                    }
                );
            }
        }

        public function plugin_action_links($links)
        {
            $action_links = array(
                'settings' => sprintf(
                    '<a href="%s" aria-label="%s">%s</a>',
                    admin_url('admin.php?page=wc-settings&tab=checkout&section=wc_payerurl_gateway'),
                    __('View settings', 'ABC-crypto-currency-payment-gateway-for-wooCommerce'),
                    __('Settings', 'ABC-crypto-currency-payment-gateway-for-wooCommerce')
                ),
            );
            return array_merge($action_links, $links);
        }

        public function admin_enqueue_scripts()
        {
            wp_enqueue_media();
            if (
                !isset($_GET['page']) ||
                $_GET['page'] != 'wc-settings' ||
                !isset($_GET['section']) ||
                $_GET['section'] != 'wc_payerurl_gateway'
            ) return;

            $file = PAYERURL_DIR . '/assets/js/payerurl-admin-payment-settings.js';
            if (!file_exists($file)) return;

            wp_enqueue_script(
                "payerurl-admin-payment-settings-js",
                PAYERURL_URL . "assets/js/payerurl-admin-payment-settings.js",
                array('jquery', 'wp-util'),
                filemtime($file),
                true
            );
            wp_localize_script(
                "payerurl-admin-payment-settings-js",
                "payerur_obj",
                [
                    'nonce' => wp_create_nonce('payerurl-admin-nonce'),
                    'api_url' => PAYERURL . '/save-company-logo',
                    'user' => $this->getGatewayObj()->payerurl_public_key
                ]
            );
        }

        public function testApiCreds()
        {
            $payerurl_gateway = $this->getGatewayObj();
            return $payerurl_gateway->testApiCreds();
        }

        public function frontend_init()
        {
            $payerurl = $this->getGatewayObj();
            add_action('woocommerce_cart_calculate_fees', array($payerurl, 'add_payerurl_fee'));
            add_action('woocommerce_cart_calculate_fees', array($payerurl, 'add_payerurl_discount'));

            $file = PAYERURL_DIR . '/assets/js/payerurl-checkout.js';
            if (!file_exists($file)) return;

            wp_enqueue_script(
                "payerurl-checkout-js",
                PAYERURL_URL . "assets/js/payerurl-checkout.js",
                array('jquery'),
                filemtime($file),
                true
            );
        }

        public function is_valid_for_use()
        {
            return $this->is_woocommerce_active() && $this->is_currency_valid();
        }

        public function woocommerce_required_notice()
        {
            echo sprintf(
                '<div class="error"><p>%s</p></div>',
                __(
                    'ABC Crypto Checkout plugin requires woocommerce plugin, Please make sure it is installed and activated.',
                    'ABC-crypto-currency-payment-gateway-for-wooCommerce'
                )
            );
        }

        public function woocommerce_currency_notice()
        {
            echo sprintf(
                '<div class="error"><p>%s</p></div>',
                __(
                    'Your shop currency ' . get_woocommerce_currency() . ' is not supported by ABC Crypto Checkout plugin',
                    'ABC-crypto-currency-payment-gateway-for-wooCommerce'
                )
            );
        }

        private function getGatewayObj()
        {
            return WC()->payment_gateways->payment_gateways()[PAYERURL_ID];
        }

        private function payment_gateway_init()
        {
            include_once 'class-payerurl-gateway.php';
            include_once 'class-payerurl-gateway-blocks.php';
            add_filter('woocommerce_payment_gateways', array($this, 'woocommerce_add_payerurl_gateway'));
            add_action('woocommerce_blocks_loaded', array($this, 'woocommerce_payerurl_block_support'));
        }

        private function show_admin_notices()
        {
            if (!$this->is_woocommerce_active()) {
                add_action('admin_notices', array($this, 'woocommerce_required_notice'));
                return;
            }

            if (!$this->is_currency_valid()) {
                add_action('admin_notices', array($this, 'woocommerce_currency_notice'));
            }
        }

        private function is_woocommerce_active()
        {
            return class_exists('WC_Payment_Gateway', false);
        }

        private function is_currency_valid()
        {
            return in_array(get_woocommerce_currency(), $this->valid_currencies, true);
        }
    }
}

if (!function_exists('get_valid_currencies')) {
    function payerurl_get_valid_currencies()
    {
        return [
            "USD", "AED", "ARS", "AUD", "BHD", "BRL", "CAD", "COP", "CLP", "CNY", "CZK", "EUR", "GBP", "HKD", "IDR", "INR", "JPY", "KRW", "KWD", "LKR", "MMK", "MXN", "MYR", "NGN", "PHP", "PKR", "PLN", "PYG", "RUB", "SAR", "SEK", "SGD", "THB", "TRY", "TWD", "UAH", "VND", "ZAR", "BTC", "ETH", "LTC", "BCH", "BNB", "XRP", "XLM", "DOT", "XDR", "EOS", "LINK", "YFI", "XAG", "XAU", "BITS", "SATS", "USDT", "FJD", "LVL", "SCR", "CDF", "BBD", "HNL", "UGX", "SDG", "IQD", "GMD", "FKP", "XOF", "GNF", "MZN", "QAR", "IRR", "LYD", "ISK", "PAB", "CHF", "HRK", "DJF", "KYD", "SHP", "TJS", "DKK", "BGN", "ZWL", "HTG", "KZT", "AFN", "HUF", "BIF", "NAD", "SKK", "TMM", "GTQ", "TND", "SLL", "DOP", "MAD", "PGK", "ERN", "BMD", "ETB", "SOS", "LAK", "BND", "BOB", "MDL", "AMD", "LBP", "RON", "CRC", "TTD", "NIO", "PNG", "CUC", "BSD", "CUP", "RSD", "UYU", "OMR", "KES", "BTN", "SVC", "UZS", "MKD", "DZD", "LIT", "XAF", "TZS", "KHR", "BWP", "RWF", "NOK", "SYP", "XCD", "SZL", "YER", "NPR", "MNT", "BYR", "BZD", "MOP", "KMF", "GEL", "AZN", "UAH", "MRU", "JMD", "GGP", "VEF", "LRD", "MTL", "VES", "ZMW", "ILS", "ILV", "GHS", "KPW", "JOD", "GUSD", "LSL", "EEK", "MUR", "IMP", "GIP", "LTL", "MVR", "SBD", "MWK", "EGP", "NZD"
        ];
    }
}

if (!function_exists('payerurl')) {
    function payerurl()
    {
        $payerurl = Payerurl::getInstance();
        $payerurl->init();
        return $payerurl;
    }
}

$GLOBALS['payerurl'] = payerurl();
