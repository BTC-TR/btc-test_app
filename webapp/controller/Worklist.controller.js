/*global location history */
sap.ui.define([
	"com/sahterm/satis_terminal/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/sahterm/satis_terminal/model/formatter",
	"com/sahterm/satis_terminal/controller/Utilities"
], function(BaseController, JSONModel, formatter, Util) {
	"use strict";

	return BaseController.extend("com.sahterm.satis_terminal.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel;

			// Model used to manipulate control states
			oViewModel = new JSONModel({});
			this.setModel(oViewModel, "worklistView");


			
			this.getRouter().getRoute("worklist").attachPatternMatched(this.patternMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onBack: function() {
			history.go(-1);
		},

		onSubmitDeliveryNo: function() {

			let deliveryNo = this.getView().byId("idInputTeslimatNo").getValue();
			this.getView().getModel("deliveryModel").setProperty("/deliveryNo", deliveryNo);

			if (deliveryNo) {
				Util.getDelivery(this, deliveryNo, "delivery");
			}

		},
		onPressNext: function(oEvent) {
				if (oEvent.getSource().getValue().length === 8) {
					this.onSubmitDeliveryNo();
				}
			},


			patternMatched: function (oEvent) {

				jQuery.sap.delayedCall(400, this, function() {
					this.getView().byId("idInputTeslimatNo").focus();
				});
	
			},
			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

	});
});