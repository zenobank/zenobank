<?php

/**
 * Plugin Name: Remove Checkout Fields
 * Plugin URI: https://zenobank.com
 * Description: Elimina los campos del checkout de WooCommerce y los reemplaza con valores predefinidos. El usuario solo puede hacer clic en "Place Order".
 * Version: 1.0.0
 * Author: Zenobank
 * Author URI: https://zenobank.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: remove-checkout-fields
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Verificar que WooCommerce esté activo
add_action('admin_init', 'check_woocommerce_active');
function check_woocommerce_active()
{
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', 'woocommerce_missing_notice');
    }
}

function woocommerce_missing_notice()
{
    echo '<div class="error"><p><strong>Remove Checkout Fields</strong> requiere que WooCommerce esté instalado y activo.</p></div>';
}

class RemoveCheckoutFields
{

    public function __construct()
    {
        add_action('init', array($this, 'init'));
    }

    public function init()
    {
        // Solo ejecutar en el frontend
        if (is_admin()) {
            return;
        }

        // Eliminar campos del checkout
        add_action('woocommerce_checkout_init', array($this, 'remove_checkout_fields'), 10);

        // Establecer valores predefinidos
        add_filter('woocommerce_checkout_get_value', array($this, 'set_default_checkout_values'), 10, 2);

        // Ocultar campos específicos con CSS
        add_action('wp_head', array($this, 'hide_checkout_fields_css'));

        // Validar que los campos requeridos estén presentes
        add_action('woocommerce_checkout_process', array($this, 'validate_required_fields'));
    }

    /**
     * Eliminar campos del checkout
     */
    public function remove_checkout_fields($checkout)
    {
        // Campos de facturación
        unset($checkout->checkout_fields['billing']['billing_first_name']);
        unset($checkout->checkout_fields['billing']['billing_last_name']);
        unset($checkout->checkout_fields['billing']['billing_company']);
        unset($checkout->checkout_fields['billing']['billing_address_1']);
        unset($checkout->checkout_fields['billing']['billing_address_2']);
        unset($checkout->checkout_fields['billing']['billing_city']);
        unset($checkout->checkout_fields['billing']['billing_postcode']);
        unset($checkout->checkout_fields['billing']['billing_country']);
        unset($checkout->checkout_fields['billing']['billing_state']);
        unset($checkout->checkout_fields['billing']['billing_phone']);
        unset($checkout->checkout_fields['billing']['billing_email']);

        // Campos de envío
        unset($checkout->checkout_fields['shipping']['shipping_first_name']);
        unset($checkout->checkout_fields['shipping']['shipping_last_name']);
        unset($checkout->checkout_fields['shipping']['shipping_company']);
        unset($checkout->checkout_fields['shipping']['shipping_address_1']);
        unset($checkout->checkout_fields['shipping']['shipping_address_2']);
        unset($checkout->checkout_fields['shipping']['shipping_city']);
        unset($checkout->checkout_fields['shipping']['shipping_postcode']);
        unset($checkout->checkout_fields['shipping']['shipping_country']);
        unset($checkout->checkout_fields['shipping']['shipping_state']);

        // Campos adicionales
        unset($checkout->checkout_fields['order']['order_comments']);
    }

    /**
     * Establecer valores predefinidos para los campos
     */
    public function set_default_checkout_values($value, $input)
    {
        // Valores predefinidos
        $default_values = array(
            'billing_first_name' => 'Usuario',
            'billing_last_name' => 'Zenobank',
            'billing_company' => 'Zenobank',
            'billing_address_1' => 'Calle Principal 123',
            'billing_address_2' => '',
            'billing_city' => 'Madrid',
            'billing_postcode' => '28001',
            'billing_country' => 'ES',
            'billing_state' => 'M',
            'billing_phone' => '+34 900 123 456',
            'billing_email' => 'usuario@zenobank.com',

            'shipping_first_name' => 'Usuario',
            'shipping_last_name' => 'Zenobank',
            'shipping_company' => 'Zenobank',
            'shipping_address_1' => 'Calle Principal 123',
            'shipping_address_2' => '',
            'shipping_city' => 'Madrid',
            'shipping_postcode' => '28001',
            'shipping_country' => 'ES',
            'shipping_state' => 'M',

            'order_comments' => 'Pedido procesado automáticamente'
        );

        if (isset($default_values[$input])) {
            return $default_values[$input];
        }

        return $value;
    }

    /**
     * Ocultar campos con CSS
     */
    public function hide_checkout_fields_css()
    {
        if (is_checkout()) {
            echo '<style>
                .woocommerce-billing-fields,
                .woocommerce-shipping-fields,
                .woocommerce-additional-fields,
                #billing_first_name_field,
                #billing_last_name_field,
                #billing_company_field,
                #billing_address_1_field,
                #billing_address_2_field,
                #billing_city_field,
                #billing_postcode_field,
                #billing_country_field,
                #billing_state_field,
                #billing_phone_field,
                #billing_email_field,
                #shipping_first_name_field,
                #shipping_last_name_field,
                #shipping_company_field,
                #shipping_address_1_field,
                #shipping_address_2_field,
                #shipping_city_field,
                #shipping_postcode_field,
                #shipping_country_field,
                #shipping_state_field,
                #order_comments_field {
                    display: none !important;
                }
                
                .woocommerce-checkout-review-order-table {
                    margin-top: 20px;
                }
                
                .woocommerce-checkout .woocommerce-form-coupon-toggle {
                    display: none !important;
                }
                
                .woocommerce-checkout .checkout_coupon {
                    display: none !important;
                }
            </style>';
        }
    }

    /**
     * Validar campos requeridos
     */
    public function validate_required_fields()
    {
        // Establecer valores automáticamente antes de la validación
        $_POST['billing_first_name'] = 'Usuario';
        $_POST['billing_last_name'] = 'Zenobank';
        $_POST['billing_company'] = 'Zenobank';
        $_POST['billing_address_1'] = 'Calle Principal 123';
        $_POST['billing_address_2'] = '';
        $_POST['billing_city'] = 'Madrid';
        $_POST['billing_postcode'] = '28001';
        $_POST['billing_country'] = 'ES';
        $_POST['billing_state'] = 'M';
        $_POST['billing_phone'] = '+34 900 123 456';
        $_POST['billing_email'] = 'usuario@zenobank.com';

        $_POST['shipping_first_name'] = 'Usuario';
        $_POST['shipping_last_name'] = 'Zenobank';
        $_POST['shipping_company'] = 'Zenobank';
        $_POST['shipping_address_1'] = 'Calle Principal 123';
        $_POST['shipping_address_2'] = '';
        $_POST['shipping_city'] = 'Madrid';
        $_POST['shipping_postcode'] = '28001';
        $_POST['shipping_country'] = 'ES';
        $_POST['shipping_state'] = 'M';

        $_POST['order_comments'] = 'Pedido procesado automáticamente';
    }
}

// Inicializar el plugin
new RemoveCheckoutFields();

// Hook de activación
register_activation_hook(__FILE__, 'remove_checkout_fields_activate');
function remove_checkout_fields_activate()
{
    // Verificar que WooCommerce esté activo
    if (!class_exists('WooCommerce')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die('Este plugin requiere WooCommerce para funcionar.');
    }
}

// Hook de desactivación
register_deactivation_hook(__FILE__, 'remove_checkout_fields_deactivate');
function remove_checkout_fields_deactivate()
{
    // Limpiar cualquier configuración si es necesario
}
