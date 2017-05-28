! function() {

	/**
	 *  Delete Unused Library Items
	 *	DavidRSutherland - davers.com
	 *
	 *  Selects and deletes all unused library items for cleaning up files
	 */

	var deleteUnused = function() {

		//init output panel
		fl.outputPanel.clear();

		var items = fl.getDocumentDOM().library.unusedItems;

		//no items to delete
		if (items.length == 0) {
			fl.trace("No unused items");
			return;
		}
		
		//opening message
		fl.trace("--------- Deleting unused library items... ---------");

		//trace out results and delet item all in one go.
		for (var i in items) {
			fl.trace("[" + i + "] " + items[i].name);
			fl.getDocumentDOM().library.deleteItem(items[i].name);
		}

		//end message
		fl.trace("---------- " + items.length + " unused library items deleted. ----------");

	}


	new deleteUnused;
}();