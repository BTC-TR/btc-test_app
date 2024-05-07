sap.ui.define([
		"com/sahterm/satis_terminal/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.sahterm.satis_terminal.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);