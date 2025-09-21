<?php
if (! defined('ABSPATH')) exit;

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

class CFW_Blocks_Gateway extends AbstractPaymentMethodType
{
    protected $name = 'cfw_gateway'; // Debe coincidir con $this->id de tu gateway

    public function initialize()
    {
        $this->settings = get_option('woocommerce_' . $this->name . '_settings', []);
    }

    public function get_name()
    {
        return $this->name;
    }

    public function is_active()
    {
        $enabled = isset($this->settings['enabled']) ? $this->settings['enabled'] : 'no';
        $mode    = isset($this->settings['mode']) ? $this->settings['mode'] : 'test';

        if ($enabled !== 'yes') {
            return false;
        }

        if ($mode === 'test' && ! current_user_can('manage_options')) {
            return false;
        }

        return true;
    }
    public function get_payment_method_script_handles()
    {
        $asset_path = plugin_dir_path(dirname(__FILE__)) . 'build/index.asset.php';
        $asset      = file_exists($asset_path) ? require $asset_path : [
            'dependencies' => [],
            'version'      => CFW_VERSION,
        ];

        wp_register_script(
            'wc-cfw-blocks-integration',
            plugin_dir_url(dirname(__DIR__)) . 'build/index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        return ['wc-cfw-blocks-integration'];
    }

    public function get_payment_method_data()
    {
        return [
            'id'          => $this->name,
            'title'       => $this->settings['title'] ?? __('Crypto Gateway', 'crypto-for-woocommerce'),
            'description' => $this->settings['description'] ?? '',
            'supports'    => ['products'],
        ];
    }
}
