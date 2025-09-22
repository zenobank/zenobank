<?php
if (!defined('ABSPATH')) exit;

class CFW_Webhook
{

    public function register()
    {
        add_action('rest_api_init', function () {
            register_rest_route('cfw/v1', '/webhook', [
                'methods'  => 'POST',
                'callback' => [$this, 'handle'],
                'permission_callback' => '__return_true',
            ]);
        });
    }

    public function handle(WP_REST_Request $request)
    {
        $data      = $request->get_json_params() ?: [];
        $order_id  = intval($data['order_id'] ?? $request->get_param('order_id') ?? 0);
        $status    = sanitize_text_field($data['status'] ?? $request->get_param('status') ?? '');

        // Read the verification_token from request (body or query)
        $received_token = sanitize_text_field(
            $data['verification_token'] ?? $request->get_param('verification_token') ?? ''
        );
        $gateways = WC()->payment_gateways()->payment_gateways();
        $gw = $gateways['cfw_gateway'] ?? null;

        if (! $gw instanceof CFW_Gateway) {
            return new WP_REST_Response(['ok' => false, 'error' => 'Gateway not available'], 500);
        }

        $expected_token = $gw->generate_verification_token($order_id);

        // Validate token: if missing or invalid, exit early without doing anything
        if (! $order_id || ! $received_token || ! hash_equals($expected_token, $received_token)) {
            // Optional: you may log invalid attempts here
            // return new WP_REST_Response(['ok' => true], 200);
            return new WP_REST_Response(['ok' => false], 403);
        }

        // Token is valid: process the order status update
        if ($order_id && ($order = wc_get_order($order_id))) {
            if ($status === 'COMPLETED') {
                $order->payment_complete($data['transaction_id'] ?? '');
                $order->add_order_note(__('Payment confirmed via webhook.', 'crypto-for-woocommerce'));
            } else {
                $order->update_status('failed', __('Payment failed via webhook.', 'crypto-for-woocommerce'));
            }
        }

        return [
            'ok' => true,
            'order_id' => $order_id,
            'status' => $status,
            'received_token' => $received_token,
            'expected_token' => $expected_token,
            'order' => $order,
        ];
    }
}
