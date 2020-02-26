sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  'sap/m/MessageBox',
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/Dialog"
], function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, Dialog) {
	"use strict";

    /**
    * Controller for products list
    * @class
    */

	return Controller.extend("khrapun.pavel.controller.SecondPage", {

    onInit: function () {

      /**
      * Controller's "init" lifecycle method.
      */

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      
      var oViewModel = new JSONModel({
        all: 0,
        ok: 0,
        storage: 0,
        outOfStock: 0
      });

      this.getView().setModel(oViewModel, 'counts');

      // set filters to sort by status

      this._mFilters = {
        "ok": [new Filter("Status", FilterOperator.EQ, "OK")],
        "storage": [new Filter("Status", FilterOperator.EQ, "STORAGE")],
        "outOfStock": [new Filter("Status", FilterOperator.EQ, "OUT_OF_STOCK")],
        "all": []
      };

      oRouter.getRoute("secondPage").attachPatternMatched(this._onObjectMatched, this);

    },

    /**
    * Controller's lifecycle method, fill icon counters at the end of the update
    */

    
    onupdateFinished(keyStore) {

      var oView = this.getView();
      var oOdataModel = oView.getModel('odata');
      var oModel = this.getView().getModel('counts');

      oOdataModel.read("/" + keyStore + "/rel_Products/$count", {
          context: oView.getBindingContext('odata'),
          success: oData => oModel.setProperty("/all", oData),
        });

        oOdataModel.read("/" + keyStore + "/rel_Products/$count", {
          context: oView.getBindingContext('odata'),
          success: oData => oModel.setProperty("/ok", oData),
          filters: this._mFilters.ok
        });

        oOdataModel.read("/" + keyStore + "/rel_Products/$count", {
          context: oView.getBindingContext('odata'),
          success: oData => oModel.setProperty("/storage", oData),
          filters: this._mFilters.storage
        });  
        oOdataModel.read("/" + keyStore + "/rel_Products/$count", { 
          context: oView.getBindingContext('odata'),
          success: oData => oModel.setProperty("/outOfStock", oData),
          filters: this._mFilters.outOfStock
        });	 
    },

    /**
    * "SecondPage" route object matched event handler
    *
    * @param {sap.ui.base.Event} oEvent event object.
    */


		_onObjectMatched: function (oEvent) {

      // this method takes the name of EntitySet (collection) and map of key parameters

			this.getView().bindElement({
				path: "/"+oEvent.getParameter("arguments").id,
				model: "odata"
      });
      
      this.onupdateFinished(oEvent.getParameter("arguments").id)
    },
    
    /**
    * Navigate to stores list page
    *
    * @listens press
    *
    * @param {sap.ui.base.Event} oEvent the event object
    *
    */


		onNavPressFirst: function(){
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("firstPage");
    },

    /**
    * Navigate to details of a selected product
    *
    * @listens press
    *
    * @param {sap.ui.base.Event} oEvent the event object
    *
    */

    onNavPressThird: function(oEvent){
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("thirdPage", {
		  id: oEvent.getSource().getBindingContext("odata").getPath().substr(1)
	  });
    },

    /**
    * function for viewing products by status
    */


    handleIconTabBarSelect: function(oEvent) {
      let sKey = oEvent.getParameter("key");
      const oprdouctsList = this.byId("productsTable");
      const oprdouctsListBinding = oprdouctsList.getBinding("items");
      if(sKey === 'all') {
        oprdouctsListBinding.filter();
      }
      else if(sKey === 'ok') {
        oprdouctsListBinding.filter(new Filter("Status", FilterOperator.EQ, "OK"));
      }
      else if (sKey === 'storage') {
        oprdouctsListBinding.filter(new Filter("Status", FilterOperator.EQ, "STORAGE"));
      } 
      else if(sKey === 'outOfStock') {
        oprdouctsListBinding.filter(new Filter("Status", FilterOperator.EQ, "OUT_OF_STOCK"));
      }
    },

    // add filter for search product by substring

    onFilterInvoices : function (oEvent) {
      var aFilter;
      var sQuery = oEvent.getSource().getValue();
      if (sQuery) {
        aFilter = new Filter([new Filter ("Name", FilterOperator.Contains, sQuery), 
        new Filter ("Specs", FilterOperator.Contains, sQuery),
        new Filter ("MadeIn", FilterOperator.Contains, sQuery),
        new Filter ("ProductionCompanyName", FilterOperator.Contains, sQuery)]);
      }
  
      
      var oList = this.byId("productsTable");
      var oBinding = oList.getBinding("items");
      oBinding.filter(aFilter, "Application");
    },

    /**
    * Open the dialog and create new product
    *
    * @listens press
    *
    */

    onProdDialogCreate: function() {
      var oView = this.getView();

      var oODataModel = oView.getModel("odata");

      var storeId = this.getView().getBindingContext('odata').sPath.replace(/\D+/g,"");

      if (!this.oDialog) {
        this.oDialog = sap.ui.xmlfragment(
          oView.getId(),
          "khrapun.pavel.view.fragments.ProductDialog",
          this
        );

        oView.addDependent(this.oDialog);
      };

      // call "createEntry" method to
      // 1. create a context based on the entity type
      // 2. add the "create" request to the request queue

      var oEntryCtx = oODataModel.createEntry("/Products", {
        properties: {
          StoreId: storeId,
          Status: "OK"
        }
      });

    // set context to the dialog

      this.oDialog.setBindingContext(oEntryCtx);

    // set default model to allow relative binding without a need to specify model's name

      this.oDialog.setModel(oODataModel);

    // open dialog

      this.oDialog.open();
    },

    /**
    * Send new store to the server and close dialog
    *
    * @listens press
    *
    */

    onDialogCreatePress: function() {
      var oODataModel = this.getView().getModel("odata");

      oODataModel.submitChanges();

      this.oDialog.close();

      MessageToast.show('Product add.');
    },


    /**
    * Close store creation dialog
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
    * Function to display an error message
    *
    * @param {sap.ui.base.Event} oEvent event object.
    */

    handleValidationError: function(oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
    },
    
    /**
    * Function shows that everything is fine
    *
    * @param {sap.ui.base.Event} oEvent event object.
    */
		
		handleValidationSuccess: function(oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.Success);
		},

    /**
    * Open product edit dialog
    *
    * @listens press
    *
    * @param {sap.ui.base.Event} oEvent the event object
    */

    onEditProdPress: function(oEvent) {
      var oView = this.getView();

      if (!this.oDialog) {
        this.oDialog = sap.ui.xmlfragment(
          oView.getId(),
          "khrapun.pavel.view.fragments.EditProductDialog",
          this
        );

        oView.addDependent(this.oDialog);
      }

      var oCtx = oEvent.getSource().getBindingContext("odata");

      this.oDialog.setModel(oCtx.getModel());

      this.oDialog.setBindingContext(oCtx);

      this.oDialog.open();
    },

    /**
    * Delete product from odata model
    *
    * @listens press
    *
    * @param {sap.ui.base.Event} oEvent the event object
    */


    handleConfirmationDeleteProductMessageBoxPress: function(oEvent) {
      var productKey = oEvent.getSource().getBindingContext("odata").sPath;
      var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
				"Are you sure you want to delete this product?", (oAction) => {
          if(oAction !== "OK") {
            return
          }
          var oODataModel = this.getView().getModel("odata");
          oODataModel.remove(productKey, {
            success: function() {
              MessageToast.show("Product was successfully removed!");
            },
            error: function() {
              MessageBox.error("Error while removing product!");
            }});
          }, 
        {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
        },
      );
    },

    /**
    * Delete store from odata model
    *
    * @listens press
    *
    * @param {sap.ui.base.Event} oEvent the event object
    */

    handleConfirmationDeleteStoreMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
				"Are you sure you want to delete this store?", (oAction) => {
          if(oAction !== "OK") {
            return
          };
          var oODataModel = this.getView().getModel("odata");
          oODataModel.remove(this.getView().getBindingContext('odata').sPath, {
            success: function() {
              MessageToast.show("Store was successfully removed!");
              oRouter.navTo("");
            },
            error: function() {
              MessageBox.error("Error while removing store!");
            }});
        }, {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
        },
      );
    },
    // onSortButtonPressed: function(oEvent) {
    //  let columnParam = oEvent.getSource().getParent().getParent()
    //  console.log(columnParam)

    //  const oprdouctsList = this.byId("productsTable");
    //  const oprdouctsListBinding = oprdouctsList.getBinding("items");

    //  oBinding = oTable.getBinding("items"),


    //  mParams = oEvent.getParameters(),
    //  sPath,
    //  bDescending,
    //  aSorters = [];

    //   sPath = mParams.sortItem.getKey();
    //   bDescending = mParams.sortDescending;
    //   aSorters.push(new Sorter(sPath, bDescending));

    //   // apply the selected sort and group settings
    //   oprdouctsListBinding.sort(aSorters);
    // } 
	});
});
