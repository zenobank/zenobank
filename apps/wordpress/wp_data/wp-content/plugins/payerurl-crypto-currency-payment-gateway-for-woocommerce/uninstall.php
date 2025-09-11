<?php

/**
 * Uninstalling payerurl settings.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) exit;

$option_name = 'woocommerce_wc_payerurl_gateway_settings';

if (is_multisite()) {
    delete_site_option($option_name);
} else {
    delete_option($option_name);
}

wp_cache_flush();
