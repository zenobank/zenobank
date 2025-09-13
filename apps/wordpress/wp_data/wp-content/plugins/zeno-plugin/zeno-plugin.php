<?php
/*
Plugin Name: WooCommerce Crypto Name Gateway
Plugin URI: https://example.com
Description: Extiende WooCommerce con un gateway de pago cripto que redirige al checkout externo.
Version: 1.0.0
Author: Tú
Author URI: https://example.com
Text Domain: wc-gateway-name
License: GNU General Public License v3.0
License URI: http://www.gnu.org/licenses/gpl-3.0.html
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'plugins_loaded', 'woocommerce_gateway_name_init', 0 );

function woocommerce_gateway_name_init() {
    if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
        return;
    }

    // Cargar traducciones
    load_plugin_textdomain( 'wc-gateway-name', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );

    class WC_Gateway_Name extends WC_Payment_Gateway {

        public function __construct() {
            $this->id                 = 'wc_gateway_name';                   // slug único
            $this->method_title       = __( 'Crypto Name', 'wc-gateway-name' );
            $this->method_description = __( 'Procesa pagos en cripto redirigiendo a una URL de pago proporcionada por tu backend.', 'wc-gateway-name' );
            $this->icon               = '';                                   // opcional: URL de icono
            $this->has_fields         = false;                                // no mostramos campos extra en checkout
            $this->supports           = array( 'products' );

            // Cargar campos de ajustes y valores guardados
            $this->init_form_fields();
            $this->init_settings();

            $this->title        = $this->get_option( 'title' );
            $this->description  = $this->get_option( 'description' );
            $this->enabled      = $this->get_option( 'enabled' );
            $this->api_endpoint = trailingslashit( $this->get_option( 'api_endpoint' ) );
            $this->api_key      = $this->get_option( 'api_key' );
            $this->timeout      = absint( $this->get_option( 'timeout', 20 ) );

            // Guardar ajustes
            add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );

            // (Opcional) endpoint para webhooks futuros: https://tusitio.com/?wc-api=wc_gateway_name
            add_action( 'woocommerce_api_' . $this->id, array( $this, 'handle_webhook' ) );
        }

        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __( 'Activar/Desactivar', 'wc-gateway-name' ),
                    'type'    => 'checkbox',
                    'label'   => __( 'Activar Crypto Name', 'wc-gateway-name' ),
                    'default' => 'no',
                ),
                'title' => array(
                    'title'       => __( 'Título', 'wc-gateway-name' ),
                    'type'        => 'text',
                    'description' => __( 'Lo que ve el cliente en el checkout.', 'wc-gateway-name' ),
                    'default'     => __( 'Pagar con Cripto (Crypto Name)', 'wc-gateway-name' ),
                ),
                'description' => array(
                    'title'       => __( 'Descripción', 'wc-gateway-name' ),
                    'type'        => 'textarea',
                    'description' => __( 'Texto bajo el método de pago en el checkout.', 'wc-gateway-name' ),
                    'default'     => __( 'Serás redirigido a nuestra pasarela de pago cripto segura.', 'wc-gateway-name' ),
                ),
                'api_endpoint' => array(
                    'title'       => __( 'Endpoint del backend', 'wc-gateway-name' ),
                    'type'        => 'text',
                    'description' => __( 'URL de tu backend que crea la sesión de pago. Ej: https://api.tusitio.com/payments/create', 'wc-gateway-name' ),
                    'default'     => '',
                    'desc_tip'    => true,
                ),
                'api_key' => array(
                    'title'       => __( 'API Key', 'wc-gateway-name' ),
                    'type'        => 'password',
                    'description' => __( 'Clave para autenticar la request al backend (si aplica).', 'wc-gateway-name' ),
                    'default'     => '',
                    'desc_tip'    => true,
                ),
                'timeout' => array(
                    'title'       => __( 'Timeout (segundos)', 'wc-gateway-name' ),
                    'type'        => 'number',
                    'description' => __( 'Tiempo máximo de espera para la respuesta del backend.', 'wc-gateway-name' ),
                    'default'     => 20,
                    'desc_tip'    => true,
                ),
            );
        }

        public function payment_fields() {
            if ( $this->description ) {
                echo wpautop( wp_kses_post( $this->description ) );
            }
        }

        /**
         * Paso crítico: al confirmar el pedido, pedimos la URL de pago a tu backend y redirigimos allí.
         */
        public function process_payment( $order_id ) {
            $order = wc_get_order( $order_id );

            // Monto y moneda según WooCommerce
            $amount   = (float) $order->get_total();
            $currency = $order->get_currency();

            // URLs útiles para tu backend
            $return_url  = $this->get_return_url( $order ); // Gracias/éxito
            $cancel_url  = wc_get_checkout_url();           // Vuelta al checkout si cancela
            $callback_url = WC()->api_request_url( $this->id ); // Webhook (opcional/futuro)

            // Construimos el payload para tu backend
            $body = array(
                'order_id'     => (string) $order->get_id(),
                'amount'       => $amount,
                'currency'     => $currency,
                'customer_email' => $order->get_billing_email(),
                'return_url'   => $return_url,
                'cancel_url'   => $cancel_url,
                'callback_url' => $callback_url,
                // Puedes añadir más metadatos si quieres
                'metadata'     => array(
                    'site'      => get_bloginfo( 'name' ),
                    'order_key' => $order->get_order_key(),
                ),
            );

            // Headers para autenticar la request (ajústalo a tu backend)
            $headers = array(
                'Content-Type'  => 'application/json',
            );
            if ( ! empty( $this->api_key ) ) {
                $headers['Authorization'] = 'Bearer ' . $this->api_key;
            }

            // Llamada al backend
            $response = wp_remote_post(
                $this->api_endpoint,
                array(
                    'headers' => $headers,
                    'body'    => wp_json_encode( $body ),
                    'timeout' => $this->timeout,
                )
            );

            // Manejo de errores de transporte
            if ( is_wp_error( $response ) ) {
                wc_add_notice(
                    __( 'No se pudo iniciar el pago. Intenta de nuevo o usa otro método.', 'wc-gateway-name' ),
                    'error'
                );
                wc_get_logger()->error( 'WC_Gateway_Name error: ' . $response->get_error_message(), array( 'source' => $this->id ) );
                return array( 'result' => 'fail' );
            }

            $code = wp_remote_retrieve_response_code( $response );
            $body = json_decode( wp_remote_retrieve_body( $response ), true );

            if ( $code < 200 || $code >= 300 || empty( $body['payment_url'] ) ) {
                wc_add_notice(
                    __( 'El servicio de pago no devolvió una URL válida.', 'wc-gateway-name' ),
                    'error'
                );
                wc_get_logger()->error(
                    'WC_Gateway_Name respuesta inválida: ' . print_r( array( 'code' => $code, 'body' => $body ), true ),
                    array( 'source' => $this->id )
                );
                return array( 'result' => 'fail' );
            }

            $payment_url = esc_url_raw( $body['payment_url'] );

            // Marcar el pedido como "pendiente" (no pagado aún)
            $order->update_status( 'pending', __( 'Redirigido a la pasarela cripto.', 'wc-gateway-name' ) );

            // Vaciar el carrito y devolver redirección
            WC()->cart->empty_cart();

            return array(
                'result'   => 'success',
                'redirect' => $payment_url,
            );
        }

        /**
         * (Opcional) Manejo de webhook/callback de tu backend.
         * Por ahora no hace nada; queda listo por si lo necesitas.
         */
        public function handle_webhook() {
            status_header( 200 );
            echo 'OK';
            exit;
        }
    }

    // Registrar el gateway
    function woocommerce_add_gateway_name_gateway( $methods ) {
        $methods[] = 'WC_Gateway_Name';
        return $methods;
    }
    add_filter( 'woocommerce_payment_gateways', 'woocommerce_add_gateway_name_gateway' );
}