sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator"
], function(MessageBox, MessageToast, Filter, FilterOperator, BusyIndicator) {
	"use strict";
	return {

		callODATA: function(oModel, sPath, sFilters) {
			return new Promise((fnResolve, fnReject) => {
				let oParams = {
					filters: sFilters,
					success: fnResolve,
					error: fnReject
				};
				oModel.read(sPath, oParams);
			});
		},

		getDelivery: function(controller, deliveryNo, controllerName) {

			const deliveryModel = controller.getView().getModel("deliveryModel"),
				oModel = controller.getView().getModel();
			let sPath = "/DeliverySet",
				aFilters = [],
				sFilter = new Filter("IvTeslimat", FilterOperator.EQ, deliveryNo);
			aFilters.push(sFilter);

			BusyIndicator.show(0);
			this.callODATA(oModel, sPath, aFilters)
				.then(function(oData) {

					for (let i in oData.results) {

						oData.results[i].enableButton = true;

						if (oData.results[i].Wbsta === 'C') {

							if (oData.results[i].Tamamlandi === true) {
								oData.results[i].enableButton = false;
							}

						} else {

							oData.results[i].enableButton = false;
						}
					}

					deliveryModel.setProperty("/List", oData.results);

					switch (controllerName) {
						case "delivery":
							_delivery(oData, deliveryNo);
							break;
						case "items":
							_items(oData, deliveryNo, controller);
							break;

						default:
							break;
					}

				})
				.catch()
				.finally(() => {

					deliveryModel.refresh(true);
					BusyIndicator.hide(0);
				});

			function _delivery(oData, oDeliveryNo) {

				deliveryModel.setProperty("/deliveryNo", oDeliveryNo);

				if (oData.results.length > 0) {
					controller.getRouter().navTo("object", {
						deliveryNo: oDeliveryNo
					});
					//go next
				} else {
					deliveryModel.setProperty("/deliveryNo", "");

					MessageBox.error(oDeliveryNo + " mevcut değil.", {
						actions: [MessageBox.Action.CLOSE],
						onClose: function(sAction) {
							jQuery.sap.delayedCall(400, this, function() {
								controller.getView().byId("idInputTeslimatNo").focus();
							});
						}
					});

				}
			}

			function _items(oData, oDeliveryNo, oController) {

				let fnoModel = oController.getModel("deliveryModel");
				let flag = true;
				if (oData.results.length > 0) {

					//Ağırlık kontrol
					if (oData.results[0].EvLfart) {
						fnoModel.setProperty("/weightVisible", true);

						//eğer ağırlığa bakılacaksa, 
						for (let obj of oData.results) {

							if (obj.StatusPick !== "9" || obj.Tamamlandi !== true) {
								flag = false;
								break;
							}

						}
					} else {
						fnoModel.setProperty("/weightVisible", false);

						//eğer ağırlığa bakılacaksa, 
						for (let obj of oData.results) {

							if (obj.StatusPick !== "9") {
								flag = false;
								break;
							}

						}
					}

					if (flag) {
						fnoModel.setProperty("/enabledMalKabul", true);
						fnoModel.setProperty("/enabledAgirlik", false);
					} else {
						fnoModel.setProperty("/enabledMalKabul", false);
						fnoModel.setProperty("/enabledAgirlik", true);
					}

					if (oData.results[0].EvStatus === "9") {
						fnoModel.setProperty("/enabledMalKabul", false);
						fnoModel.setProperty("/enabledAgirlik", false);
					}

				}

				/*			if (oData.results[0].EvMsgty === "E") {

								MessageBox.success(oData.results[0].EvMessage, {
									onClose: function() {

										deliveryModel.setProperty("/deliveryNo", "");
										sap.ui.core.BusyIndicator.hide(0);

										history.go(-1);
									}
								});

							} else if (oData.results[0].EvMsgty === "S") {

								sap.ui.core.BusyIndicator.hide(0);

							}*/

			}
		},

		getLog: function(controller, deliveryNo, ItemNo) {

			const deliveryModel = controller.getView().getModel("deliveryModel"),
				viewModel = controller.getView().getModel("viewModel"),
				oModel = controller.getView().getModel();

			let sPath = "/LogSet",
				aFilters = [],
				oFilters = new Filter({
					filters: [
						new Filter("IvDocno", FilterOperator.EQ, deliveryNo),
						new Filter("IvItemno", FilterOperator.EQ, ItemNo)
					],
					and: true
				});

			aFilters.push(oFilters);

			//	BusyIndicator.show(0);
			this.callODATA(oModel, sPath, aFilters)
				.then(function(oData) {

					for (let i in oData.results) {
						let time = new Date(oData.results[i].Uzeit.ms);
						oData.results[i].time = time.getUTCHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
					}
					deliveryModel.setSizeLimit(9999);
					deliveryModel.setProperty("/LogList", oData.results);

					if (viewModel !== undefined) {
						//toplamı yazar
						let menge = 0;
						for (let i in oData.results) {
							menge = menge + parseInt(oData.results[i].Menge, 10);
						}

						viewModel.setProperty("/menge", menge);

					}
				})
				.catch()
				.finally(() => {

					BusyIndicator.hide(0);
				});
		},
		readTag: function(controller, oEvent) {

			let deliveryModel = controller.getView().getModel("deliveryModel");
			let itemDetailModel = controller.getView().getModel("itemDetailModel");
			let viewModel = controller.getView().getModel("viewModel"),
				input = oEvent.getSource().getValue(),
				inputTable = input.split("|"),
				that = this;

			BusyIndicator.show(0);

			if (inputTable.length !== 4) {
				viewModel.setProperty("/TagNo", "");
				viewModel.refresh(true);

				BusyIndicator.hide(0);

				return MessageBox.error("Barkod okutulamadı.");
			} else {
				viewModel.setProperty("/TagNo", inputTable[0]);
				viewModel.refresh(true);
			}

			/*	
							Docno
							Itemno  			Menge
							Productno  			IvEtiket
							Maktx  			    IvLgpla
							Batchno  			IvPalet
							Qty  		     	EvMenge
							Uom  				EvMessage
							StatusPick      	EvMsgty
						
				30000015|1YARIMAMUL|1000005|10
				*/

			var oEntry = {

					IvLgpla: viewModel.getProperty("/WarehouseNo"),
					IvEtiket: inputTable[0],
					IvPalet: viewModel.getProperty("/PalletNo"),

					Docno: deliveryModel.getProperty("/deliveryNo"),
					Itemno: deliveryModel.getProperty("/ItemNo"),

					Productno: inputTable[1],
					Batchno: inputTable[2],
					Menge: inputTable[3]

				},
				oParams = {};

			oParams.success = function(oData) {

				BusyIndicator.hide(0);
				viewModel.setProperty("/TagNo", "");

				if (oData.EvMsgty === "S") {

					that.getLog(controller, deliveryModel.getProperty("/deliveryNo"), deliveryModel.getProperty("/ItemNo"));

					viewModel.setProperty("/Menge", oData.EvMenge);
					itemDetailModel.setProperty("/Batchno", oData.Batchno);
					MessageToast.show(oData.EvMessage);
				} else {
					MessageBox.error(oData.EvMessage);
				}

				viewModel.refresh(true);

			};
			oParams.error = function() {

				BusyIndicator.hide(0);
				viewModel.setProperty("/TagNo", "");
				viewModel.refresh(true);
			}.bind();
			controller.getView().getModel().create("/ReadTagSet", oEntry, oParams);

		},

		deleteSelectedLog: function(controller) {

			let that = this;
			let deliveryModel = controller.getView().getModel("deliveryModel");

			let oEntry = {
					EvMessage: "",
					EvMsgty: ""

				},
				oParams = {};
			oEntry.NavItems = [];

			var oTable = controller.getView().byId("idDetailTable"),
				aSelectedContexts = oTable.getSelectedContexts();

			if (aSelectedContexts.length === 0) {
				sap.m.MessageBox.error("Etiket Seçiniz");
				return;
			}
			oTable.removeSelections();

			let oModel = {};
			let save = true;
			for (let j in aSelectedContexts) {

				let object = aSelectedContexts[j].getObject();

				oModel.Docno = deliveryModel.getProperty("/deliveryNo");
				oModel.Itemno = deliveryModel.getProperty("/ItemNo");
				oModel.Palet = object.Palet;
				oModel.Etiket = object.Etiket;
				oModel.Lgpla = object.Lgpla;

				oEntry.NavItems.push(JSON.parse(JSON.stringify(oModel)));
			}

			// eğer silinecek barkod seçildiyse, silme işlemler
			if (save) {

				sap.m.MessageBox.information("Etiket silmek istiyor musun?", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					emphasizedAction: sap.m.MessageBox.Action.OK,
					onClose: function(sAction) {

						switch (sAction) {
							case "OK":
								// code block

								sap.ui.core.BusyIndicator.show(0);
								oParams.success = function(oData) {

									if (oData.EvMsgty === "S") {
										sap.m.MessageToast.show(oData.EvMessage);
										that.getLog(controller, deliveryModel.getProperty("/deliveryNo"), deliveryModel.getProperty("/ItemNo"));
									} else {
										sap.m.MessageBox.error(oData.EvMessage);
									}
									sap.ui.core.BusyIndicator.hide(0);

								};
								oParams.error = function() {
									sap.ui.core.BusyIndicator.hide(0);

								}.bind();

								sap.ui.core.BusyIndicator.show(0);
								controller.getView().getModel().create("/LogDeleteHeaderSet", oEntry, oParams);

								break;
							case "CANCEL":
								// code block
								break;
							default:
								// code block
						}

					}
				});

			} else {
				//seçilmediyse gönderme.
				sap.m.MessageBox.error("Tamamlanmış kalemler için silme işlemi yapılamaz.");

			}

		},

		saveLog: function(controller) {

			let deliveryModel = controller.getView().getModel("deliveryModel"),
				that = this;

			let oViewModel = controller.getModel("worklistView"),
				oModel = controller.getView().getModel(),
				deliveryNo = deliveryModel.getProperty("/deliveryNo"),
				ItemNo = deliveryModel.getProperty("/ItemNo");
				let sPath = "/SaveSet",
				aFilters = [],

				sFilter = new Filter({
					filters: [
						new Filter("IvDocno", FilterOperator.EQ, deliveryNo),
						new Filter("IvItemno", FilterOperator.EQ, ItemNo)
					],
					and: true
				});
			aFilters.push(sFilter);

			BusyIndicator.show(0);
			that.callODATA(oModel, sPath, aFilters)
				.then(function(oData) {

					deliveryModel.setProperty("/messages", oData.results);
					that.onMessageOpen(controller);

				/*	if (oData.EvMsgty === "S") {
						MessageBox.success(oData.EvMessage, {
							onClose: function() {
								history.go(-1);
							}
						});
					} else {
						MessageBox.error(oData.EvMessage);
					}*/
				})
				.catch()
				.finally(() => {
					BusyIndicator.hide(0);
				});

		},

		onMessageOpen: function(controller){
			if (!controller._oMesajPopup) {

				controller._oMesajPopup = sap.ui.xmlfragment("com.sahterm.satis_terminal.fragment.message.MessagePopover", controller);
				controller.getView().addDependent(controller._oMesajPopup);
			
			}
			controller._oMesajPopup.openBy(controller.getView().byId("_IDGenButton2"));	
		},

		getAgirlikLog: function(controller, deliveryNo, ItemNo) {

			const viewModel = controller.getView().getModel("viewModel"),
				oModel = controller.getView().getModel();

			let sPath = "/WeightLogSet",
				aFilters = [],
				oFilters = new Filter({
					filters: [
						new Filter("IvDocno", FilterOperator.EQ, deliveryNo),
						new Filter("IvItemno", FilterOperator.EQ, ItemNo)
					],
					and: true
				});

			aFilters.push(oFilters);

			this.callODATA(oModel, sPath, aFilters)
				.then(function(oData) {

					for (let i in oData.results) {
						let time = new Date(oData.results[i].Uzeit.ms);
						oData.results[i].time = time.getUTCHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
					}

					viewModel.setProperty("/AgirlikList", oData.results);

					if (viewModel !== undefined) {
						//toplamı yazar
						let menge = 0;
						for (let i in oData.results) {
							menge = menge + parseInt(oData.results[i].Menge, 10);
						}

						viewModel.setProperty("/menge", menge);
					}

				})
				.catch()
				.finally(() => {

					//focus
					jQuery.sap.delayedCall(400, this, function() {
						controller.getView().byId("idAgirlik").focus();
					});


				});

		},

		readAgirlik: function(controller, oEvent) {

			let deliveryModel = controller.getView().getModel("deliveryModel");
			let viewModel = controller.getView().getModel("viewModel"),
				input = oEvent.getSource().getValue(),
				inputTable = input.split("|"),
				that = this;

			BusyIndicator.show(0);

			if (inputTable.length !== 2) {
				viewModel.setProperty("/agirlik", "");
				viewModel.refresh(true);
				BusyIndicator.hide(0);

				return MessageBox.error("Barkod okutulamadı.");
			} else {
				viewModel.setProperty("/agirlik", "");
				viewModel.refresh(true);
			}

			let oModel = controller.getView().getModel(),

				sPath = controller.getModel().createKey("/WeightReadSet", {
					IvDocno: deliveryModel.getProperty("/deliveryNo"),
					IvItemno: deliveryModel.getProperty("/ItemNo"),
					IvPalet: inputTable[0],
					IvMenge: this._changeNumber(inputTable[1])
				});
			BusyIndicator.show(0);
			that.callODATA(oModel, sPath)
				.then(function(oData) {

					if (oData.EvMsgty === "S") {
						MessageToast.show(oData.EvMessage);
						that.getAgirlikLog(controller, deliveryModel.getProperty("/deliveryNo"), deliveryModel.getProperty("/ItemNo"));
					} else {
						MessageBox.error(oData.EvMessage);
					}
				})
				.catch()
				.finally(() => {
					BusyIndicator.hide(0);
				});

		},

		deleteSelectedAgirlik: function(controller) {

			let that = this;
			let deliveryModel = controller.getView().getModel("deliveryModel");

			let oEntry = {
					EvMessage: "",
					EvMsgty: ""

				},
				oParams = {};
			oEntry.NavItems = [];

			var oTable = controller.getView().byId("idDetailTable"),
				aSelectedContexts = oTable.getSelectedContexts();

			if (aSelectedContexts.length === 0) {
				sap.m.MessageBox.error("Ağırlık Seçiniz");
				return;
			}
			oTable.removeSelections();

			let oModel = {};
			let save = true;
			for (let j in aSelectedContexts) {

				let object = aSelectedContexts[j].getObject();

				oModel.Docno = deliveryModel.getProperty("/deliveryNo");
				oModel.Itemno = deliveryModel.getProperty("/ItemNo");
				oModel.Palet = object.Palet;

				oEntry.NavItems.push(JSON.parse(JSON.stringify(oModel)));
			}

			// eğer silinecek barkod seçildiyse, silme işlemler
			if (save) {

				sap.m.MessageBox.information("Ağırlık silmek istiyor musun?", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					emphasizedAction: sap.m.MessageBox.Action.OK,
					onClose: function(sAction) {

						switch (sAction) {
							case "OK":
								// code block

								sap.ui.core.BusyIndicator.show(0);
								oParams.success = function(oData) {

									if (oData.EvMsgty === "") {
										that.getAgirlikLog(controller, deliveryModel.getProperty("/deliveryNo"), deliveryModel.getProperty("/ItemNo"));

									} else {
										sap.m.MessageBox.error(oData.EvMessage);
									}
									sap.ui.core.BusyIndicator.hide(0);

								};
								oParams.error = function() {
									sap.ui.core.BusyIndicator.hide(0);

								}.bind();

								sap.ui.core.BusyIndicator.show(0);
								controller.getView().getModel().create("/WeightLogDeleteHeaderSet", oEntry, oParams);

								break;
							case "CANCEL":
								// code block
								break;
							default:
								// code block
						}

					}
				});

			} else {
				//seçilmediyse gönderme.
				sap.m.MessageBox.error("Tamamlanmış kalemler için silme işlemi yapılamaz.");

			}

		},

		saveAgirlik: function(controller) {

			let deliveryModel = controller.getView().getModel("deliveryModel"),
				that = this;

			let oModel = controller.getView().getModel(),

				sPath = controller.getModel().createKey("/WeightSaveSet", {
					IvDocno: deliveryModel.getProperty("/deliveryNo")
				});

			BusyIndicator.show(0);
			that.callODATA(oModel, sPath)
				.then(function(oData) {

					if (oData.EvMsgty === "S") {
						MessageBox.success(oData.EvMessage);
						that.getDelivery(controller, controller.getView().getModel("deliveryModel").getProperty("/deliveryNo"), "items");
					} else {
						MessageBox.error(oData.EvMessage);
					}
				})
				.catch()
				.finally(() => {
					BusyIndicator.hide(0);
				});

		},

		saveMalCikis: function(controller) {

			let deliveryModel = controller.getView().getModel("deliveryModel"),
				that = this;

			let oModel = controller.getView().getModel(),

				sPath = controller.getModel().createKey("/MalCikisSaveSet", {
					IvDocno: deliveryModel.getProperty("/deliveryNo"),
					IvFlag: 'S'
				});

			BusyIndicator.show(0);
			that.callODATA(oModel, sPath)
				.then(function(oData) {

					if (oData.EvMsgty === "S") {
						MessageBox.success(oData.EvMessage, {
							onClose: function() {
								history.go(-1);
							}
						});

					} else {
						MessageBox.error(oData.EvMessage);
					}
				})
				.catch()
				.finally(() => {
					BusyIndicator.hide(0);
				});

		},
			_changeNumber: function(iNumber) {
			return iNumber.replaceAll(".", "").replace(",", ".");
		}


	};
});