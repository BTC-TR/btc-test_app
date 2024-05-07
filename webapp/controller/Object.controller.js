/*global location*/
sap.ui.define([
	"com/sahterm/satis_terminal/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/sahterm/satis_terminal/model/formatter",
	"com/sahterm/satis_terminal/controller/Utilities",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",

], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	Util,
	Filter,
	FilterOperator,
	MessageBox
) {
	"use strict";

	return BaseController.extend("com.sahterm.satis_terminal.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {

			var router = this.getOwnerComponent().getRouter();
			var target = router.getTarget("object");
			target.attachDisplay(this.onDisplay, this);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		onPressNavButton: function() {
			history.go(-1);
		},

		onSelectionChangeItem: function() {

			var oTable = this.byId("idTable");
			var iIndex = oTable.getSelectedIndex(),
				rowInfo = oTable.getContextByIndex(iIndex);

			if (rowInfo !== null) {
				//StatusPick - 9 ise tamamlanmıştır.
				if (rowInfo.getObject().StatusPick === "9") {

					this.getView().byId("idTable").clearSelection();
					return MessageBox.information("Tamamlanan kalem için işlem yapamazsınız.");

				}

				let deliveryModel = this.getView().getModel("deliveryModel");

				//teslimat numarası (Docno)
				deliveryModel.setProperty("/deliveryNo", rowInfo.getObject().Docno);
				//item numarası (Itemno)
				deliveryModel.setProperty("/ItemNo", rowInfo.getObject().Itemno);

				this.getRouter().navTo("itemDetail", {
					deliveryNo: rowInfo.getObject().Docno,
					itemNo: rowInfo.getObject().Itemno
				});

			}
		},

		onDisplay: function() {

			let oDeliveryModel = this.getView().getModel("deliveryModel");

			oDeliveryModel.setProperty("/weightVisible", false);
			oDeliveryModel.setProperty("/enabledMalKabul", false);
			oDeliveryModel.setProperty("/enabledAgirlik", false);

			if (oDeliveryModel.getProperty("/List")) {
				Util.getDelivery(this, oDeliveryModel.getProperty("/deliveryNo"), "items");
			} else {
				this.getRouter().navTo("worklist");
			}
			this.getView().byId("idTable").clearSelection();

		},

		handleTxtFilter: function(oEvent) {
			var sQuery = oEvent ? oEvent.getSource().getValue() : null;
			this._oTxtFilter = null;

			if (sQuery) {
				this._oTxtFilter = new Filter([
					new Filter("Itemno", FilterOperator.Contains, sQuery)
				], false);
			}

			if (oEvent) {
				this._filter();
			}
		},

		onPressWeight: function(oEvent) {

			let Itemno = oEvent.getSource().getBindingContext("deliveryModel").getObject().Itemno,
				Docno = oEvent.getSource().getBindingContext("deliveryModel").getObject().Docno,
				Tamamlandi = oEvent.getSource().getBindingContext("deliveryModel").getObject().Tamamlandi;

			let deliveryModel = this.getView().getModel("deliveryModel");
			//teslimat numarası (Docno)
			deliveryModel.setProperty("/deliveryNo", Docno);
			//item numarası (Itemno)
			deliveryModel.setProperty("/ItemNo", Itemno);

			//Tamamlandi 
			deliveryModel.setProperty("/Tamamlandi", Tamamlandi);

			this.getRouter().navTo("agirlikToplama", {
				deliveryNo: Docno,
				itemNo: Itemno
			});

		},

		onSaveWeight: function() {
			Util.saveAgirlik(this);
		},

		onPressSave: function() {
			Util.saveMalCikis(this);
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		_filter: function() {
			var oFilter = null;

			if (this._oTxtFilter) {
				oFilter = new Filter([this._oTxtFilter], true);
			}

			this.byId("idTable").getBinding("items").filter(oFilter);
		}
	});

});