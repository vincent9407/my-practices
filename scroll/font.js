
var Scroll = {};
(function(win,doc,$){
   	function CusScrollBar(options) {
		// 初始化
		this._init(options);
	}
	// 在原型上添加方法
	$.extend(CusScrollBar.prototype,{
		_init : function(options) {
			var self = this;
			self.options = {
				contSelector: "",   // 滑动内容区选择器
				barSelector: "",    // 滑动条选择器
				sliderSelector: "", // 滑动块选择器
				tabItemSelector: "",// 标签选择器
				tabActiveClass: "" ,// 选中的标签样式
				anchorSelector: "", // 锚点选择器
				wheelStep: 15       // 滚动步幅
			};
			$.extend(true,self.options,options || {});
			// Dom选择函数
			self._initDomEvent();
			// 绑定滑块点击拖动事件
			self._initSliderDragEvent();
			// 绑定滚轮事件
			self._bandMouseWheel();
			// 监听内容滚动，同步滑块移动
			self._bandContScroll();
			// 点击切换标签
			self._initTabEvent();
			return self;
		   },
		/*
   	     * 初始化DOM引用
   	     * @method _initDomEvent
   	     * @return {CusScrollBar}
   	     */
         _initDomEvent : function(){
   		 var opts = this.options;
   		 // 滑动内容区对象，必须填
   		 this.$cont = $(opts.contSelector);
   		 // 滑动条滑块对象，必须填
   		 this.$slider = $(opts.sliderSelector);
   		 // 滑动条对象
   		 this.$bar = opts.barSelector ? $(opts.barSelector) : this.$slider.parent();
		 // 文档对象
   		 this.$doc = $(doc);
	 	 // 标签对象
		 this.$tabItem = $(opts.tabItemSelector);
		 // 锚点对象
         this.$anchor = $(opts.anchorSelector);
   	     },
   	     /*
   	      * 初始化滑动块滑动功能
   	      * @return {[object]} [this]
   	      */
		_initSliderDragEvent: function(){
			var self = this;
			var slider = self.$slider;
			var cont = self.$cont;
			var doc = self.$doc,
				dragStartPagePosition,
				dragStartScrollPosition,
				dragContBarRate;

				function mousemoveHandler(e){
					if(dragStartPagePosition == null){
						return;
					}
					self.scrollContTo(dragStartScrollPosition + (e.pageY - dragStartPagePosition)*dragContBarRate);
				}

   		 	slider.on("mousedown", function (event){
   		 	    event.preventDefault();
				dragStartPagePosition = event.pageY;
				dragStartScrollPosition = cont[0].scrollTop;
				dragContBarRate = self.getMaxScrollPosition()/self.getMaxSliderPosition();

   		 		doc.on("mousemove.scroll", function(event){
					event.preventDefault();
   		 			mousemoveHandler(event);
				}).on("mouseup.scroll", function(event){
					event.preventDefault();
					doc.off(".scroll");
   		       });
			});
   		},

   		// 监听内容滚动事件，同步滑块位置
   		_bandContScroll : function() {
   			var self = this;
   			self.$cont.on("scroll", function(e) {
   				e.preventDefault();
   				self.$slider.css( 'top', self.getSliderPosition() + 'px');
   			});
   		},

   		// 绑定鼠标滚轮事件
   		_bandMouseWheel : function() {
   			var self = this;
   			self.$cont.on("mousewheel DOMMouseScroll", function(e) {
   				e.preventDefault();
   				var oEv = e.originalEvent;
   				var wheelRange = oEv.wheelDelta ? -oEv.wheelDelta/120 : (oEv.detail || 0)/3;
   				self.scrollContTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);
   			});
   			return self;
   		},
		/*
		 *初始化标签切换功能
		 * @return {[object]} [this]
		 */
		_initTabEvent : function() {
		    var self = this;
			self.$tabItem.on("click", function (e) {
				e.preventDefault();
				var index = $(this).index();
				self.changeTabSelect(index);
				// 切换标签后同步内容
				self.scrollContTo(self.$cont[0].scrollTop + self.getAnchorPosition(index));
			});
		},
		// 切换标签
		changeTabSelect : function (index) {
			var self = this;
			var active = self.options.tabActiveClass;
			self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);
			return self;
		},

		// 获取每个锚点位置信息的数据
		getAllAnchorPosition : function () {
			var self = this;
			var allAnchor = [];
			for(var i = 0; i < self.$anchor.length; i++ ) {
				allAnchor.push(self.$cont[0].scrollTop + self.getAnchorPosition(i));
			}
			return allAnchor;
		},

		// 获取指定锚点到容器上边界的位置
		getAnchorPosition : function (index) {
			var self = this;
			return self.$anchor.eq(index).position().top;
		},

   		// 获取滑块位置
   		getSliderPosition : function() {
   			var self = this;
   			return self.$cont[0].scrollTop/(self.getMaxScrollPosition()/self.getMaxSliderPosition());
   		},

		// 文档可滚动最大距离
		getMaxScrollPosition : function() {
			var self = this;
			return Math.max(self.$cont.height(),self.$cont[0].scrollHeight) - self.$cont.height();
		},

		// 滑块可移动最大距离
		getMaxSliderPosition : function() {
			var self = this;
			return self.$bar.height() - self.$slider.height();
		},

		// 滚动文档内容
		scrollContTo : function(positionVal) {
			var self = this;
			var anchorArr = self.getAllAnchorPosition();
			function getIndex(positionVal) {
				for (var i = anchorArr.length; i >= 0; i--) {
					if (positionVal >= anchorArr[i]) return i;
				}
			}
			// 锚点数与标签数一样的话
			if(self.$tabItem.length == anchorArr.length) self.changeTabSelect(getIndex(positionVal));
			self.$cont.scrollTop(positionVal);
		}
	});
	Scroll.CusScrollBar = CusScrollBar;
})(window,document,jQuery);

var scroll_1 = new Scroll.CusScrollBar({
	contSelector   : ".scroll-cont",   // 滑动内容区选择器(必须)
   	barSelector    : ".scroll-bar",    // 滑动条选择器（必须）
   	sliderSelector : ".scroll-slider", // 滑动快选择器
	tabItemSelector: ".tab-item",      // 标签选择器（必须）
	tabActiveClass : ".tab-active",     // 选中标签样式
	anchorSelector : ".anchor"         // 锚点选择器（必须）
   });
