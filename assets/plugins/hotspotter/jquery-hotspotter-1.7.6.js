/*
 * Title                   : Hotspotter - Cool Hotspot Maker jQuery Plugin
 * Author                  : Basm , aka z-B
 * Version                 : 1.7.6
 * Last Modified           : 27 Mar 2013
 * CodeCanyon Profile      : http://codecanyon.net/user/z-B
 * License                 : http://codecanyon.net/licenses/regular_extended
 */

(function ($, window) {
    
    //setOuterWidth/Height instead of using jquery outerWidth/height because in jquery versions < 1.8.0
    //they are only used as getters, note that they don't take margins into account
    function setOuterWidth($elem, val) {
        var substract = 0,
            curVal;

        $(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']).each(function () {
            curVal = parseFloat($elem.css(this.toString()));
            //for ie < 8 , trying to get not set properties in this browsers won't return 0
            curVal = isNaN(curVal) ? 0 : curVal;

            substract += curVal;
        });

        $elem.width(parseFloat(val) - substract);
    }

    function setOuterHeight($elem, val) {
        var substract = 0,
            curVal;

        $(['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']).each(function () {
            curVal = parseFloat($elem.css(this.toString()));

            curVal = isNaN(curVal) ? 0 : curVal;

            substract += curVal;
        });

        $elem.height(parseFloat(val) - substract);
    }

    /**
     *Spot object constructor , it make an instance of spot object , 
     *gather data about spot , extend the instance with current spot handler.
     *
     *@param $wrap jquery dom element with class 'hs-wrap'
     *@param generalData reference to images spots general data object
     */
    var Spot = function ($wrap, generalData) {
        //note that we use .attr not .data because .data get data only once , so
        //if we rerun the plugin like in editor with new data , data won't be updated

        this.b_generalData = generalData; //save a reference to general data object
        this.b_$wrap       = $wrap; //jquery dom element with class 'hs-wrap'
        //========== Spot ==========
        //jquery dom element of spot div
        this.b_$spot       = $wrap.find('div[data-coord]');
        //spot name , used to reach spot by hash links
        this.b_name        = this.b_$spot.attr('data-name');
        //spot coordinates 'x,y'
        this.b_coord       = this.b_$spot.attr('data-coord').split(',');
        //spot dimension , 'width,height'
        this.b_dim         = this.b_$spot.attr('data-dim') ? this.b_$spot.attr('data-dim').split(',') : null;
        //when the spot is activited , 'hover' , 'click' , 'always'. if not specified make the spot static
        this.b_activeon    = this.b_$spot.attr('data-activeon');
        this.b_isActive    = false; //flag to know if the spot is active 'ie: the tooltip is shown' or not

        var  hd            = this.b_$spot.attr('data-handler'), //handler name
             //if handler is defined use it otherwise use the default General Handler
             handler       = $.fn.hotspotter.hasOwnProperty(hd) ? $.fn.hotspotter[hd] : $.fn.hotspotter['General'];
        
        //options provided for the handler
        this.b_hdOpts      = this.b_$spot.attr('data-handleropts') ? this.b_$spot.attr('data-handleropts').split(',') : null;
        //========== Tooltip ========== 
        //tooltip wrap
        this.b_$tooltip    = $wrap.find('.tt-wrap');
        //tootip "tip, bubble, aim, .."
        this.b_$inTooltip  = this.b_$tooltip.find('> div');
        //tooltip width
        this.b_tooltipW    = this.b_$inTooltip.attr('data-width');
        //tooltip direction , 'top', 'right' , ..., if not set, set 'top' as default
        this.b_tooltipDir  = this.b_$inTooltip.attr('data-dir') ? this.b_$inTooltip.attr('data-dir') : 'top';
        //tooltips vertical or horizontal position
        this.b_tooltipPos  = this.b_$inTooltip.attr('data-pos');
        //tooltip animation type
        this.b_tooltipAnim = this.b_$inTooltip.attr('data-anim');

        //Convert coordinates & dimensions to numbers
        this.b_coord [0]= parseFloat(this.b_coord [0]);
        this.b_coord [1]= parseFloat(this.b_coord [1]); 

        var i;

        for (i in this.b_dim) {
            if (this.b_dim.hasOwnProperty(i)) {
                this.b_dim[i] = parseFloat(this.b_dim[i]);
            }
        }

        //24 refer to -2 'like in css file' but adjusted for tooltip position , 
        //see info at General handler scale function
        this.b_tooltipPos = (typeof this.b_tooltipPos !== 'undefined') ? parseFloat(this.b_tooltipPos) : 24;

        //Extend spot object with handler functions
        $.extend(this, handler);
    };

    //==========================================================================
    /*
     * Clear events attached to the plugin namespace on target dom elements
     * to allow re-runing the plugin & avoid misbehaviour when inadvertently
     * runned twice 
     */
    Spot.prototype.b_clearEvents = function () {
        this.b_$wrap.unbind(Spot.opts.ns);
        this.b_$spot.unbind(Spot.opts.ns);
    };

    /*
     * Bind current spot handler functions to it's target events
     */
    Spot.prototype.b_bindDefaults = function () {
        var obj = this;
        //check current spot triggers & check if the handler has implementation for it
        if (obj.b_activeon === 'hover' && obj.enter && obj.leave) {
            obj.b_$wrap.bind('mouseenter' + Spot.opts.ns, function () {
                obj.enter();
            });

            obj.b_$wrap.bind('mouseleave' + Spot.opts.ns, function () {
                obj.leave();
            });

        } else if (obj.b_activeon === 'click' && obj.click) {
            obj.b_$spot.bind('click' + Spot.opts.ns, function (e) {
                e.stopPropagation();
                obj.click();
            });
        }
    };

    /*
     * This function hide all spots in the image then position the browser
     * window on the image holding the current spot & show spot
     * by triggering it's handler appropriate function
     */
    Spot.prototype.b_showInContext = function () {
        //Get all other spots & hide active ones
        var $otherSpots = this.b_$wrap
                              .parent()
                              .find('.hs-wrap > div[data-coord]')
                              .filter(':not(div[data-name=' + this.b_name + '])');

        $otherSpots.each(function () {
            var spot = $(this).data('spot' + Spot.opts.ns);

            if (spot.b_activeon === 'hover' && spot.b_isActive) {
                spot.leave();
            } else if (spot.b_activeon === 'click' && spot.b_isActive) {
                spot.click();
            }
        });

        //get image offset
        var x  = this.b_$wrap.parent().offset().left,
            y  = this.b_$wrap.parent().offset().top;

        //move window to current image
        $(window).scrollLeft(x);
        $(window).scrollTop(y - Spot.opts.imgTopMargin);

        //trigger this spot
        if (this.b_activeon === 'hover' && !this.b_isActive) {
            this.enter();
        } else if (this.b_activeon === 'click' && !this.b_isActive) {
            this.click();
        }
    };


    //set default options
    Spot.opts = {
        ns       : '.hotspotter', //plugin namespace
        //Margin left before image top , used when accessing spots 
        //with hash links as the plugin will scroll to image top - this margin
        //usefull when having top fixed menu or for aesthetic reasons
        imgTopMargin: 10
    };
    
    /*
     * Loop through each spot & scale if responsive
     * 
     * @param {jQuery Object} $hsArea
     */
    function spotLoop($hsArea) {
        $hsArea.find('.hs-wrap').each(function() {
            var $this= $(this),
                spotObj= $this.find('div[data-coord]').data('spot' + Spot.opts.ns);
            
            //if the plugin is reruned so scale spot useful in case the image was 
            //fluid or the user loaded larger image
            if (spotObj) {
                spotObj.scale();
                return;
            }
            
            spotObj = new Spot($(this), $hsArea.data('general_data' + Spot.opts.ns));
            
            //Save spot object in spot data to allow user to control it
            spotObj.b_$spot.data('spot' + Spot.opts.ns, spotObj);
            
            spotObj.scale();
            spotObj.b_$wrap.show(); //show spot
            
            spotObj.b_clearEvents();
            
            spotObj.init && spotObj.init();
            
            //if there is no activeon attribute don't attach events
            if (!spotObj.b_activeon) {
                return;
            }
            
            //Always show the tooltip in case activeon='always'
            (spotObj.b_activeon == 'always') ? spotObj.enter() : spotObj.b_bindDefaults();
        });
    }
    
    /**
     * Get change in image width & height , run spot loop
     * 
     * @param {jQuery Object} $hsArea
     * @param {Object} generalData
     * @param {jQuery Object} $img
     */
    function responsiveSpotLoop($hsArea, generalData, $img) {
        var imgdim = $img.attr('data-imgdim').split(',');
                        
        generalData.dw = $img.width() / imgdim[0];
        generalData.dh = $img.height() / imgdim[1];
        
        spotLoop($hsArea);
    }
    
    //================= Start Plugin =================
    $.fn.hotspotter= function(options) {
        
        var init= false; //flag to only bind hashchange & load with plug init
        
        //check if spot isActive , if used with multiple spots only first one 
        //state is returned
        var spot= this.data('spot' + Spot.opts.ns);
        
        if (options == 'isActive') {
            return spot ? spot.b_isActive : undefined;
        }
        
        //start loop
        this.each(function() {
            var $this= $(this);
            
            //================================================
            //show & hide all spots in image
            if (options == 'hide') {
                $this.find('.hs-wrap').hide();
                $this.data('general_data' + Spot.opts.ns).visible= false;
                return;
            }
            if (options == 'show') {
                $this.find('.hs-wrap').show();
                $this.data('general_data' + Spot.opts.ns).visible= true;
                return;
            }
            
            
            //================================================
            //(un)trigger spots
            var spot= $this.data('spot' + Spot.opts.ns);
            
            if (options == 'trigger') {
                if (spot  && !spot.b_isActive) {
                    spot.enter();
                }
                
                return;
            }
            if (options == 'untrigger') {
                if (spot && spot.b_isActive) {
                    spot.leave();
                }
                    
                return;
            }
            
            
            //================================================
            //init process
            var $img= $this.find('img[data-imgdim]'),
                $hsArea= $this,
                generalData= $hsArea.data('general_data' + Spot.opts.ns);
                
            init= true; 
            
            //merge defaults with user options
            $.extend(Spot.opts, options);
                        
            //create general spot-independent data for this image or hs-area, 
            //init it with change ratio of image width , height
            //if generalData is already available that mean the plugin 
            //is rerun possible with window resize
            if (!generalData) {
                $hsArea.data('general_data' + Spot.opts.ns, {dw:1, dh:1, visible:true});
                generalData= $hsArea.data('general_data' + Spot.opts.ns);
            }
            
            
            //no img caught then it's not responsive
            if (! $img.length) {
                spotLoop($hsArea);
                return;
            }
            
            //img caught "responsive image"
            if ($img.width() && $img.height()) {
                //start loop immediately if width/height are known
                responsiveSpotLoop($hsArea, generalData, $img);
            } else {
                //Note on cached images:
                //chrome: run only load event
                //firefox: run load event + '.complete' property == true
                //IE: '.complete' == true , load event never fires
                
                //we wait until image is loaded to get it's dimensions & run the loop
                $img.bind('load' + Spot.opts.ns, function () {
                    responsiveSpotLoop($hsArea, generalData, $img);
                });
                    
                //check if the image is already loaded. usefull for cached images 
                //or if the image loaded before calling the plugin
                if ($img[0].complete) {
                    responsiveSpotLoop($hsArea, generalData, $img);
                    $img.unbind('load' + Spot.opts.ns); //for firefox
                }
            }
                
        });
        
        //bind only in init
        if (init) {
            //clear events defined under the plugin namespace from window object
            $(window).unbind(Spot.opts.ns);
        
            $(window).bind('hashchange' + Spot.opts.ns, function() {
                var hash = window.location.hash.substr(1),
                $spot = $('.hs-wrap div[data-name=' + $.trim(hash) + ']');

                if ($spot.length) {
                    $spot.data('spot' + Spot.opts.ns).b_showInContext();
                } 
            });
        
            //Check hash when all images r loaded 'ie: window.onload' 
            //to get accurate image offsets
            $(window).bind('load' + Spot.opts.ns, function(){
                $(window).trigger('hashchange' + Spot.opts.ns);
            });
        }
       

        return this;
    };
    
    
    //==========================================================================
    $.fn.hotspotter.version= '1.7';
    
    
   //================= Default Spot Handlers =================
   /*
    * General handler to be used when there is no handler specified , 
    * used with builtin spots & tooltips
    */
    $.fn.hotspotter.General = {
        init: function () {
            if (this.b_activeon === 'click') {
                this.b_$spot.css('cursor', 'pointer');
            }

            if (this.b_tooltipW) {
                this.b_$inTooltip.css('width', this.b_tooltipW);
            }

            //set tooltip direction as top if no dir is specified
            if (!this.b_tooltipDir) {
                this.b_tooltipDir = 'top';
            }

            this.b_$tooltip.addClass(this.b_tooltipDir);
            this.b_$inTooltip.addClass(this.b_tooltipDir);

            //init img-spot & markup-spot
            if (this.b_$spot.hasClass('img-spot')) {
                this.$img1 = this.b_$spot.find('img').eq(0);
                this.$img2 = this.b_$spot.find('img').eq(1);
                
                this.$img2.hide(); //for ie8

            } else if (this.b_$spot.hasClass('markup-spot')) {
                this.$markup1 = this.b_$spot.find('div').eq(0);
                this.$markup2 = this.b_$spot.find('div').eq(1);
                
                this.$markup2.hide(); //for ie8

            }

        },
        enter: function () {
            /* we do checking for isActive because spots could be triggered
             * by hash links and then if u hovered over them there will be no
             * effect triggered because this flag is used , also for click
             * events we need to know current tooltip state to be able to do
             * animations
             */
            if (this.b_isActive || !this.b_generalData.visible) {
                return;
            }
            
            if (this.b_$spot.hasClass('img-spot')) {
                this.$img1.css('display', 'none');
                this.$img2.css('display', 'block');

            } else if (this.b_$spot.hasClass('markup-spot')) {

                this.$markup1.hide();
                this.$markup2.show();

            } else {
                this.b_$spot.addClass('active');
            }

            this.b_$tooltip.stop(true, true);

            if (this.b_tooltipAnim === 'fade') {
                this.b_$tooltip.fadeIn('slow');
            } else if (this.b_tooltipAnim === 'goin') {
                this.b_$tooltip.show();

                switch (this.b_tooltipDir) {
                    case 'top':
                        this.b_$tooltip.css('bottom', 100 + parseFloat((30 / this.b_$spot.height()) * 100) + '%');
                        this.b_$tooltip.css('opacity','0');
                        this.b_$tooltip.animate({
                            bottom:'100%', 
                            opacity:'1'
                        }, 300);
                        break;

                    case 'right':
                        this.b_$tooltip.css('left', 100 + parseFloat((30 / this.b_$spot.width()) * 100) + '%');
                        this.b_$tooltip.css('opacity','0');
                        this.b_$tooltip.animate({
                            left:'100%',  
                            opacity:'1'
                        }, 300);
                        break;

                    case 'bottom':
                        this.b_$tooltip.css('top', 100 + parseFloat((30 / this.b_$spot.height()) * 100) + '%');
                        this.b_$tooltip.css('opacity','0');
                        this.b_$tooltip.animate({
                            top:'100%', 
                            opacity:'1'
                        }, 300);
                        break;

                    case 'left':
                        this.b_$tooltip.css('right', 100 + parseFloat((30 / this.b_$spot.width()) * 100) + '%');
                        this.b_$tooltip.css('opacity','0');
                        this.b_$tooltip.animate({
                            right:'100%', 
                            opacity:'1'
                        }, 300);
                        break;
                }
            } else {
                this.b_$tooltip.show();
            }

            this.b_isActive= true;
        },
        
        leave:function() {
            if (!this.b_generalData.visible) {
                return;
            }
            
            if (this.b_$spot.hasClass('img-spot')) {
                this.$img1.css('display', 'block');
                this.$img2.css('display', 'none');
            }else if (this.b_$spot.hasClass('markup-spot')) {
                this.$markup1.show();
                this.$markup2.hide();
            }else{
                this.b_$spot.removeClass('active');  
            }
                
            if (this.b_tooltipAnim === 'fade') {
                this.b_$tooltip.fadeOut('slow');
            }else{
                this.b_$tooltip.hide();
            }
                
            this.b_isActive= false;
        },
        
        click: function() {
            !this.b_isActive ? this.enter() : this.leave();
        },
            
        scale: function() {
            var dw= this.b_generalData.dw,
                dh= this.b_generalData.dh;

            this.b_$wrap.css('left', this.b_coord [0] * dw);
            this.b_$wrap.css('top' , this.b_coord [1] * dh);
        
            if (this.b_dim && !this.b_$spot.hasClass('sniper-spot')) {
                this.b_$spot.width(this.b_dim[0]  * dw + 'px');
                this.b_$spot.height(this.b_dim[1]  * dh + 'px');
            
                if (2 in this.b_dim) {
                    this.b_$spot.css('border-radius',this.b_dim[2] * dw);
                }
            }
            
            //scale image spots
            if (this.b_$spot.hasClass('img-spot')) {
                var spotObj = this,
                    $img1 = this.b_$spot.find('> img').eq(0),
                    $img2 = this.b_$spot.find('> img').eq(1);
                    
                
                if (!this.scaleEventBind) {
                    this.scaleEventBind = true; //flag to avoid rebinding, in case of fluid images
                
                    $img1.bind('load' + Spot.opts.ns, function () {
                        var $this = $(this);
                        
                        $this.show();
                        
                        if (!spotObj.img1W) {
                            //first time run, cache image original dimensions
                            spotObj.img1W = this.width;
                            spotObj.img1H = this.height;
                        }
                        
                        $this.width(spotObj.img1W * spotObj.b_generalData.dw);
                        $this.height(spotObj.img1H * spotObj.b_generalData.dh);
                    });
                
                    $img2.bind('load' + Spot.opts.ns, function () {
                        var $this = $(this);
                        
                        if (!spotObj.img2W) {
                            $img2.show(); //for ie7-9
                            spotObj.img2W = this.width;
                            spotObj.img2H = this.height;
                            $img2.hide();
                        }

                        $this.width(spotObj.img2W * spotObj.b_generalData.dw);
                        $this.height(spotObj.img2H * spotObj.b_generalData.dh);
                    });
                }
                
                if ($img1[0].complete) {
                    $img1.trigger('load' + Spot.opts.ns);
                }
                
                if ($img2[0].complete) {
                    $img2.trigger('load' + Spot.opts.ns);
                }
            }
            
            //set tooltip position relative to element
            //-26 account for the different between tt-wrap top / left , tip or bubble top / left
            //setting tt-wrap to -26 will put tip/bubble position exactly at top or left of the element
            //so instead of setting it to -26 you just set 0 and the plugin will translate it , that's more intutive
            var ttAdjust= -26;
                    
            //position tooltip , relative to element & account for changes
            if (this.b_$spot.hasClass('sniper-spot')) {
                //sniper spots are not scaled so use same position
                dw=dh=1;
                ttAdjust= 0;
            }
                    
            if (this.b_tooltipDir === 'top' || this.b_tooltipDir === 'bottom') {
                this.b_$tooltip.css('left', ttAdjust + this.b_tooltipPos * dw);
            }
            if (this.b_tooltipDir === 'left' || this.b_tooltipDir === 'right') {
                this.b_$tooltip.css('top', ttAdjust + this.b_tooltipPos * dh);
            }
        }
            
    },
        
    //----------------------------------------------------------------------
    //Aim Handler
    $.fn.hotspotter.Aim = {
        init: function() {
            this.$hsArea= this.b_$wrap.parent();
                                
            if (!this.b_generalData.hsAim) {
                this.b_generalData.hsAim= {
                    $img: this.$hsArea.find('> img')
                };
            }
            
            this.aimGeneralData= this.b_generalData.hsAim;
            
            if (this.b_activeon == 'click') {
                this.b_$spot.css('cursor', 'pointer');
            }
                
            //change tooltip position in dom , make it a direct desendant
            //of hs-area
            this.b_$inTooltip.appendTo(this.$hsArea);
                
            //setting fixed width allow for putting images in tooltip , 
            //if we didn't do that we will get width of tooltip without 
            //the image then after the image is loaded it will appear
            //out of tooltip because it's width wasn't accounted for.
            //the other way around this would be to wait for images in 
            //tooltip to load before showing user anything! , which will
            //greatly affect UX of users with slow internet connections ,
            //instead they will have text content of tooltip & effect , same
            //with top & bottom tooltips but the user will need to set height
            //of tt content himself by using a wrapper div
            if (this.b_tooltipW && (this.b_tooltipDir == 'left' || this.b_tooltipDir == 'right')) {
                this.b_$inTooltip.width(this.b_tooltipW);
            }               
                
            this.$ttContent= this.b_$inTooltip.find('.tt-content');
            
            //Save tt orignal dimensions for animation , note that we do that
            //when the image is loaded because chrome will not get correct values
            //for height/width when this function is called with the plugin init
            //in dom ready
            this.b_generalData.hsAim.$img.bind('load' + Spot.opts.ns, $.proxy(this._getOriginalTooltipDim, this));
            
            //get orignal tooltip dimensions immediately 
            //note that this function will be called twice for browsers 
            //like Firefox, chrome but not in IE if the image is cached, 
            //in this case load event won't fire, also 'img.complete' 
            //property will be false at this stage.
            //we also didn't check for browser as the function footprint 
            //is small , also this check is unreliable as it could be manipulated
            this._getOriginalTooltipDim();
            
            //set tooltip dir
            if (this.b_tooltipDir) {
                this.b_$inTooltip.addClass(this.b_tooltipDir);
            }
            
            if (this.b_$spot.hasClass('img-spot')) {
                this.$img1 = this.b_$spot.find('> img').eq(0);
                this.$img2 = this.b_$spot.find('> img').eq(1);
            }
            
            //Don't create the aiming animation if handlerOpts=false
            if (this.b_hdOpts == 'false') {
                return;
            }
            
            //create transparent rectangles & moving pillars for animation
            if (!this.aimGeneralData['rect0']) {
                for(var i=4; i--;) {
                    this.aimGeneralData['rect'   + i]= $('<div/>').addClass('hs-aim-rect').appendTo(this.$hsArea);
                    //for spots that's activated with hashlinks , hide them when hovering over transparent cover rectangles
                    var aimGeneralData= this.aimGeneralData;
                    this.aimGeneralData['rect'   + i].bind('mouseenter', function() {
                        //note that we check for activeSpot existence because due 
                        //to the aiming effect animation the user can trigger spot.leave 
                        //and also trigger rect.mouseenter ,  and as spot.leave is triggered
                        //activeSpot will be null
                        if (aimGeneralData.activeSpot && aimGeneralData.activeSpot.b_activeon == 'hover') {
                            aimGeneralData.activeSpot.leave();
                        } 
                    });
                    this.aimGeneralData['pillar' + i]= $('<div/>').addClass('hs-aim-pillar').appendTo(this.$hsArea);
                }
            }
            //cache spot dimension & position
            this.spotDim= {
                w: this.b_$spot.outerWidth() ,
                h: this.b_$spot.outerHeight() ,
                x: this.b_$wrap.position().left,
                y: this.b_$wrap.position().top
            };
        },
            
        enter: function() {
            if (this.b_isActive || !this.b_generalData.visible) {
                return;
            }
                                
            if (!this.aimGeneralData.$img[0].complete) {
                return;
            } //don't do anything if image isn't loaded
                
            this.b_isActive= true;
                
                
            //only one spot of aim should be active so we keep track of active spot
            //that's useful in case of accessing spot through hashlinks when a spot
            //is already activated 'activeon= always' and the user try to activate another one
            this.aimGeneralData.activeSpot && this.aimGeneralData.activeSpot.leave();
                
            this.aimGeneralData.activeSpot= this;
                
            if (!this.aimGeneralData.imgDim) {
                this.aimGeneralData.imgDim= {
                    w: this.aimGeneralData.$img.width() ,
                    h: this.aimGeneralData.$img.height()
                };
            }
            
            if (this.b_$spot.hasClass('img-spot')) {
                this.$img1.hide();
                this.$img2.show();
            }
            
            if (this.b_hdOpts == 'false') {
                this._showTooltip();
            }else {
                //apply hs-flatten to make spot edges sharp & avoid empty space with aiming effect transparent cover
                this.b_$spot.addClass('hs-flatten');

                //top rect
                this.aimGeneralData['rect0'].width(this.aimGeneralData.imgDim.w);
                this.aimGeneralData['rect0'].height(this.spotDim.y);
                this.aimGeneralData['rect0'].css('left', 0);
                this.aimGeneralData['rect0'].css('top', 0);
                    
                //right rect
                this.aimGeneralData['rect1'].width(this.aimGeneralData.imgDim.w - (this.spotDim.x + this.spotDim.w));
                this.aimGeneralData['rect1'].height(this.aimGeneralData.imgDim.h - this.spotDim.y);
                this.aimGeneralData['rect1'].css('left', this.spotDim.x + this.spotDim.w);
                this.aimGeneralData['rect1'].css('top', this.spotDim.y);
                    
                //bottom rect
                this.aimGeneralData['rect2'].width((this.spotDim.x + this.spotDim.w));
                this.aimGeneralData['rect2'].height(this.aimGeneralData.imgDim.h - (this.spotDim.y + this.spotDim.h));
                this.aimGeneralData['rect2'].css('left', 0);
                this.aimGeneralData['rect2'].css('top', this.spotDim.y + this.spotDim.h);
                    
                //left rect
                this.aimGeneralData['rect3'].width(this.spotDim.x);
                this.aimGeneralData['rect3'].height(this.spotDim.h);
                this.aimGeneralData['rect3'].css('left', 0);
                this.aimGeneralData['rect3'].css('top', this.spotDim.y);
                    
                //-------------------------------------------------------------------------------
                //top pillar
                this.aimGeneralData['pillar0'].width(4);
                this.aimGeneralData['pillar0'].height(0);
                this.aimGeneralData['pillar0'].css('top', 0);
                this.aimGeneralData['pillar0'].css('left', this.spotDim.x + (this.spotDim.w / 2));
                    
                //right pillar
                this.aimGeneralData['pillar1'].width(0);
                this.aimGeneralData['pillar1'].height(4);
                this.aimGeneralData['pillar1'].css('top', this.spotDim.y + (this.spotDim.h / 2));
                this.aimGeneralData['pillar1'].css('left', this.aimGeneralData.imgDim.w);
                    
                //bottom pillar
                this.aimGeneralData['pillar2'].width('4');
                this.aimGeneralData['pillar2'].height(0);
                //avoid bottom= 0 , because of the additional space mentioned before in bottom tooltip creation
                this.aimGeneralData['pillar2'].css('bottom', this.b_$wrap.parent().height() - this.aimGeneralData.imgDim.h);
                this.aimGeneralData['pillar2'].css('left', this.spotDim.x + (this.spotDim.w / 2));
                    
                //left pillar
                this.aimGeneralData['pillar3'].width(0);
                this.aimGeneralData['pillar3'].height('4');
                this.aimGeneralData['pillar3'].css('top', this.spotDim.y + (this.spotDim.h / 2));
                this.aimGeneralData['pillar3'].css('left', 0);
                    
                //show rects & pillars
                for(var i= 4; i--;) {
                    this.aimGeneralData['rect' + i].show();
                    this.aimGeneralData['pillar' + i].show();
                }
                    
                //start animation
                var p1x= this.aimGeneralData.imgDim.w - (this.spotDim.x + this.spotDim.w),
                spot= this;
                    
                this.aimGeneralData['pillar0'].animate({
                    height: this.spotDim.y
                },300);
                this.aimGeneralData['pillar1'].animate({
                    width: p1x, 
                    left: '-=' + p1x
                },300);
                this.aimGeneralData['pillar2'].animate({
                    height: this.aimGeneralData.imgDim.h - (this.spotDim.y + this.spotDim.h)
                },300);
                this.aimGeneralData['pillar3'].animate({
                    width: this.spotDim.x
                },300, function() {
                    spot._showTooltip();
                });
            }
                    
        },
            
        leave: function() {                
            if (!this.aimGeneralData.$img[0].complete || !this.b_generalData.visible) {
                return;
            }
                
            this.b_isActive= false;
                
            this.aimGeneralData.activeSpot= null;
                
            this.b_$spot.removeClass('hs-flatten');
            
            if (this.b_$spot.hasClass('img-spot')) {
                this.$img1.show();
                this.$img2.hide();
            }
            
            if (this.b_hdOpts != 'false') {
                for(var i= 4; i--;){
                    this.aimGeneralData['rect' + i].hide();
                    this.aimGeneralData['pillar' + i].stop();
                    this.aimGeneralData['pillar' + i].hide();
                }
            }
                
            //hide tt-content to avoid undesirable content reflow during anim
            this.$ttContent.hide();
                
            //reverse slide animation
            switch (this.b_tooltipDir) {    
                case 'top':
                    this.b_$inTooltip.animate({
                        height: 0
                    }, 400, function() {
                        $(this).hide(); //ensure that tooltip is hidden setting height=0 will hide div not it's content
                    });
                    break;
                        
                case 'right':
                    this.b_$inTooltip.animate({
                        width: 0
                    }, 400, function() {
                        $(this).hide();
                    });
                    break;
                        
                case 'bottom':
                    this.b_$inTooltip.animate({
                        height: 0
                    }, 400, function() {
                        $(this).hide();
                    });
                    break;
                        
                case 'left':
                    this.b_$inTooltip.animate({
                        width: 0, 
                        right: '100%'
                    },400, function(){
                        $(this).hide();
                    });
                    break;
            }
        },
            
        click: function() {
            !this.b_isActive ? this.enter() : this.leave();
        },
            
        scale: function() {
            this.b_$wrap.css('left', this.b_coord [0] * this.b_generalData.dw);
            this.b_$wrap.css('top' , this.b_coord [1] * this.b_generalData.dh);
        
            if (this.b_dim && !this.b_$spot.hasClass('sniper-spot')) {
                this.b_$spot.width(this.b_dim[0]  * this.b_generalData.dw);
                this.b_$spot.height(this.b_dim[1]  * this.b_generalData.dw);
            
                if (2 in this.b_dim) {
                    this.b_$spot.css('border-radius',this.b_dim[2] * this.b_generalData.dw);
                }
            }
            
            //scale image spots
            if (this.b_$spot.hasClass('img-spot')) {
                var spotObj = this,
                    $img1 = this.b_$spot.find('> img').eq(0),
                    $img2 = this.b_$spot.find('> img').eq(1);
                    
                
                if (!this.scaleEventBind) {
                    this.scaleEventBind = true; //flag to avoid rebinding, in case of fluid images
                
                    $img1.bind('load' + Spot.opts.ns, function () {
                        var $this = $(this);
                        
                        if (!spotObj.img1W) {
                            //first time run, cache image original dimensions
                            spotObj.img1W = this.width;
                            spotObj.img1H = this.height;
                        }
                        
                        $this.width(spotObj.img1W * spotObj.b_generalData.dw);
                        $this.height(spotObj.img1H * spotObj.b_generalData.dh);
                    });
                
                    $img2.bind('load' + Spot.opts.ns, function () {
                        var $this = $(this);
                        
                        if (!spotObj.img2W) {
                            $img2.show(); //for ie7-9
                            spotObj.img2W = this.width;
                            spotObj.img2H = this.height;
                            $img2.hide();
                        }

                        $this.width(spotObj.img2W * spotObj.b_generalData.dw);
                        $this.height(spotObj.img2H * spotObj.b_generalData.dh);
                    });
                }
                
                if ($img1[0].complete) {
                    $img1.trigger('load' + Spot.opts.ns);
                }
                
                if ($img2[0].complete) {
                    $img2.trigger('load' + Spot.opts.ns);
                }
            }

            
            //if spotDim is defined that mean the plugin is rerun possibly 
            //with window resize , so we recalcuate dimensions for spot & image 
            //in case the image was resized 'fluid image'
            if (this.spotDim) {
                this.spotDim= {
                    w: this.b_$spot.outerWidth() ,
                    h: this.b_$spot.outerHeight() ,
                    x: this.b_$wrap.position().left,
                    y: this.b_$wrap.position().top
                };
                    
                this.aimGeneralData.imgDim= {
                    w: this.aimGeneralData.$img.width() ,
                    h: this.aimGeneralData.$img.height()
                };
            }
        },
         
         /*
         * Get tooltip original dimensions, to be able to make animation
         */
        _getOriginalTooltipDim: function () {
            //show tt-content temporary to get correct dimension
            this.$ttContent.show();

            //note that we didn't need to show & hide tooltip like tt-content because jquery do it for us
            this.ttOrignW = this.b_$inTooltip.width();
            this.ttOrignH = this.b_$inTooltip.height();

            //hide tt-content
            this.$ttContent.hide();
        },
         
        /*
         * Position tooltip according to specified direction 
         * & do animation if required
         */
        _showTooltip: function() {
            this.b_$inTooltip.show();
            
            var $ttContent= this.$ttContent;
            
            function showTooltipContent() {
                $ttContent.show();
            }
            
            switch (this.b_tooltipDir) {
                case 'top':
                    setOuterWidth(this.b_$inTooltip, this.aimGeneralData.imgDim.w);
                    this.b_$inTooltip.css('left', 0);
                    this.b_$inTooltip.css('bottom', '100%');
       
                    this.b_$inTooltip.height(0);
                    this.b_$inTooltip.animate({
                        height: this.ttOrignH
                    }, 400, showTooltipContent);
                    break;
                        
                case 'right':
                    setOuterHeight(this.b_$inTooltip, this.aimGeneralData.imgDim.h);
                    this.b_$inTooltip.css('left', this.aimGeneralData.imgDim.w);
                    this.b_$inTooltip.css('top', 0);
                    
                    this.b_$inTooltip.width(0);
                    this.b_$inTooltip.animate({
                        width: this.ttOrignW
                    }, 400, showTooltipContent);
                    break;
                case 'bottom':
                    setOuterWidth(this.b_$inTooltip, this.aimGeneralData.imgDim.w);
                    this.b_$inTooltip.css('left', 0);
                    //we used top= image height and didn't set it to 100% because
                    //browsers add small space between div height & image height
                    //and so  div height > image height
                    this.b_$inTooltip.css('top', this.aimGeneralData.imgDim.h);
                        
                    this.b_$inTooltip.height(0);
                    this.b_$inTooltip.animate({
                        height: this.ttOrignH
                    }, 400, showTooltipContent);                   
                    break;
                            
                case 'left':
                    setOuterHeight(this.b_$inTooltip, this.aimGeneralData.imgDim.h);
                    this.b_$inTooltip.css('top', 0);

                    this.b_$inTooltip.width(0);
                    this.b_$inTooltip.css('right', '100%');
                    this.b_$inTooltip.animate({
                        width: this.ttOrignW
                    }, 400, showTooltipContent);
                    break;
            }
        }
    }
}
)(jQuery, window);