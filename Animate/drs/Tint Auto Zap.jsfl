(function() {

    /**
     *  Tint Auto Zap
     *	DavidRSutherland - davers.com
     *
     *  Color effects in native Flash animation get converted to CreateJS filters when exporting for HTML canvas
     *  Targets very particular tints and makes them alpha 0 with no HTML 5 filters on publish
	 *	Traces out list of converted symbols to output window for quality control
     */


    //initialize all the things
    TintAutoZap.prototype.init = function() {

        this.ZAP_TINT_COLORS = [];
        //tint values to make alpha 0
        //targetColor is the color to replace
        //targetPercent is the percentage of that color or greater than
        //copy and paste the chunk below to add more values
        this.ZAP_TINT_COLORS.push({
            targetColor: "#CCCCCC",
            targetPercent: 50
        });
        
		//------
        this.detectResults = []; //array of objects found with color effects
        this.detectResultsMain = []; //just the main timeline
        this.detectResultsNested = []; //just the symbol objects in nested timelines
        this.detectResultStrings = []; //only the strings
        this.alreadyDetected = []; //array of elements found to recursively search their timelines and avoid duplication

        //headings of the info we need
        this.headings = ["count", "timeline", "layer", "frame", "symbol", "effect", "value"];
        //reset the output panel of previous junk
        fl.outputPanel.clear();
    };


    function TintAutoZap() {

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

    };



    TintAutoZap.prototype.noResults = function() {
		 this.traceTitle(" TINT AUTO ZAP ", 100, "*");
        this.traceTitle(" 0 RESULTS FOUND ", 100, " ");
       
    }

    //extract the required strings to trace out, not the most elegant way
    TintAutoZap.prototype.extractStrings = function(arr, obj) {

        for (var i = 0; i < this.detectResults.length; ++i) {
            this.detectResultStrings.push({
                count: String(i + 1),
                timeline: "[" + this.detectResults[i].timeline.name + "]",
                layer: this.detectResults[i].layer.name,
                frame: String(this.detectResults[i].frame),
                symbol: this.detectResults[i].symbol.name,
                effect: this.detectResults[i].effect,
                value: this.detectResults[i].value
            });
        }
    }

    //Sort maintimeline objects by frame number
    TintAutoZap.prototype.sortMainTimeline = function(arr, obj) {

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
    TintAutoZap.prototype.lockAllLayers = function(tl) {

        for (var i = 0; i < tl.layers.length; ++i) {
            tl.layers[i].locked = true;
        }
    }

    //forma the strings for a pretty easy to read output window trace
    TintAutoZap.prototype.traceToOutput = function() {

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

        this.traceTitle(" TINT AUTO ZAP ", totalWidth, "*");
        this.traceTitle(" The following tinted instances have been changed to alpha 0: ", totalWidth, " ");
        //trace out the headings
        this.traceHeading(rowLengths);
        //trace out a border 
        this.makeBorder(totalWidth, "-");

        var lineString = ""; //the string that we build onto

        for (var i = 0; i < this.detectResultStrings.length; ++i) {


            lineString = "   ";


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
        fl.trace(this.detectResultStrings.length + " tinted items changed to alpha 0.")
    };

    //the headig text
    TintAutoZap.prototype.traceHeading = function(rl) {

        var headingLineString = "   ";
        for (j = 0; j < rl.length; ++j) {
            headingLineString += this.adjustSpacing(this.headings[j].toUpperCase(), rl[j]);
        }
        fl.trace(headingLineString);
    }

    //just a border with a custom string char
    TintAutoZap.prototype.makeBorder = function(tw, thisChar) {
        var borderString = "";

        for (j = 0; j < tw; ++j) {
            borderString += thisChar;
        }
        fl.trace(borderString);
    }

    //just a border with a custom string char
    TintAutoZap.prototype.traceTitle = function(str, tw, thisChar) {
        var borderString = "";

        var sideWidth = (tw / 2) - str.length / 2;
        for (i = 0; i < sideWidth; ++i) {
            borderString += thisChar;
        }
        borderString += str
        for (i = 0; i < sideWidth; ++i) {
            borderString += thisChar;
        }
        fl.trace(borderString);
    }

    //add empty spaced to line up the columns
    TintAutoZap.prototype.adjustSpacing = function(str, len) {
        while (str.length < len) {
            str = str + " ";
        }
        return str;
    }

    //serach for symbol instances with coor effects
    TintAutoZap.prototype.findColorEffects = function(tl, isMain) {

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

                        if (this.tinted(thisElement)) {
                            //clunky

                            if (isMain) {
                                this.detectResultsMain.push({
                                    timeline: tl,
                                    layer: thisLayer,
                                    frame: k + 1,
                                    symbol: thisElement.libraryItem,
                                    effect: thisElement.colorMode,
                                    value: this.getEffectValue(thisElement),
                                    element: thisElement,
                                    layerIndex: j
                                });
                            } else {
                                this.detectResultsNested.push({
                                    timeline: tl,
                                    layer: thisLayer,
                                    frame: k + 1,
                                    symbol: thisElement.libraryItem,
                                    effect: thisElement.colorMode,
                                    value: this.getEffectValue(thisElement),
                                    element: thisElement,
                                    layerIndex: j
                                });
                            }
							
							//fl.getDocumentDOM().selectAll();
							//fl.getDocumentDOM().setInstanceAlpha(0);
							//thisElement.tintPercent = 60;
							//thisElement.colorMode = "alpha";
							
							thisElement.colorMode = 'advanced';
							thisElement.colorRedAmount = 0;
							thisElement.colorGreenAmount = 0;
							thisElement.colorBlueAmount = 0;
			
							thisElement.colorRedPercent = 100;
							thisElement.colorGreenPercent = 100;
							thisElement.colorBluePercent = 100;
							
							thisElement.colorAlphaPercent= 0;
							
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


    //check to see if this element should be zapped
    TintAutoZap.prototype.tinted = function(el) {

        if (el.colorMode == "tint") {

            for (var i = 0; i < this.ZAP_TINT_COLORS.length; ++i) {

                if (el.tintColor == this.ZAP_TINT_COLORS[i].targetColor) {
                    if (el.tintPercent >= this.ZAP_TINT_COLORS[i].targetPercent) {
                        return true;
                    }

                }
            }
        }
        return false;
    }

    //this automatically turns any symbol tinted with the defined colors
    TintAutoZap.prototype.zapTint = function(el) {
		
		
		//fl.getDocumentDOM().setSelectionRect({left:1, top:1, right:fl.getDocumentDOM().width, bottom:fl.getDocumentDOM().height});
		
		//fl.getDocumentDOM().setInstanceAlpha(0);
       // el..colorMode = "alpha";
		 
       // fl.getDocumentDOM().setInstanceAlpha(0);
		
		
			
		//fl.getDocumentDOM().setSelectionRect({left:1, top:1, right:fl.getDocumentDOM().width, bottom:fl.getDocumentDOM().height});
		
		 
			
    }

    //checks to see if this element meets criteria we're looking for
    TintAutoZap.prototype.getEffectValue = function(el) {

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
    TintAutoZap.prototype.isColorized = function(el) {

        if (el.colorMode != "none" && el.colorMode != "alpha") {
            return true;
        }

        return false;
    };

    //search inside any symbol timelines on stage
    TintAutoZap.prototype.searchElement = function(libItem) {

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


    new TintAutoZap;

}());