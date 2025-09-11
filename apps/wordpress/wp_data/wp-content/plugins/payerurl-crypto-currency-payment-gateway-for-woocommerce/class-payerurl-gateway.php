<?php

if (!defined('ABSPATH')) exit;

if (!class_exists("WC_Payerurl")) {

    final class WC_Payerurl extends WC_Payment_Gateway
    {
        public $paymentURL = PAYERURL . '/payment';
        public $apiVerifyURL = PAYERURL . '/api-secret-key-validation';
        public $enable_log = false;
        public $payerurl_public_key = '';
        public $payerurl_secret_key = '';
        public $enable_fee_cart = 'no';
        public $payerurl_fee_title = '';
        public $payerurl_fee_type = 'percentage';
        public $payerurl_fee_amount = 0;
        public $enable_discount_cart = '';
        public $payerurl_discount_title = '';
        public $payerurl_discount_type = 'percentage';
        public $payerurl_discount_amount = 0;
        public $after_payment_order_status = 'wc-processing';
        public static $logger = null;

        public function __construct()
        {
            $this->id = PAYERURL_ID;
            $this->icon = PAYERURL_URL . 'assets/images/coin_high.png';
            $this->method_title = 'Payerurl';
            $this->method_description = '<span>ABC Crypto Checkout support all fiat currencies<br>Fast, secure and low cost <br><br><span style="color: blue;">Get your public key and Secret key &nbsp;<a href="https://dash.payerurl.com/register" target="_blank">Click here</a></span></span>';
            $this->has_fields = false;
            $this->title = $this->get_option('title');
            $this->description = $this->get_option('description');
            $this->order_button_text = __('Proceed to Payerurl', 'ABC-crypto-currency-payment-gateway-for-wooCommerce');
            $this->supports = array(
                'products',
                'subscriptions',
                'subscription_cancellation',
                'subscription_suspension',
                'subscription_reactivation',
                'subscription_amount_changes',
                'subscription_date_changes',
                'multiple_subscriptions'
            );

            $this->init_form_fields();
            $this->init_settings();

            $this->enable_log = $this->get_option('enable_log', false);
            $this->payerurl_public_key = sanitize_text_field($this->get_option('payerurl_public_key', ''));
            $this->payerurl_secret_key = sanitize_text_field($this->get_option('payerurl_secret_key', ''));
            $this->enable_fee_cart = $this->get_option('enable_fee_cart', 'no');
            $this->payerurl_fee_title = $this->get_option('payerurl_fee_title', '');
            $this->payerurl_fee_type = $this->get_option('payerurl_fee_type', 'percentage');
            $this->payerurl_fee_amount = $this->get_option('payerurl_fee_amount', 0);
            $this->enable_discount_cart = $this->get_option('enable_discount_cart', 'no');
            $this->payerurl_discount_title = $this->get_option('payerurl_discount_title', '');
            $this->payerurl_discount_type = $this->get_option('payerurl_discount_type', 'percentage');
            $this->payerurl_discount_amount = $this->get_option('payerurl_discount_amount', 0);
            $this->after_payment_order_status = $this->get_option('after_payment_order_status', 'wc-processing');

            if (empty(self::$logger)) self::$logger = wc_get_logger();

            if (is_admin()) {
                add_action(
                    'woocommerce_update_options_payment_gateways_' . $this->id,
                    array($this, 'process_admin_options')
                );
            }

            add_action('woocommerce_api_wc_payerurl', array($this, 'payerurl_response'));
            add_filter('woocommerce_payment_complete_order_status', array($this, 'payment_complete_order_status'), 99, 1);
        }

        public function init_form_fields()
        {
            $this->form_fields = include 'admin-form-fields.php';
        }

        public function process_admin_options()
        {
            return parent::process_admin_options();
        }

        public function payment_complete_order_status($status)
        {
            if (!empty($this->after_payment_order_status)) {
                $status = str_replace('wc-', '', $this->after_payment_order_status);
            }

            return $status;
        }

        public function add_payerurl_fee($cart)
        {
            $session = WC()->session->get('chosen_payment_method');

            if (empty($session) || $session != strval(PAYERURL_ID)) return;

            $is_enable_cart = $this->enable_fee_cart;
            if ($is_enable_cart == 'no' && is_cart()) return;

            $amount = (float)$this->payerurl_fee_amount;
            if (empty($amount) || !is_numeric($amount) || $amount <= 0) return;

            $type = $this->payerurl_fee_type;
            switch ($type) {
                case "percentage":
                    $fee = ($cart->get_cart_contents_total() + $cart->get_shipping_total()) * ($amount / 100);
                    break;
                case "fixed":
                    $fee = $amount;
                    break;
                default:
                    return;
            }

            $title = $this->payerurl_fee_title;
            $cart->add_fee($title, $fee, false);
        }

        public function add_payerurl_discount($cart)
        {
            $session = WC()->session->get('chosen_payment_method');

            if (empty($session) || $session != strval(PAYERURL_ID)) return;

            $is_enable_cart = $this->enable_discount_cart;
            if ($is_enable_cart == 'no' && is_cart()) return;

            $amount = (float)$this->payerurl_discount_amount;
            if (empty($amount) || !is_numeric($amount) || $amount <= 0) return;

            $type = $this->payerurl_discount_type;
            switch ($type) {
                case "percentage":
                    $discount = ($cart->get_cart_contents_total() + $cart->get_shipping_total()) * ($amount / 100);
                    break;
                case "fixed":
                    $discount = $amount;
                    break;
                default:
                    return;
            }

            $title = $this->payerurl_discount_title;
            $cart->add_fee($title, -$discount, false);
        }

        public function process_payment($order_id)
        {
            $reqBody = $this->getRequestBody($order_id);
            $signature = $this->generateSignature($reqBody, $this->payerurl_secret_key);
            $authStr = $this->getAuthStr($signature, $this->payerurl_public_key);
            $args = [
                'timeout' => 50,
                'body' => $reqBody,
                'headers' => $this->getRequestHeader($authStr)
            ];

            if (!empty($this->enable_log)) $this->log(json_encode($args));
            $response = wp_remote_post($this->paymentURL, $args);
            if (!empty($this->enable_log)) $this->log(json_encode($response));

            $result = array('result' => 'error', 'redirect' => wc_get_checkout_url());
            if (is_wp_error($response)) {
                wc_add_notice(
                    __(
                        'An error occurred, We were unable to process your order, please try again.',
                        'ABC-crypto-currency-payment-gateway-for-wooCommerce'
                    ),
                    'error'
                );
                return $result;
            }

            $body = json_decode($response['body'], true);
            if ($response['response']['code'] !== 200) {
                wc_add_notice(
                    __(
                        "!Error: $body",
                        'ABC-crypto-currency-payment-gateway-for-wooCommerce'
                    ),
                    'error'
                );
                return $result;
            }

            if (isset($body['redirectTO'])) {
                $result = array(
                    'result' => 'success',
                    'redirect' => esc_url_raw($body['redirectTO'])
                );
                WC()->cart->empty_cart();
            } else {
                wc_add_notice(
                    __(
                        'An error occurred, We were unable to process your order, please contact us',
                        'ABC-crypto-currency-payment-gateway-for-wooCommerce'
                    ),
                    'error'
                );
            }

            return $result;
        }

        public function payerurl_response()
        {
            $input = $this->extractResponseData();
            $headers = getallheaders();
            if (!empty($this->enable_log)) $this->log(json_encode([$headers, $input]));

            $response = $this->isResponseValid($headers, $input);
            extract($response);
            if (!empty($status)) return wp_send_json($response);

            $api_hash_link = "https://dash.payerurl.com/payment/" . $input['transaction_id'];
            $link = filter_var($api_hash_link, FILTER_SANITIZE_URL);
            $format_link = sprintf(
                '<a href="%s" target="_blank" rel="noopener">%s</a>',
                $link,
                $input['transaction_id']
            );

            $order->set_transaction_id($input['transaction_id']);
            $order->add_order_note(
                sprintf(
                    'Txn. ID: %s<br/>Received Coin: %s %s<br/>
                    (%s %s)<br/>Time: %s UTC<br/>Note: %s',
                    $format_link,
                    $input['coin_rcv_amnt'],
                    $input['coin_rcv_amnt_curr'],
                    $input['confirm_rcv_amnt'],
                    $input['confirm_rcv_amnt_curr'],
                    $input['txn_time'],
                    $input['note']
                ),
                true
            );

            if (
                $input['status_code'] === 200 && $input['coin_rcv_amnt'] != 0 &&
                $input['confirm_rcv_amnt'] >= $order->get_total()
            ) {
                $order->payment_complete($input['transaction_id']);
                return wp_send_json(['status' => 2040, 'message' => 'Order updated successfully']);
            } else {
                $order->update_status('on-hold');
                return wp_send_json(['status' => 2050, 'message' => 'Order On-Hold due to less amount paid by the customer']);
            }
        }

        public function generate_button_html($key, $data)
        {
            $defaults  = array(
                'title' => '',
                'disabled' => false,
                'class' => '',
                'css' => '',
                'desc_tip' => false,
                'description' => '',
                'name' => '',
            );
            $data  = wp_parse_args($data, $defaults);

            ob_start();
?>
            <tr valign="top">
                <th colspan="1" scope="row" class="titledesc">
                    <button type="button" class="button <?php echo $data['class']; ?>">
                        <?php echo $data['name']; ?>
                    </button>
                    <?php
                    if (isset($data['description'])) {
                    ?>
                        <p class="description">
                            <?php echo $data['description']; ?>
                        </p>
                    <?php
                    }
                    ?>
                </th>
                <td class="forminp"></td>
            </tr>
<?php
            return ob_get_clean();
        }

        private function isResponseValid($headers, $input)
        {
            if (!isset($input['order_id']) || empty($input['order_id']))
                return ['status' => 2050, 'message' => 'Order ID not found'];
            if (!isset($input['transaction_id']) || empty($input['transaction_id']))
                return ['status' => 2050, 'message' => 'Transaction ID not found'];

            list($auth, $resSignature) = $this->getAuthFromResponse($headers);
            if (empty($auth)) $auth = '';
            if (!isset($resSignature)) $resSignature = '';

            if ($this->payerurl_public_key != $auth)
                return ['status' => 2030, 'message' => 'Public key doesn\'t match'];

            $signature = $this->generateSignature($input, $this->payerurl_secret_key);
            if (!hash_equals($signature, $resSignature)) {
                return wp_send_json(
                    array_merge(
                        ['status' => 2030, 'message' => 'Signature doesn\'t match'],
                        $input
                    )
                );
            }

            $order = wc_get_order($input['order_id']);
            if (is_null($order)) return ['status' => 2050, 'message' => 'Order not found'];

            if ($input['status_code'] === 20000) {
                $order->update_status('cancelled');
                return ['status' => 20000, 'message' => 'Payment cancelled'];
            }

            return ['order' => $order];
        }

        private function getAuthFromResponse($headers)
        {
            if (!array_key_exists('Authorization', $headers)) return false;
            $authStr = $headers['Authorization'];
            if (0 !== stripos($authStr, 'Bearer ')) return false;
            $authStr = sanitize_text_field(str_replace('Bearer ', '', $authStr));
            $authStr = base64_decode($authStr);
            return explode(':', $authStr);
        }

        private function getAuthStr($signature, $pubKey)
        {
            return base64_encode(sprintf('%s:%s', $pubKey, $signature));
        }

        private function generateSignature($input, $secret)
        {
            ksort($input);
            $input = array_map(function ($value) {
                return $value !== false && empty($value) ? null : $value;
            }, $input);
            $input = http_build_query($input);
            return hash_hmac('sha256', $input, $secret);
        }

        private function getRequestHeader($authStr)
        {
            return [
                'Content-Type' => 'application/x-www-form-urlencoded;charset=UTF-8',
                'Authorization' => sprintf('Bearer %s', $authStr),
            ];
        }

        private function getRequestBody($order_id)
        {
            $order = new WC_Order($order_id);
            $args = array(
                'order_id' => $order->get_id(),
                'order_key' => $order->get_order_key(),
                'amount' => $order->get_total(),
                'currency' => strtolower(get_woocommerce_currency()),
                'billing_fname' => sanitize_text_field($order->get_billing_first_name()),
                'billing_lname' => sanitize_text_field($order->get_billing_last_name()),
                'billing_email' => sanitize_email($order->get_billing_email()),
                'redirect_to' => $order->get_checkout_order_received_url(),
                'cancel_url' => wc_get_checkout_url(),
                'type' => 'wp',
                'notify_url' => home_url('/wc-api/wc_payerurl')
            );

            $items = $order->get_items();
            $args['items'] = array_reduce($items, function ($carry, $item) {
                array_push($carry, [
                    "name" => sanitize_text_field($item->get_name()),
                    'qty' => $item->get_quantity(),
                    'price' => $item->get_total(),
                ]);
                return $carry;
            }, []);

            return $args;
        }

        private function extractResponseData()
        {
            return [
                'ext_transaction_id' => $this->getDataFromResponse('ext_transaction_id'),
                'transaction_id' => $this->getDataFromResponse('transaction_id'),
                'status_code' => filter_var($this->getDataFromResponse('status_code'), FILTER_VALIDATE_INT),
                'note' => $this->getDataFromResponse('note'),
                'confirm_rcv_amnt' => $this->getDataFromResponse('confirm_rcv_amnt', 0),
                'confirm_rcv_amnt_curr' => strtoupper($this->getDataFromResponse('confirm_rcv_amnt_curr')),
                'coin_rcv_amnt' => $this->getDataFromResponse('coin_rcv_amnt', 0),
                'coin_rcv_amnt_curr' => strtoupper($this->getDataFromResponse('coin_rcv_amnt_curr')),
                'txn_time' => $this->getDataFromResponse('txn_time'),
                'order_id' => $this->getDataFromResponse('order_id'),
            ];
        }

        private function getDataFromResponse($key, $default = '')
        {
            return isset($_POST[$key]) ? sanitize_text_field($_POST[$key]) : $default;
        }

        private function log($message, $level = 'info')
        {
            $context = array('source' => 'payerurl');
            self::$logger->log($level, $message, $context);
        }

        public function testApiCreds()
        {
            if (empty($_POST["app_key"]) || empty($_POST["secret_key"])) {
                return wp_send_json_error([
                    'message' => __('Add the public and secret key', 'ABC-crypto-currency-payment-gateway-for-wooCommerce')
                ], 400);
            }

            $body = [
                'test' => sanitize_text_field($_POST["app_key"])
            ];
            $signature = $this->generateSignature($body, sanitize_text_field($_POST["secret_key"]));
            $authStr = $this->getAuthStr($signature, sanitize_text_field($_POST["app_key"]));

            $args = [
                'timeout' => 45,
                'body' => $body,
                'headers' => $this->getRequestHeader($authStr)
            ];

            if (!empty($this->enable_log)) $this->log(json_encode($args));
            $response = wp_remote_post($this->apiVerifyURL, $args);
            if (!empty($this->enable_log)) $this->log(json_encode($response));

            if (is_wp_error($response)) {
                return wp_send_json_error([
                    'message' => __('Server error', 'ABC-crypto-currency-payment-gateway-for-wooCommerce')
                ], 500);
            }

            $body = json_decode($response['body'], true);
            if ($response['response']['code'] !== 200) {
                return wp_send_json_error([
                    'message' => $body['message']
                ], 401);
            }

            return wp_send_json_success();
        }
    }
}
