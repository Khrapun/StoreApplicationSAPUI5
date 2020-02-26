sap.ui.define([], function () {
	"use strict";
	return {
    statusColor: function (sStatus) {
		switch (sStatus) {
			case "OK":
                return 'Success';
            case "OUT_OF_STOCK":
                return 'Indication01'
			case "STORAGE":
				return 'Indication03';
			default:
				return 'Indication01';
		}
    }

	};
});
