(function(){
	
	/**
	*	Non-circular radial gradients do not export to HTML5 cavas very well.
	*	This command will make the x/y scale equal on the larger value of the two.
	*	The selected shape must have a gradient fill to work.
	*	Bind to a key for the quickness.
	*/
	var AlphaZero = function()
	{
		
		fl.trace("\n----------------- Alpha Zero -----------------");
	
		//check for a selection
		if(!fl.getDocumentDOM().selection.length){
			this.errored("You must select something first!");
			return;
		}
		
		var thisElement = fl.getDocumentDOM().selection[0];
		
		//make sure selection is a shape
		if(thisElement.elementType != "instance"){
			this.errored("Your selection just be an instance");
			return;
		}


		thisElement.colorMode = "alpha";
		fl.getDocumentDOM().setInstanceAlpha(0);

		fl.trace(thisElement.libraryItem.name +" set to alpha 0")
	};
	
	
	AlphaZero.prototype.errored = function (errorMessage) {
		alert("Alpha Zero: " +errorMessage);
		fl.trace("ERROR: "+errorMessage);
	}
	
	new AlphaZero;
	
}());