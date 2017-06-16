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

		var mainTimeline = fl.getDocumentDOM().timelines[0].name;

		//loop through the main timeline
		for (i = 0; i < fl.getDocumentDOM().timelines.length; ++i) {
			this.findColorEffects(fl.getDocumentDOM().timelines[i], true);
		}

		//sort maintimeline results
		if (this.detectResultsMain.length > 0) {
			this.sortMainTimeline();
		}
		this.detectResultsMain.reverse();
		for (var i = 0; i < this.detectResultsNested.length; ++i) {
			this.detectResultsMain.push(this.detectResultsNested[i]);
		}

		this.detectResults = this.detectResultsMain.reverse();

		this.extractStrings();

		//finally trace to window
		this.traceToOutput();

		if (this.detectResults.length > 0) {

			this.queueUpSelection();

		}

	};

	ColorEffectDetect.prototype.extractStrings = function(arr, obj) {

		for (var i = 0; i < this.detectResults.length; ++i) {

			//if (i == this.detectResults.length - 1) {

			//this.makeBorder(totalWidth,"-");
			//this.traceHeading(rowLengths);
			//this.makeBorder(totalWidth, " ");

			//lineString = ">> "

			//} else {
			//	lineString = "   ";
			//}
			/*
			lineString += this.adjustSpacing("[" + this.detectResults[i].timeline.name + "]",rowLengths[0]);
			lineString += this.adjustSpacing(this.detectResults[i].layer.name,rowLengths[1]);
			lineString += this.adjustSpacing(String(this.detectResults[i].frame),rowLengths[2]);
			lineString += this.adjustSpacing(this.detectResults[i].instance.name,rowLengths[3]);
			lineString += this.adjustSpacing(this.detectResults[i].effect,rowLengths[4]);
			lineString += this.adjustSpacing(this.detectResults[i].value,rowLengths[5]);
			*/

			this.detectResultStrings.push({

				timeline: this.detectResults[i].timeline.name
				, layer: this.detectResults[i].layer.name
				, frame: String(this.detectResults[i].frame)
				, instance: this.detectResults[i].instance.name
				, effect: this.detectResults[i].effect
				, value: this.detectResults[i].value

			});

			//fl.trace(lineString);

		}

	}
	/**
	 *  Sort maintimeline objects by frame number
	 *  @sortMainTimeline
	 */
	ColorEffectDetect.prototype.sortMainTimeline = function(arr, obj) {

		//this.mainTimelineOutput.sort(function(a, b){return a.frame - b.frame});

		this.detectResultsMain.sort(function(a, b) {
			var x = a.frame
			var y = b.frame
			if (x < y) {
				return 1;
			}
			if (x > y) {
				return -1;
			}
			return 0;
		});

	}

	ColorEffectDetect.prototype.lockAllLayers = function(tl) {

		for (var i = 0; i < tl.layers.length; ++i) {
			tl.layers[i].locked = true;
		}
	}

	ColorEffectDetect.prototype.traceToOutput = function() {

		//todo make this pretty
		var outputString = "";
		var rowLengths = [];
		var spacing = 5;
		//todo make less junky

		// rowlength initial values
		for (i = 0; i < this.headings.length; ++i) {
			rowLengths[i] = this.headings[i].length + spacing;
			//fl.trace(i+this.headings[i]+this.headings[i].length)
		}
		var totalWidth = 0;
		fl.trace(this.detectResultStrings[0][this.headings[0]])
		for (var i = 0; i < this.detectResultStrings.length; ++i) {
			for (var j = 0; j < rowLengths.length; ++j) {

				rowLengths[j] = Math.max(rowLengths[j], this.detectResultStrings[i][this.headings[
					j]].length + spacing);
				//fl.trace(j+" "+rowLengths[j]+" "+this.detectResults[i][this.headings[j]]+String(this.detectResults[i][this.headings[j]]).length)

			}
			fl.trace(" ")

		}
		fl.trace(rowLengths)
		for (i = 0; i < rowLengths.length; ++i) {
			totalWidth += rowLengths[i];
		}

		this.traceHeading(rowLengths);
		this.makeBorder(totalWidth, "-");
		//-----
		var spacing = "  ";

		var lineString = "";

		for (var i = 0; i < this.detectResultStrings.length; ++i) {

			if (i == this.detectResultStrings.length - 1) {

				this.makeBorder(totalWidth, "-");
				this.traceHeading(rowLengths);
				this.makeBorder(totalWidth, " ");

				lineString = ">> "
				//"----TIMELINE----LAYER----FRAME----INSTANCE----EFFECT----VALUE---- \n";
				//lineString += this.detectResults.length + " items located";
				//lineString += "QUEUED >> ";
			} else {
				lineString = "   ";
			}
			//this.headings = ["timeline", "layer", "frame", "instance", "effect", "value"];
			lineString += this.adjustSpacing("[" + this.detectResultStrings[i][this.headings[
				0]] + "]", rowLengths[0]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[
				1]], rowLengths[1]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[
				2]], rowLengths[2]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[
				3]], rowLengths[3]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[
				4]], rowLengths[4]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[
				5]], rowLengths[5]);
			//lineString += "\n";

			fl.trace(lineString);

		}
		//this.makeBorder(totalWidth,"-");
		//this.traceHeading(rowLengths);

	};

	ColorEffectDetect.prototype.makeBorder = function(tw, thisChar) {
		var borderString = "";

		for (j = 0; j < tw; ++j) {
			borderString += thisChar;
		}
		fl.trace(borderString);
	}
	ColorEffectDetect.prototype.traceHeading = function(rl) {

		var headingLineString = "   ";
		for (j = 0; j < rl.length; ++j) {

			headingLineString += this.adjustSpacing(this.headings[j].toUpperCase(), rl[
				j]);

		}
		// finalStr += res + "\n";
		fl.trace(headingLineString);
	}

	ColorEffectDetect.prototype.adjustSpacing = function(str, len) {
		while (str.length < len) {
			str = str + " ";
		}
		return str;
	}

	ColorEffectDetect.prototype.queueUpSelection = function() {

		/*
		
			this.detectResultsNested.push({
							timeline: tl,
							layer: thisLayer,
							frame: k,
							instance: thisElement.libraryItem,
							effect: thisElement.colorMode,
							value: this.getEffectValue(thisElement), 
							element:thisElement
							});
		*/

		var queued = this.detectResults[this.detectResults.length - 1]
		//queue up selection
		if (this.detectResults.length > 0) {

			//todo find a away to get to main timeline
			fl.getDocumentDOM().exitEditMode();
			fl.getDocumentDOM().exitEditMode();
			fl.getDocumentDOM().exitEditMode();

			this.lockAllLayers(queued.timeline);

			fl.getDocumentDOM().library.editItem(queued.timeline.name);

			var layerIndex = fl.getDocumentDOM().getTimeline().findLayerIndex(queued.layer
				.name);
			//fl.trace(fl.getDocumentDOM().getTimeline().findLayerIndex(queued.layer))
			fl.getDocumentDOM().getTimeline().setSelectedLayers(layerIndex[0], true);

			fl.getDocumentDOM().getTimeline().setSelectedFrames(queued.frame - 1
				, queued.frame);

			//fl.getDocumentDOM().getTimeline().setSelectedLayers(queued.layerNumber);  
			queued.timeline.layers[layerIndex[0]].locked = false;
		}

	}

	ColorEffectDetect.prototype.addSpaces = function(numSpaces) {

		var spaceString = "";

		for (var i = 0; i < numSpaces; ++i) {
			spaceString += " ";
		}

		return spaceString;
	}

	ColorEffectDetect.prototype.init = function() {

		//array of objects found with color effects
		this.detectResults = [];
		this.detectResultsMain = [];
		this.detectResultsNested = [];
		this.detectResultStrings = [];
		//array of elements found to recursively search their timelines and avoid duplication
		this.alreadyDetected = [];

		this.headings = ["timeline", "layer", "frame", "instance", "effect"

			
			, "value"];

		fl.outputPanel.clear();

		fl.trace(
			"------------------------------ Color Effect Detect ------------------------------"
		);

	};

	ColorEffectDetect.prototype.findColorEffects = function(tl, isMain) {

		var thisLayer;
		var thisFrame;
		var originalVisibility;
		var thisElement;

		for (var j = tl.layers.length - 1; j >= 0; --j) {
			thisLayer = tl.layers[j];

			for (var k = 0; k < thisLayer.frames.length;) {

				thisFrame = thisLayer.frames[k]; //todo do we need to skip guided layers?

				for (var l = 0; l < thisFrame.elements.length; ++l) {

					thisElement = thisFrame.elements[l];
					if (thisElement.elementType == "instance" && thisElement.instanceType ==
						"symbol" && thisLayer.layerType != "guide") {
						if (this.isColorized(thisElement)) {

							if (isMain) {
								this.detectResultsMain.push({
									timeline: tl
									, layer: thisLayer
									, frame: k + 1
									, instance: thisElement.libraryItem
									, effect: thisElement.colorMode
									, value: this.getEffectValue(thisElement)
									, element: thisElement
								});
							} else {
								this.detectResultsNested.push({
									timeline: tl
									, layer: thisLayer
									, frame: k + 1
									, instance: thisElement.libraryItem
									, effect: thisElement.colorMode
									, value: this.getEffectValue(thisElement)
									, element: thisElement
								});
							}

						}
fl.trace(thisElement.libraryItem)
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

		switch (el.colorMode) {
			case "brightness":
				effectValueString = String(el.brightness + "%");
				break;
			case "tint":
				effectValueString = String(el.tintColor);
				effectValueString += " at ";
				effectValueString += String(el.tintPercent + "%");
				break;
			case "advanced":
				effectValueString = String("A:" + el.colorAlphaAmount);
				effectValueString += String(" R:" + el.colorRedAmount);
				effectValueString += String(" G:" + el.colorGreenAmount);
				effectValueString += String(" B:" + el.colorBlueAmount);

				break;
			default:
				effectValueString = "null";
		}

		return effectValueString;
	};

	//checks to see if this element meets criteria we're looking for
	ColorEffectDetect.prototype.isColorized = function(el) {

		if (el.colorMode != "none" && el.colorMode != "alpha") {
			return true;
		}

		return false;
	};

	//search inside any symbol timelines on stage
	ColorEffectDetect.prototype.searchElement = function(libItem) {

		//if we have found this already, abort
		if (this.alreadyDetected.indexOf(libItem.timeline.name) != -1) {
			return;
		}

		//new find, search its timeline
		if (libItem.itemType == "movie clip" || libItem.itemType == "graphic") {
			this.alreadyDetected.push(libItem.timeline.name);
			this.findColorEffects(libItem.timeline, false);
		}

	};

	new ColorEffectDetect;

}());