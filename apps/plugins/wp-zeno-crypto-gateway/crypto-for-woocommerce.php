<?php

/**
 * Plugin Name: Zeno Crypto Payment Gateway
 * Description: Accept Crypto Payments with Ease
 * Version: 1.0.0
 * Author: Zeno Bank
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL2
 */

if (!defined('ABSPATH')) exit;

define('CFW_PLUGIN_FILE', __FILE__);
define('CFW_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CFW_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CFW_VERSION', '1.0.0');
define('CFW_API_ENDPOINT', 'https://api.zenobank.io');


// Load WooCommerce classes and register gateway + endpoints
add_action('plugins_loaded', function () {
    if (class_exists('WooCommerce')) {

        if (!class_exists('WC_Payment_Gateway')) return;

        require_once CFW_PLUGIN_DIR . 'includes/class-cfw-gateway.php';
        require_once CFW_PLUGIN_DIR . 'includes/class-cfw-webhook.php';

        // Webhook REST
        (new CFW_Webhook())->register();

        // Return URL (?wc-api=cfw_return)
        add_action('woocommerce_api_cfw_return', ['CFW_Gateway', 'handle_return']);
    } else {
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error"><p>';
            esc_html_e('Zeno Crypto Payment Gateway requires WooCommerce to be installed and active.', 'crypto-for-woocommerce');
            echo '</p></div>';
        });

        // Desactivar el plugin
        deactivate_plugins(plugin_basename(__FILE__));
    }
}, 11);

/*Add gateway*/
add_filter('woocommerce_payment_gateways', function ($gateways) {
    $gateways[] = 'CFW_Gateway';
    return $gateways;
});

// Show the gateway only to administrators when the mode is "test".
add_filter('woocommerce_available_payment_gateways', function ($gateways) {
    // If the gateway is not registered, do nothing
    if (empty($gateways['cfw_gateway'])) {
        return $gateways;
    }

    // Don't hide anything in the admin (to be able to test from the backend)
    if (is_admin() && !wp_doing_ajax()) {
        return $gateways;
    }

    // Get the mode directly from the option saved by WooCommerce
    $opts = get_option('woocommerce_cfw_gateway_settings', []);
    $mode = isset($opts['mode']) ? $opts['mode'] : 'test';

    // If it's in test and the user is not an admin, hide the gateway
    if ($mode === 'test' && ! current_user_can('manage_options')) {
        unset($gateways['cfw_gateway']);
    }

    return $gateways;
}, 20);

add_action('woocommerce_blocks_loaded', function () {
    if (class_exists('\Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType')) {
        require_once CFW_PLUGIN_DIR . 'includes/class-cfw-blocks.php';

        add_action(
            'woocommerce_blocks_payment_method_type_registration',
            function (Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry) {
                $payment_method_registry->register(new CFW_Blocks_Gateway());
            }
        );
    }
});

add_action('before_woocommerce_init', function () {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'cart_checkout_blocks',
            __FILE__,
            true
        );
    }
});



// Generate secrets automatically when the plugin is activated
register_activation_hook(__FILE__, function () {
    $option_key = 'woocommerce_cfw_gateway_settings';
    $settings   = get_option($option_key, []);

    // Generate secrets if they don't exist
    if (empty($settings['secret_test'])) {
        $settings['secret_test'] = wp_generate_password(32, false, false);
    }
    if (empty($settings['secret_live'])) {
        $settings['secret_live'] = wp_generate_password(32, false, false);
    }

    update_option($option_key, $settings);
});

add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'zeno_gateway_action_links');

function zeno_gateway_action_links($links)
{
    $settings_link = '<a href="' . admin_url('admin.php?page=wc-settings&tab=checkout&section=cfw_gateway') . '">'
        . __('Settings', 'crypto-for-woocommerce') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}
