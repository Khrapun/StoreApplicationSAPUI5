sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/m/Dialog",
	"sap/ui/model/FilterOperator"
], function (Controller, Dialog, Filter, FilterOperator) {
	"use strict";

	/**
     * Controller for stores list
     * @class
     */

	return Controller.extend("khrapun.pavel.controller.FirstPage", {

	/**
    * Navigate to details of a selected store
    *
    * @listens press
    *
    * @param {sap.ui.base.Event} oEvent event object
    *
    */


	onNavPress: function(oEvent){
	  var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	  
      oRouter.navTo("secondPage", {
		  id: oEvent.getSource().getBindingContext("odata").getPath().substr(1)
	  });
	},
	
	onFilterInvoices : function (oEvent) {
		// add filter for search stores by substring
		var aFilter;
		var sQuery = oEvent.getSource().getValue();
		if (sQuery) {
			aFilter = new Filter([new Filter ("Name", FilterOperator.Contains, sQuery), 
			new Filter ("Address", FilterOperator.Contains, sQuery)]);
		}

		// update list binding
		
		var oList = this.byId("idList");
		var oBinding = oList.getBinding("items");
		oBinding.filter(aFilter, "Application");
	},

	/**
    * Create new store
    *
    * @listens press
    *
    */

	onCreateStorePress: function() {

		var oView = this.getView();

        var oODataModel = oView.getModel("odata");

        if (!this.oDialog) {
          this.oDialog = sap.ui.xmlfragment(
            oView.getId(),
            "khrapun.pavel.view.fragments.StoreDialog",
			this
		  );
		  
		  oView.addDependent(this.oDialog);
		};

        // "createEntry" method to
        // 1. create a context based on the entity type
        // 2. add the "create" request to the request queue

		var oEntryCtx = oODataModel.createEntry("/Stores");
  
		// set binding context to the dialog

		this.oDialog.setBindingContext(oEntryCtx);
  
 		// set default model to allow relative binding without a need to specify model's name

		this.oDialog.setModel(oODataModel);
  
		// open dialog

		this.oDialog.open()
	},

	/**
    * Send the new store to the server and close dialog
    *
    * @listens press
    *
    */

	onDialogCancelPress: function() {
        var oODataModel = this.getView().getModel("odata");

        var oCtx = this.oDialog.getBindingContext();

        oODataModel.deleteCreatedEntry(oCtx);

        this.oDialog.close();
    },


	/**
    * Close store creation dialog
    *
    * @listens press
    *
    */

	onDialogCreatePress: function() {
        var oODataModel = this.getView().getModel("odata");

        oODataModel.submitChanges();

        this.oDialog.close();
    }
	});
});