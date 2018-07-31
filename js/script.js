;(function($) {
  'use strict';

  const colorOptions = (start, end, text) => {
    return $color.find('option').slice(start, end).each((_, opt) => $(opt).text($(opt).text().replace(text, '').trim()));
  };

  // ========== Form references ================

  const $name        = $('#name');
  const $mail        = $('#mail');
  const $title       = $('#title');
  const $other_title = $('#other-title')
  const $size        = $('#size');
  const $design      = $('#design');
  const $color       = $('#color');
  const $activities  = $('fieldset.activities input[type="checkbox"]');
  const $payment     = $('#payment');
  const $cc_num      = $('#cc-num');
  const $zip         = $('#zip');
  const $cvv         = $('#cvv');
  const $exp_month   = $('#exp-month');
  const $exp_year    = $('#exp-year');
  const $form        = $('form');

  // ============ Other Elements  =============

  const $price       = $('<div class="price"></div>');
  const $credit_card = $('#credit-card');
  const $colorsJsPuns = $('#colors-js-puns');
  const colors       = {
    a: colorOptions(0, 3, '(JS Puns shirt only)'),
    b: colorOptions(3, 7, '(I ♥ JS shirt only)')
  };



  // =========== Event Handlers ================

  // Handles the activity checkboxes
  function activitiesHandler(checkbox) {

    let price = 0;

    // Loop over all checkboxes
    for(let activity of $activities) {

      // Regular expression that matches the activity day and time
      const dateTimeMatch = $(checkbox.labels).text().match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) \d+(am|pm)-\d+(am|pm)/gi);
      const $activity     = $(activity);
      // Disable the checkbox if it contains the if it is
      // not the variable checkbox and contains the same
      // date and time as the variable checkbox
      (activity != checkbox) && dateTimeMatch && ($(activity.labels[0]).text().indexOf(dateTimeMatch[0]) > -1) && $activity.prop('disabled',  checkbox.checked) && $(activity.labels).toggleClass('disabled', checkbox.checked);

      // If the checkbox contained in the variable activity is checked
      // use a regular expression to find the amount and increment
      // the variable pruce
      activity.checked && (price += parseInt($(activity.labels[0]).text().match(/\$\d+/gi)[0].substr(1)));

    }

    // Set the text of the price element to the
    // calculated price
    $price.text(price === 0 ? `` : `Total: \$${price}`);

  }

  // Handles the change of the job title select menu
  // and displays/hides the other job role field
  // if "Other" is selected or not
  function titleHandler() {

    const $self = $(this);
    const index = $self.prop('selectedIndex') || 0;

    // "Other" has index 5
    if(index === 5)
      $other_title.show();
    else
      $other_title.hide();

  }

  // Handles the change of the design select menu
  // and shows/hides the color select field based on the
  // current selected index
  // Also appends the colors based on the design selected
  function designHandler() {

    const $self = $(this);
    const index = $self.prop('selectedIndex') || 0;

    $color.find('option').remove();
    $colorsJsPuns.show();

    switch(index) {
      case 0:
        $colorsJsPuns.hide();
        break;
      case 1:
        $color.append(colors.a);
        break;
      case 2:
        $color.append(colors.b);
        break;
    }

  }

  // Handles the payment select menu
  // Shows/hides the credit-card div, bitcoin and paypal divs
  // based on the option selected in the payment select menu
  function paymentHandler() {

    const $self = $(this);
    const index = $self.prop('selectedIndex') || 1;
    const $divs = $form.find('fieldset > div').slice(-2);

    $self.prop('selectedIndex', index);
    $divs.hide();

    if(index === 1)
      $credit_card.show();
    else
      $credit_card.hide();

    if(index === 2)
      $divs.eq(0).show();
    else if(index === 3)
      $divs.eq(1).show();

  }

  // Validate the format of an email address
  // returns true if ok, false if not ok
  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  // Handles the validation of all required form elements
  // and displays an overlay with a summary of all the error messages
  function validateForm(e) {

    const name       = $name.val();
    const email      = $mail.val();
    const otherTitle = $other_title.val();
    const ccNum      = $cc_num.val();
    const zip        = $zip.val();
    const cvv        = $cvv.val();
    const errors     = [];

    // Remove any existing error messages in the form
    $('.form-error-text').remove();
    $('.form-error').removeClass('form-error');

    // Validate the name field
    if(name.length === 0 || /[0-9]/gi.test(name)) {
      errors.push('Please provide a valid name');
      $($name[0].labels).addClass('form-error').append(`<span class="form-error-text">(${errors[errors.length-1]})</span>`);
      $name.addClass("form-error");
    }

    // Validate the email field
    if(!validateEmail(email)) {
      errors.push('Please provide a valid email');
      $($mail[0].labels).addClass('form-error').append(`<span class="form-error-text">(${errors[errors.length-1]})</span>`);
      $mail.addClass("form-error");
    }

    // Validate the other job role field
    if($title.prop('selectedIndex') === 5 && otherTitle.length === 0) {
      errors.push('Please provide a job role');
      $other_title.addClass("form-error");
    }

    // Validate the T-shirt design select menu
    if($design.prop('selectedIndex') === 0) {
      const $legend = $('fieldset.shirt legend');
      errors.push('Please pick a T-shirt')
      $legend.append(`<span class="form-error-text">(${errors[errors.length-1]})</span>`);
      $legend.addClass("form-error");

    }

    // Validate the activities checkboxes
    // Make sure that at least one is checked
    // Can just check the price field for this, if it is empty
    // then we know nothing is checked
    if($price.text().length === 0) {
      const $legend = $('fieldset.activities legend');
      errors.push('Please select an activity')
      $legend.append(`<span class="form-error-text">(${errors[errors.length-1]})</span>`);
      $legend.addClass("form-error");

    }

    // Validate the credit card fields if credit card payment method is selected
    if($payment.prop('selectedIndex') === 1) {

      const checkNumeric = /[^0-9]/gi;

      // Validate the credit card number
      if(checkNumeric.test(ccNum) || !(ccNum.length >= 13 && ccNum.length <= 16)) {

        if(!ccNum.length) {
          errors.push('Please enter a credit card number');
        }
        else
          errors.push('Please enter a credit card number that<br /> is between 13 and 16 digits long');

        $($cc_num[0].labels).addClass('form-error');
        $cc_num.addClass("form-error");
      }

      // Validate the zip code
      if(checkNumeric.test(zip) || zip.length != 5) {

        if(!zip.length) {
          errors.push('Please enter a valid zip code number');
        }
        else
          errors.push('Please enter a zip code that is exacly 5 digits long');


        $($zip[0].labels).addClass('form-error');
        $zip.addClass("form-error");
      }

      // Validate the CVV code
      if(checkNumeric.test(cvv) || cvv.length != 3) {

        if(!ccNum.length) {
          errors.push('Please enter a valid CVV number');
        }
        else
          errors.push('Please enter a CVV that is exacly 3 digits long');

        $($cvv[0].labels).addClass('form-error');
        $cvv.addClass("form-error");
      }

    }

    // Prevent default browser behavior
    // and display a summary of error messages if any errors
    if(errors.length) {

      e.preventDefault();

      const $overlay = $('<div class="form-error-overlay"></div>');
      const $ol = $('<ol></ol>')

      $overlay.append($ol);

      for(let errormsg of errors) {
        $ol.append(`<li>${errormsg}</li>`)
      }

      $form.prepend($overlay);
      $overlay.on('click', () => $overlay.remove());

    }

  }

  // ================== Setup ==================

  // Append the price container under the <fieldset> with the class activities
  $('fieldset.activities').append($price);

  // Append the form validation styles to the <head> element
  $('head').append(`
    <style>
      span.form-error,
      label.form-error,
      legend.form-error,
      div.form-error {
        color: red;
      }

      span.form-error-text {
        display: inline-block;
        margin-left: 10px;
      }

      input.form-error {
        color: white;
        border: 2px solid darkred;
        background-color: red;
      }

      form {
        position: relative;
      }

      div.form-error-overlay {
        display: flex;
        justify-content: flex-end;
        flex-direction: column;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        z-index: 100;
        background-color: rgba(255, 255, 255, .8);
      }

      div.form-error-overlay ol {
        color: red;
        font-size: 1.3em;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 100px;
      }

      div.form-error-overlay ol li {
        margin-bottom: 1.2em;
      }

      label.disabled {
        opacity: .25;
      }

    </style>
  `)

  $activities.on('change', (e) => activitiesHandler(e.target));
  $title.on('change', titleHandler);
  $design.on('change', designHandler);
  $payment.on('change', paymentHandler);
  $form.on('submit', validateForm);

  $name.focus();
  $other_title.hide();
  $payment.prop('selectedIndex', 1);

  designHandler();
  paymentHandler();

}($));
