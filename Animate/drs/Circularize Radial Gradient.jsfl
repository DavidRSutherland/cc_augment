(function(){
	
	/**
	*	Non-circular radial gradients do not export to HTML5 cavas very well.
	*	This command will make the x/y scale equal on the larger value of the two.
	*	The selected shape must have a gradient fill to work.
	*	Bind to a key for the quickness.
	*/
	var CircularizeRadialGradient = function()
	{
		
		fl.trace("\n----------------- Circularize Radial Gradient -----------------");
	
		//check for a selection
		if(!fl.getDocumentDOM().selection.length){
			this.errored("You must select something first!");
			return;
		}
	
		var thisElement = fl.getDocumentDOM().selection[0];
		
		//make sure selection is a shape
		if(thisElement.elementType != "shape"){
			this.errored("Your selection just be a shape.");
			return;
		}
		
		//make sure shape has gradient
		if(thisElement.getCustomFill().style != "radialGradient"){
			
			this.errored("No radial gradient fill detected.");
			return;
		}
	
		//get the original fill
		var elFill = thisElement.getCustomFill();	
		//init a new fill
		var newFill = fl.getDocumentDOM().getCustomFill();
		newFill.style = 'radialGradient';
		newFill.colorArray = elFill.colorArray;
		newFill.posArray = elFill.posArray;
		newFill.focalPoint = elFill.focalPoint;
		newFill.linearRGB = elFill.linearRGB;
		newFill.overflow = elFill.overflow;
		newFill.matrix = {};

		//placeholder matrix values that control x/y scale axis
		var matA = 0;//x axis scale
		var matD = 0;//y axis scale
		var matB = 0;//vertical skew
		var matC = 0;//horizontal skew

		//make x/y axis scale the same by defaulting to bigger scale
		if(elFill.matrix.a > elFill.matrix.d){
			matA = elFill.matrix.a;
			matD = elFill.matrix.a;
			matB = elFill.matrix.a;
			matC = elFill.matrix.a;
		}else{
			matA = elFill.matrix.d;
			matD = elFill.matrix.d;
			matB = elFill.matrix.d;
			matC = elFill.matrix.d;
		}
	
		//make a new matrial based on legacy values
		var mat = newFill.matrix;
		mat.a = matA;//replace with new
		mat.b = 0;//reset vertical skew
		mat.c = 0;//reset horizontal skew
		mat.d = matD;//replace with new
		mat.tx = elFill.matrix.tx;
		mat.ty = elFill.matrix.ty;

		//new seyt the new fill
		thisElement.setCustomFill(newFill);
		
		fl.trace("Radial gradient circularized");
		//fl.trace("------------------------------------------------------");
	};
	
	CircularizeRadialGradient.prototype.errored = function (errorMessage) {
		alert("Circularize Radial Gradient: " +errorMessage);
		fl.trace("ERROR: "+errorMessage);
		//fl.trace("------------------------------------------------------");
	}
	
	new CircularizeRadialGradient;
	
}());