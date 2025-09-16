<?php
/*
Plugin Name: Zeno Plugin
Plugin URI: https://example.com
Description: Extiende WooCommerce con un gateway de pago cripto que redirige a un checkout externo.
Version: 1.0.0
Author: Tú
Author URI: https://example.com
Text Domain: wc-gateway-name
License: GPLv3
License URI: http://www.gnu.org/licenses/gpl-3.0.html
*/

if (! defined('ABSPATH')) {
	exit;
}


define('ZENO_BACKEND_URL', 'https://dkfjadskfjaercl.loca.lt');
define('ZENO_PAYMENT_GATEWAY_ID', 'zeno');

/*
 * This action hook registers our PHP class as a WooCommerce payment gateway
 */
add_filter('woocommerce_payment_gateways', 'zeno_add_gateway_class');
function zeno_add_gateway_class($gateways)
{
	$gateways[] = 'WC_Zeno_Gateway'; // your class name is here
	return $gateways;
}

/*
 * The class itself, please note that it is inside plugins_loaded action hook
 */
add_action('plugins_loaded', 'zeno_init_gateway_class');
function zeno_init_gateway_class()
{


	class WC_Zeno_Gateway extends WC_Payment_Gateway
	{

		/**
		 * Class constructor, more about it in Step 3
		 */
		public function __construct()
		{

			$this->id = ZENO_PAYMENT_GATEWAY_ID; // payment gateway plugin ID
			$this->icon = ''; // URL of the icon that will be displayed on checkout page near your gateway name
			$this->has_fields = false; // in case you need a custom credit card form
			$this->method_title = 'Zeno Gateway';
			$this->method_description = 'Description of Zeno payment gateway'; // will be displayed on the options page

			// gateways can support subscriptions, refunds, saved payment methods,
			// but in this tutorial we begin with simple payments
			$this->supports = array(
				'products'
			);

			// Method with all the options fields
			$this->init_form_fields();

			// Load the settings.
			$this->init_settings();
			$this->title = $this->get_option('title');
			$this->description = $this->get_option('description');
			$this->enabled = $this->get_option('enabled');


			// This action hook saves the settings
			add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));

			// We need custom JavaScript to obtain a token
			add_action('wp_enqueue_scripts', array($this, 'payment_scripts'));

			// You can also register a webhook here
			add_action('woocommerce_api_zeno_webhook', array($this, 'webhook'));
		}

		/**
		 * Plugin options, we deal with it in Step 3 too
		 */
		public function init_form_fields()
		{

			$this->form_fields = array(
				'enabled' => array(
					'title'       => 'Enable/Disable',
					'label'       => 'Enable Zeno Gateway',
					'type'        => 'checkbox',
					'description' => '',
					'default'     => 'no'
				),
				'title' => array(
					'title'       => 'Title',
					'type'        => 'text',
					'description' => 'This controls the title which the user sees during checkout.',
					'default'     => 'Crypto payment',
					'desc_tip'    => true,
				),
				'description' => array(
					'title'       => 'Description',
					'type'        => 'textarea',
					'description' => 'This controls the description which the user sees during checkout.',
					'default'     => 'Crypto payment.',
				),
				'publishable_key' => array(
					'title'       => 'Live Publishable Key',
					'type'        => 'text'
				),
				'private_key' => array(
					'title'       => 'Live Private Key',
					'type'        => 'password'
				)
			);
		}




		public function payment_scripts() {}


		public function validate_fields()
		{

			return true;
		}

		public function process_payment($order_id)
		{

			$order = wc_get_order($order_id);
			/*
 			 * Array with parameters for API interaction
			*/
			$args = array(
				'body' => array(
					'priceAmount'          => $order->get_total(),
					'priceCurrency'        => $order->get_currency(),
					'order_id'        => $order_id,
					// 'customer_email'  => $order->get_billing_email(),
					// 'customer_name'   => $order->get_formatted_billing_full_name(),
					// 'callback_url'    => home_url('/?wc-api=zeno_webhook'), // webhook en WP
					// 'return_url'      => $this->get_return_url($order)   // página gracias
				)
			);

			// Backend call
			$response = wp_remote_post(ZENO_BACKEND_URL . '/api/v1/payments', $args);

			if (is_wp_error($response)) {
				wc_add_notice('Connection error11' . $response->get_error_message(), 'error');
				return array(
					'result'   => 'error',
				);
			}

			$code = wp_remote_retrieve_response_code($response);
			$body = json_decode(wp_remote_retrieve_body($response), true);

			$body = json_decode(wp_remote_retrieve_body($response), true);

			if (! empty($body['paymentUrl'])) {
				return array(
					'result'   => 'success',
					'redirect' => esc_url_raw($body['paymentUrl']),
				);
			}

			wc_add_notice('Payment initialization failed. Please try again.', 'error');
			return array(
				'result' => 'error',
			);
		}

		/*
		 * In case you need a webhook, like PayPal IPN etc
		 */
		public function webhook()
		{
			$order = wc_get_order($_GET['id']);
			$order->payment_complete();
		}
	}

	add_action('woocommerce_blocks_loaded', 'zeno_gateway_block_support');
	function zeno_gateway_block_support()
	{

		if (! class_exists('Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType')) {
			return;
		}

		// here we're including our "gateway block support class"
		require_once __DIR__ . '/includes/class-wc-zeno-gateway-blocks-support.php';

		// registering the PHP class we have just included
		add_action(
			'woocommerce_blocks_payment_method_type_registration',
			function (Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry) {
				$payment_method_registry->register(new WC_Zeno_Gateway_Blocks_Support);
			}
		);
	}
}
