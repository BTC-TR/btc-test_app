sap.ui.define([
	"com/sahterm/satis_terminal/controller/BaseController",
	"com/sahterm/satis_terminal/controller/Utilities",
	"com/sahterm/satis_terminal/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, Util, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.sahterm.satis_terminal.controller.DeliveryDetail", {
		formatter: formatter,

		onInit: function() {
			this.getRouter().getRoute("deliveryDetail").attachPatternMatched(this._onObjectMatched, this);
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
				Util.getLog(this, deliveryNo, itemNo);
			}

		},

		onPressDeleteItem: function() {
			Util.deleteSelectedLog(this);
		},

		handleTxtFilter: function(oEvent) {
			var sQuery = oEvent ? oEvent.getSource().getValue() : null;
			this._oTxtFilter = null;

			if (sQuery) {
				this._oTxtFilter = new Filter([
					new Filter("Palet", FilterOperator.Contains, sQuery),
					new Filter("Etiket", FilterOperator.Contains, sQuery),
					new Filter("Lgpla", FilterOperator.Contains, sQuery)
				], false);
			}

			if (oEvent) {
				this._filter();
			}
		},

		_filter: function() {
			var oFilter = null;

			if (this._oTxtFilter) {
				oFilter = new Filter([this._oTxtFilter], true);
			}

			this.byId("idDetailTable").getBinding("items").filter(oFilter);
		}

	});

});