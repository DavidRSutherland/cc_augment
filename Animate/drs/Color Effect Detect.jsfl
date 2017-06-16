(function() {

	/**
	 *  Color Effect Detect
	 *	DavidRSutherland - davers.com
	 *
	 *  Color effects in native Flash animation get converted to CreateJS filters when exporting for HTML canvas
	 *  This script helps to identify all the symbols with color effects applied by tracing them to the output panel
	 */

	function ColorEffectDetect() {

		//initialize and clear
		this.init();

		//loop through the main timeline
		for (i = 0; i < fl.getDocumentDOM().timelines.length; ++i) {
			this.findColorEffects(fl.getDocumentDOM().timelines[i]);
		}

		//finally trace to window
		this.traceToOutput();

	};

	
	ColorEffectDetect.prototype.traceToOutput = function() {
		//todo make this pretty
		var outputString = "";
		var rowLengths = [];
		var spacing = 5;
		//todo make less junky
		
		
		// rowlength initial values
        for (i = 0; i < this.headings.length; ++i) {
            rowLengths[i] = this.headings[i].length + spacing;
        }
		
		for (i = 0; i < this.colorizedObjects.length; ++i) {
			for (j = 0; j < rowLengths.length; ++j) {
				
				rowLengths[j] = Math.max(rowLengths[j], String(this.colorizedObjects[i][this.headings[j]]).length + spacing);
				fl.trace(j+" "+rowLengths[j]+" "+String(this.colorizedObjects[i][this.headings[j]]).length)
				
			}
		}
		
		fl.trace(rowLengths)
		
		var lineString = "";
		var co = [];
		for (var i = 0; i < this.colorizedObjects.length; ++i) {
			co = this.colorizedObjects[i];
			
			lineString = " ";
			for (j = 0; j < this.headings.length; ++j) {
				
				
				//fl.trace(rowLengths[j]+this.colorizedObjects[i][this.headings[j]].length);
				//var entryLength = this.colorizedObjects[i][this.headings[j]].length;
				//var numSpaces = rowLengths[j] - entryLength;
				//fl.trace(numSpaces);
				lineString += co[this.headings[j]];
				lineString += this.addSpaces(rowLengths[j]- co[this.headings[j]].length);
			}
		//fl.trace(i+" "+j);
			fl.trace(lineString);
			
		}
		
		
		
		//fl.trace("rowLengths "+rowLengths);

	};
	

	
	
	ColorEffectDetect.prototype.addSpaces = function(numSpaces) {
		
		var spaceString = "";
		
		for (var i = 0; i < numSpaces; ++i) {
			spaceString += " ";
		}
			
		return spaceString;
	}

	
	ColorEffectDetect.prototype.traceToOutput2 = function() {
		//todo make this pretty
		var outputString = "";
		//todo make less junky
		for (i = 0; i < this.colorizedObjects.length; ++i) {
			var co = this.colorizedObjects[i];
			outputString += String(co.timeline) + ", ";
			outputString += String(co.el.libraryItem.name) + ", ";
			outputString += String(co.layer) + ", ";
			outputString += String(co.frame) + ", ";
			outputString += String(co.el.colorMode) + ", ";
			if (co.el.colorMode == "tint") { //break out into helper function
				outputString += String(co.el.tintColor) + " ";
			}
			fl.trace(outputString);
			var outputString = "";
		}

	};

	ColorEffectDetect.prototype.init = function() {

		//array of objects found with color effects
		this.colorizedObjects = [];

		//array of elements found to recursively search their timelines and avoid duplication
		this.elementsFound = [];

		this.headings = ["Timeline", "Layer Name", "Frame Number", "Instance Name", "Effect Type", "Effect Value"];
		
		fl.outputPanel.clear();
		
		fl.trace("---------- Color Effect Detect ----------");

	};

	ColorEffectDetect.prototype.findColorEffects = function(tl, tlName) {

		var thisLayer;
		var thisFrame;
		var originalVisibility;
		var thisElement;
		
		for (var j = tl.layers.length - 1; j >= 0; --j) {
			thisLayer = tl.layers[j];

			for (var k = 0; k < thisLayer.frames.length; ++k) {

				thisFrame = thisLayer.frames[k]; //todo do we need to skip guided layers?

				for (var l = 0; l < thisFrame.elements.length; ++l) {

					thisElement = thisFrame.elements[l];

					if (this.isColorized(thisElement)) {

					
				
					
						this.colorizedObjects.push({"Timeline": tl.name,"Layer Name": thisLayer.name,"Frame Number": String(k),"Instance Name": thisElement.libraryItem.name,"Effect Type": String(thisElement.colorMode),"Effect Value": this.getEffectValue(thisElement)});
						

						//search this element's timeline (if there is one)
						this.searchElement(thisElement.libraryItem);

					}

				}

				//jump the keyframe duraction otherwise it will grab every non-keyframe
				k += thisFrame.duration;
			}

		}

	};

	//checks to see if this element meets criteria we're looking for
	ColorEffectDetect.prototype.getEffectValue = function(el) {

		
		var effectValueString = "";
		
		switch(el.colorMode) {
			case "“brightness”":
				effectValueString = String(el.brightness);
				break;
			case "tint":
				effectValueString = String(el.tintColor);
				effectValueString += " at ";
				effectValueString += String(el.tintPercent +"%");
				break;
			case "advanced":
				effectValueString = String("R:"+el.colorRedAmount);
				effectValueString += String(" G:"+el.colorGreenAmount);
				effectValueString += String(" B:"+el.colorBlueAmount);
				effectValueString += String(" Alpha:"+el.colorAlphaAmount);
		
				break;
			default:
				effectValueString = "null";
		}

		

		return effectValueString;
	};
	
	//checks to see if this element meets criteria we're looking for
	ColorEffectDetect.prototype.isColorized = function(el) {

		if (el.elementType == "instance" && el.instanceType == "symbol") {

			if (el.colorMode != "none" && el.colorMode != "alpha") {
				return true;
			}
		}

		return false;
	};

	//search inside any symbol timelines on stage
	ColorEffectDetect.prototype.searchElement = function(libItem) {

		//if we have found this already, abort
		if (this.elementsFound.indexOf(libItem.timeline.name) != -1) {
			return;
		}

		//new find, search its timeline
		if (libItem.itemType == "movie clip" || libItem.itemType == "graphic") {
			this.elementsFound.push(libItem.timeline.name);
			this.findColorEffects(libItem.timeline);
		}

	};

	new ColorEffectDetect;

}());