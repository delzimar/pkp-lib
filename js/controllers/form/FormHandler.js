/**
 * @defgroup js_controllers_form
 */
// Define the namespace.
$.pkp.controllers.form = $.pkp.controllers.form || {};


/**
 * @file js/controllers/form/FormHandler.js
 *
 * Copyright (c) 2000-2011 John Willinsky
 * Distributed under the GNU GPL v2. For full terms see the file docs/COPYING.
 *
 * @class FormHandler
 * @ingroup js_controllers_form
 *
 * @brief Abstract form handler.
 */
(function($) {


	/**
	 * @constructor
	 *
	 * @extends $.pkp.classes.Handler
	 *
	 * @param {jQuery} $form the wrapped HTML form element.
	 * @param {Object} options options to be passed
	 *  into the validator plug-in.
	 */
	$.pkp.controllers.form.FormHandler = function($form, options) {
		this.parent($form, options);

		// Check whether we really got a form.
		if (!$form.is('form')) {
			throw Error(['A form handler controller can only be bound',
				' to an HTML form element!'].join(''));
		}

		// Transform all form buttons with jQueryUI.
		$('.button', $form).button();

		// Activate and configure the validation plug-in.
		if (options.submitHandler) {
			this.callerSubmitHandler_ = options.submitHandler;
		}
		var validator = $form.validate({
			errorClass: 'error',
			highlight: function(element, errorClass) {
				$(element).parent().parent().addClass(errorClass);
			},
			unhighlight: function(element, errorClass) {
				$(element).parent().parent().removeClass(errorClass);
			},
			submitHandler: this.callbackWrapper(this.submitHandler_),
			showErrors: this.callbackWrapper(this.formChange)
		});

		// Activate the cancel button (if present).
		$('#cancelFormButton', $form).click(this.callbackWrapper(this.cancelForm));

		// Root node(s) to work with
		var $n = $('.pkp_controllers_form');

		// Attach focus/unfocus handlers to multilingual elements
		$n.find('.multilingual_primary', $form).focus(
				this.callbackWrapper(this.multilingualShow));
		$n.find('.multilingual_extra', $form).blur(
				this.callbackWrapper(this.multilingualHide));

		// Initial form validation.
		if (validator.checkForm()) {
			this.trigger('formValid');
		} else {
			this.trigger('formInvalid');
		}
	};
	$.pkp.classes.Helper.inherits(
			$.pkp.controllers.form.FormHandler,
			$.pkp.classes.Handler);


	//
	// Private properties
	//
	/**
	 * If provided, the caller's submit handler, which will be
	 * triggered to save the form.
	 * @private
	 * @type {Object}
	 */
	$.pkp.controllers.form.FormHandler.prototype.callerSubmitHandler_ = null;


	//
	// Public methods
	//
	/**
	 * Internal callback called whenever the form changes.
	 *
	 * @param {Object} validator The validator plug-in.
	 * @param {Object} errorMap An associative list that attributes
	 *  element names to error messages.
	 * @param {Array} errorList An array with objects that contains
	 *  error messages and the corresponding HTMLElements.
	 */
	$.pkp.controllers.form.FormHandler.prototype.formChange =
			function(validator, errorMap, errorList) {

		// Show errors generated by the form change.
		validator.defaultShowErrors();

		// Emit validation events.
		if (validator.checkForm()) {
			// Trigger a "form valid" event.
			this.trigger('formValid');
		} else {
			// Trigger a "form invalid" event.
			this.trigger('formInvalid');
		}
	};


	/**
	 * Internal callback called to cancel the form.
	 *
	 * @param {HTMLElement} cancelButton The cancel button.
	 * @param {Event} event The event that triggered the
	 *  cancel button.
	 */
	$.pkp.controllers.form.FormHandler.prototype.cancelForm =
			function(cancelButton, event) {

		// Trigger the "form submitted" event.
		this.trigger('formCanceled');
	};


	/**
	 * Internal callback called to show additional languages for a
	 * multilingual input
	 *
	 * @param {HTMLElement} multilingualInput The primary multilingual
	 *		element in the set to show.
	 * @param {Event} event The event that triggered the action.
	 */
	$.pkp.controllers.form.FormHandler.prototype.multilingualShow =
			function(multilingualInput, event) {

		// Get the localization container for this element
		var $n = $(multilingualInput)
				.parents('.pkp_controllers_form_localization_container')
				.first();

		// Show the popover
		$n.find('.pkp_controllers_form_localization_popover').show();
		$n.addClass('pkp_controllers_form_localization_container_focus');
	};


	/**
	 * Internal callback called to hide additional languages for a
	 * multilingual input
	 *
	 * @param {HTMLElement} multilingualInput The element in the
	 *		multilingual set to hide.
	 * @param {Event} event The event that triggered the action.
	 */
	$.pkp.controllers.form.FormHandler.prototype.multilingualHide =
			function(multilingualInput, event) {

		var $n = $(multilingualInput)
				.parents('.pkp_controllers_form_localization_container')
				.first();

		// Show the popover
		$n.find('.pkp_controllers_form_localization_popover').hide();
		$n.removeClass('pkp_controllers_form_localization_container_focus');
	};


	//
	// Private Methods
	//
	/**
	 * Internal callback called after form validation to handle form
	 * submission.
	 *
	 * @private
	 *
	 * @param {Object} validator The validator plug-in.
	 * @param {HTMLElement} formElement The wrapped HTML form.
	 */
	$.pkp.controllers.form.FormHandler.prototype.submitHandler_ =
			function(validator, formElement) {

		// Notify any nested formWidgets of the submit action.
		var formSubmitEvent = new $.Event('formSubmitRequested');
		$(formElement).find('.formWidget').trigger(formSubmitEvent);

		// If the default behavior was prevented for any reason, stop.
		if (formSubmitEvent.isDefaultPrevented()) {
			return;
		}

		if (this.callerSubmitHandler_ !== null) {
			// A form submission handler (e.g. Ajax) was provided. Use it.
			return this.callbackWrapper(this.callerSubmitHandler_).
					call(validator, formElement);
		} else {
			// No form submission handler was provided. Use the usual method.

			// FIXME: Is there a better way? This is used to invoke
			// the default form submission code. (Necessary to
			// avoid an infinite loop.)
			validator.settings.submitHandler = null;

			this.getHtmlElement().submit();
		}
	};
/** @param {jQuery} $ jQuery closure. */
})(jQuery);
