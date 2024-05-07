sap.ui.define([
	"com/sahterm/satis_terminal/controller/BaseController",
	"com/sahterm/satis_terminal/controller/Utilities",
	"sap/ui/model/json/JSONModel",
	"com/sahterm/satis_terminal/model/formatter",
], function(BaseController, Util, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("com.sahterm.satis_terminal.controller.AgirlikToplama", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sahterm.satis_terminal.view.AgirlikToplama
		 */
		onInit: function() {
			this.getRouter().getRoute("agirlikToplama").attachPatternMatched(this._onObjectMatched, this);

			// Model used to manipulate control states
			let oViewModel = new JSONModel({});
			this.setModel(oViewModel, "viewModel");
		},

		onPressNavButton: function() {
			history.go(-1);
		},

		_onObjectMatched: function(oEvent) {

			let deliveryModel = this.getView().getModel("deliveryModel"),
				deliveryNo = deliveryModel.getProperty("/deliveryNo"),
				itemNo = deliveryModel.getProperty("/ItemNo");

			if (!deliveryNo) {
				return this.getRouter().navTo("worklist");

			} else {
				Util.getAgirlikLog(this, deliveryNo, itemNo);
			}

		},

		onLiveAgirlik: function(oEvent) {

			Util.readAgirlik(this, oEvent);
		},
			onPressDeleteItem: function() {
			Util.deleteSelectedAgirlik(this);
		}
		
	});

});