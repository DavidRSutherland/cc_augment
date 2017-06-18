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

		if (!this.detectResultsMain.length && !this.detectResultsNested.length) {
			this.noResults();
			return;
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

		//extract strings to trace out
		this.extractStrings();

		//trace pretty to window
		this.traceToOutput();

		//queue up symbo for edit
		this.queueUpSelection();
	};

	//initialize all the things
	ColorEffectDetect.prototype.init = function() {

		//array of objects found with color effects
		this.detectResults = [];
		this.detectResultsMain = []; //just the main timeline
		this.detectResultsNested = []; //just the symbol objects in nested timelines
		this.detectResultStrings = []; //only the strings
		//array of elements found to recursively search their timelines and avoid duplication
		this.alreadyDetected = [];
		//colors for autozap
		this.zapTintColors = ["#D9F2FD"];
		//headings of the info we need
		this.headings = ["count", "timeline", "layer", "frame", "symbol", "effect", "value"];
		//reset the output panel of previous junk
		fl.outputPanel.clear();
	};

	ColorEffectDetect.prototype.noResults = function() {
		this.traceTitle(50, "*");
		fl.trace("0 RESULTS FOUND");
	}

	//extract the required strings to trace out, not the most elegant way
	ColorEffectDetect.prototype.extractStrings = function(arr, obj) {

		for (var i = 0; i < this.detectResults.length; ++i) {
			this.detectResultStrings.push({
				count: String(i + 1)
				, timeline: "[" + this.detectResults[i].timeline.name + "]"
				, layer: this.detectResults[i].layer.name
				, frame: String(this.detectResults[i].frame)
				, symbol: this.detectResults[i].symbol.name
				, effect: this.detectResults[i].effect
				, value: this.detectResults[i].value
			});
		}
	}

	//Sort maintimeline objects by frame number
	ColorEffectDetect.prototype.sortMainTimeline = function(arr, obj) {

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

	//lock all other layers just to make it apparent what layer contains the symbols to be edited
	ColorEffectDetect.prototype.lockAllLayers = function(tl) {

		for (var i = 0; i < tl.layers.length; ++i) {
			tl.layers[i].locked = true;
		}
	}

	//forma the strings for a pretty easy to read output window trace
	ColorEffectDetect.prototype.traceToOutput = function() {

		//the maximun width of rows
		var rowLengths = [];
		//extra spaces between row entries
		var spacing = 3;

		// rowlength initial values
		for (i = 0; i < this.headings.length; ++i) {
			rowLengths[i] = this.headings[i].length + spacing;
		}

		//find the maximum width of each column so we can format the rows pretty-like
		for (var i = 0; i < this.detectResultStrings.length; ++i) {
			for (var j = 0; j < rowLengths.length; ++j) {
				rowLengths[j] = Math.max(rowLengths[j], this.detectResultStrings[i][this.headings[j]].length + spacing);
			}
		}

		//the total width of the block of text
		var totalWidth = 0;
		for (i = 0; i < rowLengths.length; ++i) {
			totalWidth += rowLengths[i];
		}

		this.traceTitle(totalWidth, "*");
		//trace out the headings
		this.traceHeading(rowLengths);
		//trace out a border 
		this.makeBorder(totalWidth, "-");

		var lineString = ""; //the string that we build onto

		for (var i = 0; i < this.detectResultStrings.length; ++i) {

			//at the end do some custom string output
			if (i == this.detectResultStrings.length - 1) {

				//this.makeBorder(totalWidth, "-");
				//this.traceHeading(rowLengths);
				//fl.trace(this.detectResultStrings.length+" instances found with color effects");
				//this.makeBorder(totalWidth, " ");

				lineString = ">> "
			} else {
				//otherwise just reset the string
				//lineString = (i+1)+"  ";//add numbers?
				lineString = "   ";
			}
			//build the strings, this is not pretty
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[0]], rowLengths[0]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[1]], rowLengths[1]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[2]], rowLengths[2]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[3]], rowLengths[3]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[4]], rowLengths[4]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[5]], rowLengths[5]);
			lineString += this.adjustSpacing(this.detectResultStrings[i][this.headings[6]], rowLengths[6]);
			//trace it out right away, maybe consider capturing all and tracing out once
			fl.trace(lineString);
		}

		this.makeBorder(totalWidth, "-");
		this.traceHeading(rowLengths);
	};

	//the headig text
	ColorEffectDetect.prototype.traceHeading = function(rl) {

		var headingLineString = "   ";
		for (j = 0; j < rl.length; ++j) {
			headingLineString += this.adjustSpacing(this.headings[j].toUpperCase(), rl[j]);
		}
		fl.trace(headingLineString);
	}

	//just a border with a custom string char
	ColorEffectDetect.prototype.makeBorder = function(tw, thisChar) {
		var borderString = "";

		for (j = 0; j < tw; ++j) {
			borderString += thisChar;
		}
		fl.trace(borderString);
	}

	//just a border with a custom string char
	ColorEffectDetect.prototype.traceTitle = function(tw, thisChar) {
		var borderString = "";
		var titleString = " COLOR EFFECT DETECT ";

		var sideWidth = (tw / 2) - titleString.length / 2;
		for (i = 0; i < sideWidth; ++i) {
			borderString += thisChar;
		}
		borderString += titleString
		for (i = 0; i < sideWidth; ++i) {
			borderString += thisChar;
		}
		fl.trace(borderString);
	}

	//add empty spaced to line up the columns
	ColorEffectDetect.prototype.adjustSpacing = function(str, len) {
		while (str.length < len) {
			str = str + " ";
		}
		return str;
	}

	//select the current symbol for manual editing
	ColorEffectDetect.prototype.queueUpSelection = function() {

		var queued = this.detectResults[this.detectResults.length - 1]

		if (this.detectResults.length > 0) {

			//if we are within a symbols timeline and the target timeline is main
			//todo fix this
			if (fl.getDocumentDOM().getTimeline().name != queued.timeline.name) {
				fl.getDocumentDOM().exitEditMode();
				fl.getDocumentDOM().exitEditMode();
				fl.getDocumentDOM().exitEditMode();

			}
			var targetTimeline = "";
			if (queued.timeline.libraryItem) {
				targetTimeline = queued.timeline.libraryItem.name;
			} else {
				targetTimeline = queued.timeline.name;
			}

			fl.getDocumentDOM().library.editItem(targetTimeline); //main timeline
			//go to layer
			fl.getDocumentDOM().getTimeline().setSelectedLayers(queued.layerIndex, true);
			//go to frame
			fl.getDocumentDOM().getTimeline().setSelectedFrames(queued.frame - 1, queued.frame);
			this.lockAllLayers(queued.timeline);
			//unlock target layer
			queued.timeline.layers[queued.layerIndex].locked = false;

		}

	}

	//serach for symbol instances with coor effects
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

					if (thisElement.elementType == "instance" && thisElement.instanceType == "symbol" && thisLayer.layerType != "guide") {

						//check to see if we should zap the tint, won't get included in results
						this.zapTint(thisElement);

						if (this.isColorized(thisElement)) {
							//clunky

							if (isMain) {
								this.detectResultsMain.push({
									timeline: tl
									, layer: thisLayer
									, frame: k + 1
									, symbol: thisElement.libraryItem
									, effect: thisElement.colorMode
									, value: this.getEffectValue(thisElement)
									, element: thisElement
									, layerIndex: j
								});
							} else {
								this.detectResultsNested.push({
									timeline: tl
									, layer: thisLayer
									, frame: k + 1
									, symbol: thisElement.libraryItem
									, effect: thisElement.colorMode
									, value: this.getEffectValue(thisElement)
									, element: thisElement
									, layerIndex: j
								});
							}

						}

						//search this element's timeline (if there is one)
						this.searchElement(thisElement.libraryItem);
					}
				}

				//manually iterate jump the keyframe duraction otherwise it will grab every non-keyframe
				k += thisFrame.duration;
			}
		}
	};

	//this automatically turns any symbol tinted with the defined colors
	ColorEffectDetect.prototype.zapTint = function(el) {

		if (el.colorMode == "tint") {

			for (var i = 0; i < this.zapTintColors.length; ++i) {
				if (el.tintColor == this.zapTintColors[i]) {
					el.colorMode = "alpha";
					fl.getDocumentDOM().setInstanceAlpha(0);
				}
			}
		}
	}

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