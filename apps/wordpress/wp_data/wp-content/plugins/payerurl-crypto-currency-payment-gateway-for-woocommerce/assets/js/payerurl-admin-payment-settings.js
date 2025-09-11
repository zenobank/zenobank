jQuery(function ($) {
  $('button.payerurl_test_api_creds').click(function (event) {
    $(this).addClass('updating-message');
    event.preventDefault();
    const publicKey = $(
      'input#woocommerce_wc_payerurl_gateway_payerurl_public_key'
    )
      .val()
      .replace(/[\s\n\r]+/g, '');

    const secretKey = $(
      'input#woocommerce_wc_payerurl_gateway_payerurl_secret_key'
    )
      .val()
      .replace(/[\s\n\r]+/g, '');

    if (!publicKey || !secretKey) return;

    wp.ajax
      .post('test_api_creds', {
        app_key: publicKey,
        secret_key: secretKey,
        _wpnonce: payerur_obj.nonce,
      })
      .done((response) => {
        $(this).removeClass('updating-message');
        $('button.payerurl_test_api_creds')
          .parent()
          .parent()
          .find('td')
          .html(
            `<span id="payerurl-api-response" style="color:green">Both api key and secret key found. Saving credentials...</span>`
          );
        setTimeout(() => {
          $('button.woocommerce-save-button').trigger('click');
        }, 2000);
      })
      .fail((response) => {
        $(this).removeClass('updating-message');
        const html = response.responseJSON?.data?.message
          ? response.responseJSON.data.message
          : '';
        $('button.payerurl_test_api_creds')
          .parent()
          .parent()
          .find('td')
          .html(
            `<span id="payerurl-api-response" style="color:red">${html}</span>`
          );
      });
  });
});
