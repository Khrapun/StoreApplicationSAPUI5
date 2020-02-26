sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, formatter,MessageToast, DateFormat, JSONModel, Filter, FilterOperator) {
	"use strict";

	/**
     * Controller for product info
     * @class
     */

	return Controller.extend("khrapun.pavel.controller.ThirdPage", {
		formatter: formatter,
      /**
       * Controller's "init" lifecycle method.
       */


	onInit: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("thirdPage").attachPatternMatched(this._onObjectMatched, this);
		},

    /**
    * "Product info" route pattern matched event handler
    *
    * @param {sap.ui.base.Event} oEvent event object.
    */

	_onObjectMatched: function (oEvent) {

		let productId = oEvent.getParameter("arguments").id.replace(/\D+/g,"");

		this.getView().bindElement({
			path: "/"+oEvent.getParameter("arguments").id,
			model: "odata"
		});
		this.byId("comments-list").bindObject({
			path: "/ProductComments",
			model: "odata"
		})

		const oCommentsList = this.byId("comments-list");
		const oCommentsListBinding = oCommentsList.getBinding("items");
		oCommentsListBinding.filter(new Filter("ProductId", FilterOperator.EQ, productId))
	},

	onOpenNavFirst: function(){
		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		oRouter.navTo("firstPage");
		},

	onOpenNavSecond: function(){
		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		oRouter.navTo("secondPage", {
			id: this.getView().getBindingContext('odata').sPath
		  });
	  },

	/**
    * Post new comment
    *
    * @listens press
    *
    * @param {sap.ui.base.Event} oEvent the event object
    *
    */

	onPost: function(oEvent) {
		var sValue = oEvent.getParameter("value");
		var oNewComment = {
			Author: this.byId('authorInput').getValue(),
			Message: sValue,
			Rating: this.byId('ratingInput').getValue(),
			Posted: new Date().toISOString(),
			ProductId: this.getView().getBindingContext('odata').sPath.replace(/\D+/g,"")
		};

		const oOdataModel = this.getView().getModel('odata')

		oOdataModel.create('/ProductComments', oNewComment, {
			success: () => {
				MessageToast.show('Comment add.');
				this.byId('authorInput').setValue('');
				this.byId('ratingInput').setValue(0);
			}
		});
	}

	});
});