sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue, Meins) {
			
			
			if (sValue === null) {
				return "";
			}

			let returnValue = parseFloat(sValue).toFixed(2),
				x = returnValue.replace(".", ",");

			return Meins === "ADT" ? parseInt(x, 10) : x;

		},

		upperCase: function(sValue){
				return sValue.toUpperCase();
		}

	};

});