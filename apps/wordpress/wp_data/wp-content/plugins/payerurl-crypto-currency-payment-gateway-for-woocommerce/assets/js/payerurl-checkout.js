jQuery(function () {
  jQuery('form.checkout.woocommerce-checkout').on(
    'change',
    "input[name='payment_method']",
    function () {
      jQuery('body').trigger('update_checkout');
    }
  );
  jQuery('body').on('payment_method_selected', () => {
    jQuery(
      'form.checkout.woocommerce-checkout input[name="payment_method"]'
    ).trigger('change');
  });

  setTimeout(() => {
    const selectedPaymentMethod = jQuery(
      'input[name="radio-control-wc-payment-method-options"]'
    ).val();
    if (selectedPaymentMethod && window?.wc?.blocksCheckout) {
      const { extensionCartUpdate } = wc.blocksCheckout;
      extensionCartUpdate({
        namespace: 'payerurl-payment-blocks',
        data: {
          payment_method: selectedPaymentMethod,
        },
      });
    }
  }, 1000);

  window?.wp?.hooks?.addAction(
    'experimental__woocommerce_blocks-checkout-set-active-payment-method',
    'payerurl-checkout-block',
    function (payment_method) {
      if (!window?.wc?.blocksCheckout) return;
      const { extensionCartUpdate } = wc.blocksCheckout;
      if(payment_method?.paymentMethodSlug) payment_method['value'] = payment_method.paymentMethodSlug
      extensionCartUpdate({
        namespace: 'payerurl-payment-blocks',
        data: {
          payment_method: payment_method.value,
        },
      });
    }
  );
});
