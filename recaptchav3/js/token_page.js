// token_page.js
// ------------------------------------------------------------------
//
// last saved: <2020-August-02 21:32:07>

/* jshint esversion:9, node:false, strict:implied */
/* global jQuery, document, window, console, Buffer, grecaptcha, btoa */

(function (){
  const reCAPTCHA_site_key = '6LeEA3gUAAAAAPRenCnqy8K4IuLepRPAPLNIKOY_',
        postbackEndpoint = 'https://therealdinochiesa2-eval-test.apigee.net/oauth2-cc-recaptcha/token',
        client_id = 'V0YrtyrC0gXEtmFc98BigDy5EGaRoMb42EKqyeraOu',
        client_secret = 'VNtGqla90DaiZFKhojSTpsGXLWnO9SNkuhVBK2ZGudsL5UTG',
        $ = jQuery;

  function clearOutput(event) {
    $('#output').addClass('notshown').empty();
    $('#clear').parent().addClass('notshown');
  }

  function applyRecaptchaAndSubmit(event) {
    // prevent form submit
    if (event) { event.preventDefault(); }

    try {

      // The browser will show an opaque promise error in this method if this
      // page is hosted on a domain which does not match the domain set for
      // the given site_key. The little recaptcha badge will show a warning
      // message.

      grecaptcha.execute(reCAPTCHA_site_key, {action: 'token'})
        .then(function(recaptchaToken) {

          // post back to an API endpoint. The thing on the other end must call to
          // google using the site key secret, to ask for the 'score' for this token.
          var jqxhr = $.ajax({
                url: postbackEndpoint,
                method: "POST",
                headers: {
                  "Authorization": "Basic " + btoa(client_id + ":" + client_secret)
                },
                data: 'grant_type=client_credentials',
                contentType: 'application/x-www-form-urlencoded',
                dataType : 'json' // response
              })
            .done(function(responseData) {
              // The Apigee endpoint just returns what recaptcha said.
              // Display it on the page.
              let $ta = $('<textarea>');
              $ta.attr('class', 'results code');
              $ta.attr('spellcheck','false');
              $ta.attr('disabled','true');
              $ta.text(JSON.stringify(responseData, null, 2));
              $('#output').empty().removeClass('notshown').append($ta);
              $('#clear').parent().removeClass('notshown');
            })
            .fail(function(response, error, exc) {
              window.alert( "error: " + exc);
            });
        });
    }
    catch (e) {
      window.alert( "exception: " + e);
    }
    return false;
  }

  grecaptcha.ready(function() {
    $(document).ready(function() {
      $('#check').on('click', applyRecaptchaAndSubmit);
      $('#clear').on('click', clearOutput);
    });

  });
}());
