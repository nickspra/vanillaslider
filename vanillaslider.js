(function(){
    this.hubSlider = function(){

        var defaults = {
            domid               : "hub-slider",
            viewport            : "hub-slider-viewport",
            dotClass            : "hub-slider-dot",
            activeDotClass      : "active-dot",
            transDuration       : 600,
            easing              : "",
            transTime           : 1000,
            pauseDuration       : 5000,
            includeDots         : true,
            arrowClass          : 'hubslider_arrow',
            dotPagination       : false,
            dotPaginationClass  : '',
            paginationDivision  : 'of',
            imageDots           : false,
            autoScroll          : true,
            liClass             : ''
        }

        if(arguments[0] && typeof arguments[0] === "object"){
            this.options = extendedDefaults(defaults, arguments[0]);
        }
    }

    hubSlider.prototype.init = function(){
        var obj = this;
        obj.slider = document.getElementById(obj.options.domid);
        obj.sliderViewport = document.getElementById(obj.options.viewport);
        if(obj.slider) obj.slider.flag = true;
        
        obj.slider.longTouch = undefined;
        obj.touchstartx = undefined;

        obj.sliderWidth = obj.slider.clientWidth;
        obj.slides = obj.slider.getElementsByTagName('ul')[0];
        if(!obj.options.liClass){
            obj.slideItems = obj.slides.getElementsByTagName('li');
        }else{
            obj.slideItems = obj.slides.querySelectorAll('.'+obj.options.liClass);
        }
        
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
        if(obj.options.liClass){
            obj.slideItems = obj.slides.querySelectorAll('.'+obj.options.liClass);
        }
        obj.lastSlide = obj.slides.lastChild;
        obj.totalWidth = getTotalWidth(obj.sliderWidth, obj.slideItems);
        obj.isPaused = false;
        obj.sliderPosition = (-obj.sliderWidth);
        
        //dots
        obj.dotContainer = document.getElementById(obj.options.domid + '_dots');
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

        var getdot = document.getElementById(obj.activeDotClass+'_' +obj.options.domid);
        
        if(!getdot) return;//if dot no longer exists don't resize;

        obj.isPaused = true;
        
        
        obj.sliderWidth = obj.slider.clientWidth;
        setslidewidth.call(obj, obj.sliderWidth);
        
        
        
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
        obj.slides.style.msTransitionDuration = 0;
        obj.slides.style.transitionDuration = 0;
        
        obj.slides.style.webkitTransform = obj.translate + '(-'+obj.sliderWidth+'px, '+ obj.translateEnd + ')';
        obj.slides.style.msTransform = obj.translate + '(-'+obj.sliderWidth+'px, '+ obj.translateEnd + ')';
        obj.slides.style.transform = obj.translate + '(-'+obj.sliderWidth+'px, '+ obj.translateEnd + ')';

        setslidewidth.call(obj, obj.sliderWidth);

        //reset the transition duration
        setTimeout(function(){
            obj.slides.style.msTransitionDuration = obj.options.transDuration + 'ms';
            obj.slides.style.transitionDuration = obj.options.transDuration + 'ms';
            
        }, 100);

        obj.index = 0;

        var duration = obj.options.transDuration;
        
        obj.transTime = obj.options.transTime;
        obj.TRANS_TIME = obj.options.transTime

        if(obj.options.autoScroll){
            function carousel(){
                if(!obj.isPaused){
                    obj.sliderPosition -= obj.sliderWidth;
                    animateSlide.call(obj);
                }
                setTimeout(carousel, obj.transTime)
            }
            setTimeout(carousel, obj.transTime);
        }
        
        
        obj.dots[obj.index].id = obj.activeDotClass+'_' +obj.options.domid;
        for(var i = 0; i < obj.dots.length; i++){
            
            obj.dots[i].className = obj.dotClass;
            obj.dots[0].className = obj.dotClass + ' ' + obj.activeDotClass;

            if(!obj.options.dotPagination){
                obj.dots[i].onclick = dotHelper(i);
            }else{//if not dotPagination
                 obj.dots[i].style.display = 'none';
                 obj.dots[0].style.display = 'inline-block';
            }
        }
        if(obj.options.dotPagination){
            var dp = obj.dotContainer.querySelector('.'+obj.options.dotPaginationClass);
            var dpLength = document.createElement('div');
            dpLength.style.display = 'inline';
            dpLength.innerHTML = " " + obj.options.paginationDivision + " " + obj.dots.length;
            dp.appendChild(dpLength);
            
        }
        function dotHelper(i){

            return function(){
                
                obj.dots[obj.index].id = '';

                for(var j = 0; j < obj.dots.length; j++){
                    obj.dots[j].className = obj.dotClass;
                }
                obj.index = parseInt(this.childNodes[0].innerHTML -1);
                
                obj.dots[obj.index].id = obj.activeDotClass+'_' +obj.options.domid;
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
/*
        obj.sliderViewport.ontouchstart = function(e){
            
            setTimeout(function() {
                obj.slider.longTouch = true;
            }, 250);
            
            obj.touchstartx = e.pageX;
            obj.slides.style.msTransitionDuration = 0;
            obj.slides.style.transitionDuration = 0;
        }
        
        obj.sliderViewport.ontouchmove = function(e){
            obj.isAnimating = true;
            obj.touchmovex = e.pageX;
            
            obj.movex = (obj.sliderPosition* (-1)) + (obj.touchstartx - obj.touchmovex);

            obj.slides.style.webkitTransform = obj.translate + '(-'+obj.movex+'px, ' + obj.translateEnd + ')';
            obj.slides.style.msTransform = obj.translate + '(-'+obj.movex+'px, ' + obj.translateEnd + ')';
            obj.slides.style.transform = obj.translate + '(-'+obj.movex+'px, ' + obj.translateEnd + ')';
  
        }*/
        /*obj.sliderViewport.ontouchend = function(e){
            console.log(obj.index)
            var index = obj.index +1;
            var newPosition = (index * obj.sliderWidth) + obj.sliderWidth;

            if((-obj.movex)>obj.sliderPosition){
                obj.sliderPosition += obj.sliderWidth;
                if(obj.index === 0){
                    obj.index = obj.dots.length - 1;
                    obj.isAnimating = true;
                    setTimeout(function(){
                        obj.isAnimating = false;
                    }, duration)
                    if(obj.options.dotPagination){
                        obj.dots[0].style.display = 'none';
                    }
                    index=obj.index;
                    newPosition = 0;

                }else{
                    obj.index--;
                }

            }else{
                obj.sliderPosition -= obj.sliderWidth;
                obj.index++;

                if(!obj.dots[obj.index]){ 
                    
                    obj.index = 0;
                    //obj.transTime /= 2;
                    //var index = 0;
                }else{
                    //obj.transTime = obj.TRANS_TIME;
                }
            }
            console.log(newPosition)
            //console.log("index: "+ index)
            
            var absMove = Math.abs(index *obj.sliderWidth - obj.movex);
            //console.log(absMove)
            if (absMove > this.sliderWidth/3 || this.longTouch === false) {
                if (obj.movex > index * obj.sliderWidth && index < 3) {
                  
                } else if (obj.movex < index*obj.sliderWidth && index > 0) {
                  
                }
              }
              //console.log("newPosition: " +newPosition)
            obj.slides.style.msTransitionDuration = obj.options.transDuration + 'ms';
            obj.slides.style.transitionDuration = obj.options.transDuration + 'ms';

            obj.slides.style.webkitTransform = obj.translate + '(-'+newPosition+'px, ' + obj.translateEnd + ')';
            obj.slides.style.msTransform = obj.translate + '(-'+newPosition+'px, ' + obj.translateEnd + ')';
            obj.slides.style.transform = obj.translate + '(-'+newPosition+'px, ' + obj.translateEnd + ')';
              
              if(obj.index === 0 ){
                obj.isAnimating = true;
                setTimeout(function(){
                    obj.isAnimating = false;
                    obj.sliderPosition = (-obj.sliderWidth);
                    obj.slides.style.msTransitionDuration = '0s';
                    obj.slides.style.transitionDuration = '0s';
                    
                    obj.slides.style.webkitTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.msTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.transform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                }, duration);
            }
            if(obj.index === obj.dots.length - 1){
                obj.isAnimating = true;
                setTimeout(function(){
                    var testing = (index * obj.sliderWidth) + obj.sliderWidth;
                    obj.isAnimating = false;
                    obj.sliderPosition = -(testing);
                    obj.slides.style.msTransitionDuration = '0s';
                    obj.slides.style.transitionDuration = '0s';
                    
                    obj.slides.style.webkitTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.msTransform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                    obj.slides.style.transform = obj.translate + '('+obj.sliderPosition+'px, ' + obj.translateEnd + ')';
                }, duration);
            }
        }*/

        var prevIcon = document.getElementById(obj.options.domid + '_prev');
        var nextIcon = document.getElementById(obj.options.domid + '_next');
        nextIcon.isAnimating = false;
        prevIcon.isAnimating = false;
        


        nextIcon.onclick = function(){
            
            if(obj.isAnimating){
                return;
            }
            
            //move sliderPosition to the left
            obj.sliderPosition -= obj.sliderWidth;

            obj.isPaused = false;
            animateSlide.call(obj);
            obj.isPaused = true;

            //if last slide
            if(obj.index === 0 ){
                obj.isAnimating = true;
                setTimeout(function(){
                    obj.isAnimating = false;
                    obj.sliderPosition = (-obj.sliderWidth);
                    obj.slides.style.msTransitionDuration = '0s';
                    obj.slides.style.transitionDuration = '0s';
                    
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
            
            
            if(obj.isAnimating){
                return;
            }
            //move sliderPosition to the right
            obj.sliderPosition += obj.sliderWidth;
            
            obj.dots[obj.index].className = obj.options.dotClass;
            
            //if on first slide change obj.index to last slide
            if(obj.index === 0){
                obj.index = obj.dots.length;
                obj.isAnimating = true;
                setTimeout(function(){
                    obj.isAnimating = false;
                }, duration)
                if(obj.options.dotPagination){
                    obj.dots[0].style.display = 'none';
                }
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
            obj.slideItems[i].style.opacity = "1";
        }
    }

    function animateSlide(direction){
        var obj = this;
        
        if(!obj.isPaused){
            if(obj.totalWidth + obj.sliderPosition !== 0){
                
                if(obj.dots[obj.index]){
                    obj.dots[obj.index].className = obj.dotClass;
                    obj.dots[obj.index].id = '';
                    if(obj.options.dotPagination){
                        obj.dots[obj.index].style.display = 'none';
                    }
                }

                obj.slides.style.msTransitionDuration = obj.options.transDuration + 'ms';
                obj.slides.style.transitionDuration = obj.options.transDuration + 'ms';
                

                if(direction && direction === 'back'){
                    
                    obj.index--;
                    
                    if(obj.sliderPosition == 0){
                        setTimeout(function(){
                            obj.slides.style.msTransitionDuration = '0s';
                            obj.slides.style.transitionDuration = '0s';
                            
                            obj.sliderPosition = -(obj.totalWidth - obj.sliderWidth * 2);
                            transformSlides(obj.translate, obj.sliderPosition, obj.translateEnd);
                           
                            obj.index = obj.dots.length - 1;
                        }, obj.options.transDuration);
                    }
                }else{
                    obj.index++;
                }
                
                transformSlides(obj.translate, obj.sliderPosition, obj.translateEnd);
                
                
                //if end of slider cut the transition time in half
                //to create a seemless transtion back to the first slide
                if(!obj.dots[obj.index]){ 
                    obj.index = 0;
                    obj.transTime /= 2;
                }else{
                    obj.transTime = obj.TRANS_TIME;
                }
                
                obj.dots[obj.index].className = obj.dotClass + ' ' + obj.activeDotClass;
                obj.dots[obj.index].id = obj.activeDotClass+'_' +obj.options.domid;
                
                if(obj.options.dotPagination){
                    obj.dots[obj.index].style.display = 'inline';
                }

            }else{

                obj.index = 0;
                obj.sliderPosition = (-obj.sliderWidth);
                
                obj.slides.style.msTransitionDuration = '0s';
                obj.slides.style.transitionDuration = '0s';
                

                obj.slides.style.webkitTransform = obj.translate + '(-'+obj.sliderWidth+'px, ' + obj.translateEnd + ')';
                obj.slides.style.msTransform = obj.translate + '(-'+obj.sliderWidth+'px, ' + obj.translateEnd + ')';
                obj.slides.style.transform = obj.translate + '(-'+obj.sliderWidth+'px, ' + obj.translateEnd + ')';

                //clearInterval(carousel);
            }
        }
        
        function transformSlides(one, two, three){
            obj.slides.style.webkitTransform = one + '('+two+'px, ' + three + ')';
            obj.slides.style.msTransform = one + '('+two+'px, ' + three + ')';
            obj.slides.style.transform = one + '('+two+'px, ' + three + ')';
        }
    }//animateSlide

    function buildSlider(){
        var obj = this;
        var firstSlide = obj.slideItems[0].cloneNode(true);
        var lastSlide = obj.slideItems[obj.slideItems.length -1].cloneNode(true);
        
        lastSlide.className = obj.options.liClass;
        firstSlide.className = obj.options.liClass;

        obj.slides.style.width = '2000%';
        obj.slides.style.padding = '0px';

        var dotContainer = document.createElement('div');
        var sliderDots = document.createElement('div');

        sliderDots.style.textAlign = 'center';
        
        
        if(obj.options.dotPagination){
            var dpContainer = document.createElement('div');
            dpContainer.className = obj.options.dotPaginationClass;
        }   
        for(var i = 0; i < obj.slideItems.length; i++){
            var dot = document.createElement('span');
          
            dot.style.display = 'inline-block';
            var anchor = document.createElement('a');
            anchor.innerHTML = i + 1;
            dot.appendChild(anchor);

            //customized slider for about page timeline
            var yearValue = obj.slideItems[i].querySelector('.timeline_year');
            if(yearValue){
                yearValue = yearValue.getAttribute('data-year');
                var year = document.createElement('i');
                year.innerHTML = yearValue;
                dot.appendChild(year);
            }

            if(obj.options.imageDots){
                var slideContent = obj.slideItems[i].getElementsByTagName('img')[0].src;
                var image = document.createElement('img');
                
                if(slideContent){
                    image.src = slideContent;
                }else{

                    //image.src = obj.slideItems[i].
                }
                dot.appendChild(image);
            }
            

            if(!obj.options.dotPagination){
                sliderDots.appendChild(dot);
            }else{
                dpContainer.appendChild(dot);
            }

        }
        if(obj.options.dotPagination){
            sliderDots.appendChild(dpContainer);
        }
        if(!obj.options.includeDots){
            sliderDots.style.display = 'none';
        }

        //add clone slides after building dots
        obj.slides.insertBefore(lastSlide, obj.slides.childNodes[0]);
        obj.slides.appendChild(firstSlide);

        var prevIcon = document.createElement('a');
        var nextIcon = document.createElement('a');
        //sliderDots.appendChild(nextIcon);
        obj.sliderViewport.appendChild(prevIcon);
        obj.sliderViewport.appendChild(nextIcon);

        prevIcon.className = obj.options.arrowClass + ' ' + obj.options.arrowClass+'_prev';
        nextIcon.className = obj.options.arrowClass + ' ' + obj.options.arrowClass+'_next';
        prevIcon.id = obj.options.domid + '_prev';
        nextIcon.id = obj.options.domid + '_next';

        sliderDots.id = obj.options.domid + '_dots';
        sliderDots.className = obj.options.dotClass + '_container';

        //dotContainer.appendChild(sliderDots);
        obj.slider.appendChild(sliderDots);

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