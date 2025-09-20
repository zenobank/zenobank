<?php
if ( ! defined( 'ABSPATH' ) ) exit;

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

class CFW_Blocks_Gateway extends AbstractPaymentMethodType {
    protected $name = 'cfw_gateway'; // Debe coincidir con $this->id de tu gateway

    public function initialize() {
        $this->settings = get_option( 'woocommerce_' . $this->name . '_settings', [] );
    }

    public function is_active() {
         $enabled = isset( $this->settings['enabled'] ) ? $this->settings['enabled'] : 'no';
        $mode    = isset( $this->settings['mode'] ) ? $this->settings['mode'] : 'test';

        // Desactivar si no está habilitado
        if ( $enabled !== 'yes' ) {
            return false;
        }

        // Si está en test y no es administrador -> ocultar
        if ( $mode === 'test' && ! current_user_can( 'manage_options' ) ) {
            return false;
        }

        return true;
    }

    public function get_payment_method_data() {
        return [
            'title'       => $this->settings['title'] ?? __( 'Crytpo Gateway', 'crypto-for-woocommerce' ),
            'description' => $this->settings['description'] ?? '',
        ];
    }
}
