(function(){
    this.hubSlider = function(){

        var defaults = {
            domid           : "hub-slider",
            containerClass  : "hub-slider",
            listClass       : "hub-slides",
            viewport        : "hub-slider-viewport",
            dotClass        : "hub-slider-dot",
            activeDotClass  : "active-dot",
            transDuration   : 600,
            easing          : '',
            transTime       : 1000,
            pauseDuration   : 5000,
            includeDots     : true
        }

        if(arguments[0] && typeof arguments[0] === "object"){
            this.options = extendedDefaults(defaults, arguments[0]);
        }
    }

    hubSlider.prototype.init = function(){
        var obj = this;
        obj.slider = document.getElementById(obj.options.domid);
        obj.sliderWidth = obj.slider.clientWidth;
        obj.slides = obj.slider.getElementsByTagName('ul')[0];
        obj.slideItems = obj.slides.getElementsByTagName('li');

        //if only 1 slide item don't build slider
        if(obj.slideItems.length <= 1) return;
        
        //if translate3d isn't supported use 2d instead 
        obj.translate = 'translate3d';
        obj.translateEnd = '0px, 0px';

        var div = document.createElement('div');
        if(div.style.perspective === undefined){
            obj.translate = 'translate';
            obj.translateEnd = '0px';
        }

        buildSlider.call(obj);
        
        obj.lastSlide = obj.slides.lastChild;
        obj.totalWidth = getTotalWidth(obj.sliderWidth, obj.slideItems);
        obj.isPaused = false;
        obj.sliderPosition = (-obj.sliderWidth);
        
        //dots
        obj.dotContainer = document.getElementById(obj.options.domid + '-dots');
        obj.dots = obj.dotContainer.getElementsByTagName('span');
        obj.dotClass = obj.options.dotClass;
        obj.activeDotClass = obj.options.activeDotClass;

        initializeSlider.call(obj);
        
        //fallback event listenter for a certain browser...
        if(!window.addEventListener){
            window.attachEvent('resize', function(){
                resizeslider.call(obj);
            });
        }else{
            window.addEventListener('resize', function(){
                resizeslider.call(obj);
            });
        }
        
    }
    function resizeslider(){

        var obj = this;

        obj.isPaused = true;
        
        
        obj.sliderWidth = obj.slider.clientWidth;
        setslidewidth.call(obj, obj.sliderWidth);
        
        
        var getdot = document.getElementById(obj.options.activeDotClass);
        var dotnum = parseInt(getdot.childNodes[0].innerHTML);
        
        //get current slider position
        obj.totalWidth = getTotalWidth(obj.sliderWidth, obj.slideItems);
        obj.sliderPosition = (-obj.sliderWidth * dotnum);
       
        obj.slides.style.webkitTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
        obj.slides.style.msTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
        obj.slides.style.transform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';

        setTimeout(function(){
            obj.isPaused = false;
        }, obj.options.pauseDuration)
    }
    function initializeSlider(){
        var obj = this;

        //set transition duration to 0 to hide placement of 
        //the starting clone slide
        obj.slides.style.transitionDuration = 0;
        obj.slides.style.msTransitionDuration = 0;
        obj.slides.style.webkitTransform = obj.translate + '(-'+obj.sliderWidth+'px, '+ obj.translateEnd + ')';
        obj.slides.style.msTransform = obj.translate + '(-'+obj.sliderWidth+'px, '+ obj.translateEnd + ')';
        obj.slides.style.transform = obj.translate + '(-'+obj.sliderWidth+'px, '+ obj.translateEnd + ')';

        setslidewidth.call(obj, obj.sliderWidth);

        //reset the transition duration
        setTimeout(function(){
            obj.slides.style.transitionDuration = obj.options.transDuration + 'ms';
            obj.slides.style.msTransitionDuration = obj.options.transDuration + 'ms';
        }, 100);

        
        
        obj.index = 0;

        var duration = obj.options.transDuration;
        
        obj.transTime = obj.options.transTime;
        obj.TRANS_TIME = obj.options.transTime

        function carousel(){
            if(!obj.isPaused){
                obj.sliderPosition -= obj.sliderWidth;
                animateSlide.call(obj);
            }
            setTimeout(carousel, obj.transTime)
        }
        setTimeout(carousel, obj.transTime);
        function dotHelper(obj){
            return function (e){
                obj.dots[obj.index].id = '';

                for(var j = 0; j < obj.dots.length; j++){
                    obj.dots[j].className = obj.dotClass;
                }
                obj.index = parseInt(this.childNodes[0].innerHTML -1);
                obj.dots[obj.index].id = obj.activeDotClass;
                var newPosition = (obj.index * obj.sliderWidth) + obj.sliderWidth;
                
                obj.slides.style.webkitTransform = obj.translate + '(-'+newPosition+'px, ' + obj.translateEnd + ')';
                obj.slides.style.msTransform = obj.translate + '(-'+newPosition+'px, ' + obj.translateEnd + ')';
                obj.slides.style.transform = obj.translate + '(-'+newPosition+'px, ' + obj.translateEnd + ')';
                this.className = obj.dotClass + ' ' + obj.activeDotClass;
                
                obj.sliderPosition = (-newPosition);
                obj.isPaused = true;

                window.clearTimeout(dotTimeout);
                var dotTimeout = setTimeout(function(){
                    obj.isPaused = false;
                    
                }, obj.options.pauseDuration);
            }
        }
        
        obj.dots[obj.index].id = obj.activeDotClass;
        for(var i = 0; i < obj.dots.length; i++){
            
            obj.dots[i].className = obj.dotClass;
            obj.dots[0].className = obj.dotClass + ' ' + obj.activeDotClass;

            obj.dots[i].onclick = dotHelper(obj);
        }

        var prevIcon = document.getElementById(obj.options.domid + '-prev');
        var nextIcon = document.getElementById(obj.options.domid + '-next');
        nextIcon.isAnimating = false;
        prevIcon.isAnimating = false;
        
        nextIcon.onclick = function(){
            
            var self = this;
            if(self.isAnimating){
                return;
            }
            
            //move sliderPosition to the left
            obj.sliderPosition -= obj.sliderWidth;

            obj.isPaused = false;
            animateSlide.call(obj);
            obj.isPaused = true;

            //if last slide
            if(obj.index === 0 ){
                self.isAnimating = true;
                setTimeout(function(){
                    self.isAnimating = false;
                    obj.sliderPosition = (-obj.sliderWidth);
                    obj.slides.style.transitionDuration = '0s';
                    obj.slides.style.msTransitionDuration = '0s';
                    obj.slides.style.webkitTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.msTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.transform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                }, duration);
            }
            
            window.clearTimeout(nextTimeout);
            var nextTimeout = setTimeout(function(){
                obj.isPaused = false;
            }, obj.options.pauseDuration);
            
        }
        prevIcon.onclick = function(){
            
            var self = this;
            if(self.isAnimating){
                return;
            }
            //move sliderPosition to the right
            obj.sliderPosition += obj.sliderWidth;
            
            obj.dots[obj.index].className = obj.options.activeDotClass;
            
            //if on first slide change obj.index to last slide
            if(obj.index === 0){
                obj.index = obj.dots.length;
                self.isAnimating = true;
                setTimeout(function(){
                    self.isAnimating = false;
                }, duration)
            }
            
            obj.isPaused = false;
            animateSlide.call(obj, 'back');
            obj.isPaused = true;

            window.clearTimeout(prevTimeout);
            var prevTimeout = setTimeout(function(){
                obj.isPaused = false;
            }, obj.options.pauseDuration);
        }

        

        document.getElementById(this.options.viewport).onmouseenter = function(){
            obj.isPaused = true;
        }
        document.getElementById(this.options.viewport).onmouseleave = function(){
            obj.isPaused = false;
        }

    }//initializeSlider

    function setslidewidth(sliderWidth){
        var obj = this;

        for(var i = 0; i < obj.slideItems.length; i++){
            obj.slideItems[i].style.display = 'block';
            obj.slideItems[i].style.float = 'left';
            obj.slideItems[i].style.width = sliderWidth + 'px';
        }
    }

    function animateSlide(direction){
            var obj = this;
            
            if(!obj.isPaused){
                if(obj.totalWidth + obj.sliderPosition !== 0){
                    
                    if(obj.dots[obj.index]){
                        obj.dots[obj.index].className = obj.dotClass;
                        obj.dots[obj.index].id = '';
                    }

                    obj.slides.style.transitionDuration = obj.options.transDuration + 'ms';
                    obj.slides.style.msTransitionDuration = obj.options.transDuration + 'ms';

                    if(direction && direction === 'back'){
                        
                        obj.index--;
                        
                        if(obj.sliderPosition == 0){
                            setTimeout(function(){
                                obj.slides.style.transitionDuration = '0s';
                                obj.slides.style.msTransitionDuration = '0s';
                                obj.sliderPosition = -(obj.totalWidth - obj.sliderWidth * 2);
                                obj.slides.style.webkitTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                                obj.slides.style.msTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                                obj.slides.style.transform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                                obj.index = obj.dots.length - 1;
                            }, obj.options.transDuration);
                        }
                    }else{
                        obj.index++;
                    }
                    
                    
                    obj.slides.style.webkitTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.msTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.transform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    
                    //if end of slider cut the transition time in half
                    //to create a seemless transtion back to the first slide
                    if(!obj.dots[obj.index]){ 
                        obj.index = 0;
                        obj.transTime /= 2;
                    }else{
                        obj.transTime = obj.TRANS_TIME;
                    }
                    
                    obj.dots[obj.index].className = obj.dotClass + ' ' + obj.activeDotClass;
                    obj.dots[obj.index].id = obj.activeDotClass;

                }else{

                    obj.index = 0;
                    obj.sliderPosition = (-obj.sliderWidth);
                    
                    obj.slides.style.transitionDuration = '0s';
                    obj.slides.style.msTransitionDuration = '0s';
                    obj.slides.style.webkitTransform = obj.translate + '(-'+obj.sliderWidth+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.msTransform = obj.translate + '(-'+obj.sliderWidth+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.transform = obj.translate + '(-'+obj.sliderWidth+'px, ' + obj.translateEnd + ')';

                    //clearInterval(carousel);
                }
            }
            /*setTimeout(function(){
                if(callback){
                callback();
            }
        }, 650 );*/
            
        }//animateSlide

    function buildSlider(){
        var obj = this;
        var firstSlide = obj.slideItems[0].cloneNode(true);
        var lastSlide = obj.slideItems[obj.slideItems.length -1].cloneNode(true);
        
        lastSlide.className = 'lastSlide';
        
        /*slider.style.overflow = 'hidden';*/
        obj.slider.style.height = '100%';
        /*slider.style.position = 'relative';*/
        obj.slides.style.width = '2000%';

       
        var prevIcon = document.createElement('a');

        var dotContainer = document.createElement('div');
        var sliderDots = document.createElement('div');
        dotContainer.style.position = 'relative';
        dotContainer.style.marginTop = '10px';
        sliderDots.style.textAlign = 'center';
        
        sliderDots.appendChild(prevIcon);
        
        for(var i = 0; i < obj.slideItems.length; i++){
            var dot = document.createElement('span');
            var anchor = document.createElement('a');
            anchor.innerHTML = i + 1;
            dot.appendChild(anchor);
            dot.style.display = 'inline-block';

            sliderDots.appendChild(dot);
        }

        if(!obj.options.includeDots){
            sliderDots.style.display = 'none';
        }
        //add clone slides after building dots
        obj.slides.insertBefore(lastSlide, obj.slides.childNodes[0]);
        obj.slides.appendChild(firstSlide);

        var nextIcon = document.createElement('a');
        sliderDots.appendChild(nextIcon);

        prevIcon.className = 'fa fa-chevron-left hub-slider-arrow';
        nextIcon.className = 'fa fa-chevron-right hub-slider-arrow';
        prevIcon.id = obj.options.domid + '-prev';
        nextIcon.id = obj.options.domid + '-next';

        sliderDots.id = obj.options.domid + '-dots';

        dotContainer.appendChild(sliderDots);
        obj.slider.appendChild(dotContainer);

    }


    function getTotalWidth(sliderWidth, slideItems){
        return sliderWidth * slideItems.length;
    }
    function extendedDefaults(source, properties){
        var property;
        for(property in properties){
            if(properties.hasOwnProperty(property)){
                source[property] = properties[property];
            }
        }
        return source;
    }
}());