<?php
if (!defined('ABSPATH')) exit;

class CFW_Webhook {

    public function register() {
        add_action('rest_api_init', function () {
            register_rest_route('cfw/v1', '/webhook', [
                'methods'  => 'POST',
                'callback' => [$this, 'handle'],
                'permission_callback' => '__return_true',
            ]);
        });
    }

    public function handle(WP_REST_Request $request) {
        $data = $request->get_json_params();
        $order_id = intval($data['order_id'] ?? 0);
        $status   = sanitize_text_field($data['status'] ?? '');

        if ($order_id && ($order = wc_get_order($order_id))) {
            if ($status === 'succeeded') {
                $order->payment_complete($data['transaction_id'] ?? '');
                $order->add_order_note(__('Pago confirmado por webhook.', 'crypto-for-woocommerce'));
            } elseif ($status === 'failed') {
                $order->update_status('failed', __('Pago fallido por webhook.', 'crypto-for-woocommerce'));
            }
        }
        return ['ok' => true];
    }
}
