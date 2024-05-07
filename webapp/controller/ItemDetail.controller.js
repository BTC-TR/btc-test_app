sap.ui.define(["com/sahterm/satis_terminal/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"com/sahterm/satis_terminal/model/formatter",
		"com/sahterm/satis_terminal/controller/Utilities"
	],

	function(BaseController, JSONModel, formatter, Util) {
		"use strict";

		return BaseController.extend("com.sahterm.satis_terminal.controller.ItemDetail", {
			formatter: formatter,

			onInit: function() {
				this.getRouter().getRoute("itemDetail").attachPatternMatched(this._onObjectMatched, this);
			},

			_onObjectMatched: function(oEvent) {

				let deliveryModel = this.getView().getModel("deliveryModel");

				let deliveryNo = deliveryModel.getProperty("/deliveryNo"),
					itemNo = deliveryModel.getProperty("/ItemNo");


					deliveryModel.setProperty("/messages", []);
				if (!deliveryNo) {
					//delivery No yoksa, sayfa yenilenmiş demektir. Bu yüzden ana sayfa olan worklist'e yönlendiririm.
					return this.getRouter().navTo("worklist");
				}

				this.getView().setModel(new JSONModel({

				}), "viewModel");

				//Seçilen satırın bilgilerini detay kısmına yazarız.
				try {
					var aItemDetail = deliveryModel.getProperty("/List").filter(function(item) {
						return item.Docno === deliveryNo && item.Itemno === itemNo;
					});

					this.getView().setModel(new JSONModel(aItemDetail[0]), "itemDetailModel");

					Util.getLog(this, deliveryNo, itemNo);

				} catch (error) {
					sap.m.MessageBox.error(error);
				}

			},
			onPressNavButton: function() {
				history.go(-1);
			},

			onMessageOpen: function(){
				if (!this._oMesajPopup) {
					this._oMesajPopup = sap.ui.xmlfragment("com.sahterm.satis_terminal.fragment.message.MessagePopover", this);
					this.getView().addDependent(this._oMesajPopup);
				}
				this._oMesajPopup.openBy(this.getView().byId("_IDGenButton2"));
			},
	

			onPressDeliveryDetail: function() {

				let deliveryNo = this.getView().getModel("deliveryModel").getProperty("/deliveryNo"),
					itemNo = this.getView().getModel("deliveryModel").getProperty("/ItemNo");
				this.getRouter().navTo("deliveryDetail", {
					deliveryNo: deliveryNo,
					itemNo: itemNo
				});
			},

			onLiveChangeTagNo: function(oEvent) {
				Util.readTag(this, oEvent);

			},

			onPressSave: function() {
				Util.saveLog(this);
			},

			onSearchClickWareHouse: function() {
				let that = this;

				let sourceWareHouse = this.getView().byId("idSourceWareHouse").getValue();
				this.getView().byId("idSourceWareHouse").setValue(formatter.upperCase(sourceWareHouse));

				window.setTimeout(function() {
					that.getView().byId("idPalletNo").focus();
				}, 100);
			},
			onChangeSourceWarehouse:function(){

				let sourceWareHouse = this.getView().byId("idSourceWareHouse").getValue();
				this.getView().byId("idSourceWareHouse").setValue(formatter.upperCase(sourceWareHouse));

			},

			onSumbitAdres: function() {
				this.onSearchClickWareHouse();
			},

			onSearchClick: function() {
				let that = this;

				let oPaletEtiket = this.getView().byId("idPalletNo").getValue();

				if (oPaletEtiket.length > 10) {
					sap.m.MessageBox.error("Palet Numarası 10 hane olmalıdır.");
				} else {
					this.getView().byId("idPalletNo").setValue(formatter.upperCase(oPaletEtiket));
					window.setTimeout(function() {
						that.getView().byId("idTag").focus();
					}, 100);
				}

			},
			onSumbitPallet: function() {

				this.onSearchClick();
			},

			onPressClean: function(){
				let oDeliveryModel = this.getView().getModel("deliveryModel"),
					 oViewModel = this.getView().getModel("viewModel");


					 oDeliveryModel.setProperty("/messages", []);
					 oViewModel.setProperty("/WarehouseNo", "");
					 oViewModel.setProperty("/PalletNo", "");
				
				},

			onLivePallet: function() {

				let that = this;

				let oPaletEtiket = this.getView().byId("idPalletNo").getValue(),
					oPalet = oPaletEtiket.split("|");

				if (oPalet.length === 2) {
					this.getView().byId("idPalletNo").setValue(oPalet[0]);
					window.setTimeout(function() {
						that.getView().byId("idTag").focus();
					}, 100);
				} else {
					//	this.getView().byId("idPalletNo").setValue("");
				}
			}
		});

	});