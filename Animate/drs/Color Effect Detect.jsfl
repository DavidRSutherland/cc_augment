(function () {

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

		//array of objects found with color effects
		this.colorizedObjects = [];

		//loop through the main timeline
		for (i = 0; i < fl.getDocumentDOM().timelines.length; ++i) {
			this.findColorEffects(fl.getDocumentDOM().timelines[i]);
		}

		//finally trace to window
		this.traceToOutput();

	};

	ColorEffectDetect.prototype.traceToOutput = function () {
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


	ColorEffectDetect.prototype.init = function () {
		fl.outputPanel.clear();
		fl.trace("---------- Color Effect Detect ----------");

	};

	ColorEffectDetect.prototype.findColorEffects = function (tl, tlName) {

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

						//fl.trace(thisElement)
						//todo drill down into symbol timelines
						this.colorizedObjects.push({
							timeline: tl.name,
							frame: k + 1,
							layer: thisLayer.name,
							el: thisElement
						});

					}

				}

				//jump the keyframe duraction otherwise it will grab every non-keyframe
				k += thisFrame.duration;
			}

		}

	};

	//checks to see if this element meets criteria we're looking for
	ColorEffectDetect.prototype.isColorized = function (el) {

		if (el.elementType == "instance" && el.instanceType == "symbol") {

			if (el.colorMode != "none" && el.colorMode != "alpha") {
				return true;
			}
		}

		return false;
	};




	new ColorEffectDetect;


}());