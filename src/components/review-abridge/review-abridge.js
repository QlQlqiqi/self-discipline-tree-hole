const computedBehavior = require('miniprogram-computed').behavior;
const app = getApp();
Component({
	behaviors: [computedBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {
		// 放大后，组件下面的安全区域高度
		safeAreaBottom: Number,
		// 组件缩小时的高度
		componentHeightMin: Number,
		// 组件放大的宽度
		componentWidthMax: Number,
		// 星星的数量
		starsNum: Number,
		// 任务的内容，每个任务为 {content: String}
		tasks: Array
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 同比例放大系数，不能超过最大限度
		ratioEnlarge: 1,
		// 缩小时缩略图宽度
		componentWidthMin: app.globalData.windowWidth
	},

	computed: {

		// 比例系数
		ratio: function(data) {
			return data.ratioEnlarge * data.componentWidthMin / 375;
		},

		// 组件当前的宽度

		// 组件根元素的 style {width, padding}
		componentWrapStyle: function(data) {
			let width = data.ratioEnlarge * data.componentWidthMin,
				padding = `${6 * data.ratio}px 0 ${data.ratioEnlarge === 1? 12 * data.ratio: 12 * data.ratio + data.safeAreaBottom}px 0`;
			return `width: ${width}px; padding: ${padding};`;
		},

		// 上面部分的 style 
		// {width, height, margin-top, margin-left, border-radius}
		// @return {String}
		abridgeStarsWrap: function(data) {
			let width = 333 * data.ratio,
				height = 83 * data.ratio,
				marginTop = 6 * data.ratio,
				marginLeft = 21 * data.ratio,
				borderRadius = 7 * data.ratio;
			return `width: ${width}px; height: ${height}px; margin-top: ${marginTop}px; margin-left: ${marginLeft}px; border-radius: ${borderRadius}px;`;
		},

		// star 对象信息组成的，每个对象为 
		// {src, style: {left, top, width, height}}
		// @return {Array}
		stars: function(data) {
			let stars = [
				{style: `left: ${68 * data.ratio}px; top: ${35 * data.ratio}px;`},
				{style: `left: ${106 * data.ratio}px; top: ${20 * data.ratio}px;`},
				{style: `left: ${150 * data.ratio}px; top: ${8 * data.ratio}px;`},
				{style: `left: ${193 * data.ratio}px; top: ${20 * data.ratio}px;`},
				{style: `left: ${234 * data.ratio}px; top: ${35* data.ratio}px;`},
			];
			for(let i = 0; i < 5; i++) {
				stars[i].src = i < data.starsNum
					? '/src/image/star-finished.svg'
					: '/src/image/star-unfinished.svg';
				stars[i].style += `width: ${31 * data.ratio}px; height: ${31 * data.ratio}px;`;
			}
			return stars;
		},

		// 中间部分的 style 
		// {width, height, margin-top, margin-left, font-size, border-radius}
		// @return {String}
		abridgeEvaluateWrap: function(data) {
			let width = 333 * data.ratio,
				height = 71 * data.ratio,
				marginTop = 6 * data.ratio,
				marginLeft = 21 * data.ratio,
				borderRadius = 7 * data.ratio;
			return `width: ${width}px; height: ${height}px; margin-top: ${marginTop}px; margin-left: ${marginLeft}px; border-radius: ${borderRadius}px;`;
		},

		// 中间部分文字对象组成，每个对象为 
		// {
		// 	title: { 
		//		content, 
		// 		style: {top, left, height, line-height, font-size}
		// 	}, 
		// 	content: {
		//		content, 
		//		style: {top, left, height, line-height, font-size}
		//	}
		// }
		// @return {Array}
		abridgeEvaluate: function(data) {
			return [
				{
					title: {
						content: '今日完成',
						style: `top: ${10 * data.ratio}px; left: ${30 * data.ratio}px; height: ${19 * data.ratio}px; line-height: ${19 * data.ratio}px; font-size: ${16 * data.ratio}px;`
					},
					content: {
						content: data.tasks.length,
						style: `top: ${30 * data.ratio}px; left: ${50 * data.ratio}px; height: ${37 * data.ratio}px; line-height: ${37 * data.ratio}px; font-size: ${24 * data.ratio}px;`
					}
				},
				{
					title: {
						content: '今日评星',
						style: `top: ${10 * data.ratio}px; left: ${133 * data.ratio}px; height: ${19 * data.ratio}px; line-height: ${19 * data.ratio}px; font-size: ${16 * data.ratio}px;`
					},
					content: {
						content: data.starsNum,
						style: `top: ${30 * data.ratio}px; left: ${147 * data.ratio}px; height: ${37 * data.ratio}px; line-height: ${37 * data.ratio}px; font-size: ${24 * data.ratio}px;`
					}
				},
				{
					title: {
						content: '今日效率',
						style: `top: ${10 * data.ratio}px; left: ${230 * data.ratio}px; height: ${19 * data.ratio}px; line-height: ${19 * data.ratio}px; font-size: ${16 * data.ratio}px;`
					},
					content: {
						content: data.starsNum <= 1? '低': data.starsNum >= 5? '高': '中',
						style: `top: ${30 * data.ratio}px; left: ${256 * data.ratio}px; height: ${37 * data.ratio}px; line-height: ${37 * data.ratio}px; font-size: ${24 * data.ratio}px;`
					}
				}
			]
		},

		// 下面部分的 style 
		// {width, height, margin, border-radius, padding-bottom}
		// @return {String}
		abridgeTasksWrap: function(data) {
			let width = 333 * data.ratio,
				margin = `${8 * data.ratio}px 0 0 ${21 * data.ratio}px`,
				borderRadius = 7 * data.ratio,
				paddingBottom = 15 * data.ratio;
			return `width: ${width}px; margin: ${margin}; border-radius: ${borderRadius}px; padding-bottom: ${paddingBottom}px;`;
		},
		
		// 下面部分“已完成”标题的 style 
		// {margin, font-size}
		// @return {String}
		abridgeTasksTitle: function(data) {
			return `margin: ${13 * data.ratio}px; font-size: ${20 * data.ratio}px;`
		},

		// 下面部分进入“历史”页面的 icon 的 style 
		// {width, height, top, right}
		// @return {String}
		abridgeHistoryIcon: function(data) {
			return `width: ${24 * data.ratio }px; height: ${24 * data.ratio}px; top: ${20 * data.ratio}px; right: ${20 * data.ratio}px;`;
		},

		// 包裹任务的 style {width, min-height, margin}
		// @return {String}
		abridgeTaskWrapStyle: function(data) {
			return `width: ${313 * data.ratio}px; min-height: ${28 * data.ratio}px; margin: ${20 * data.ratio}px 0 0 ${20 * data.ratio}px;`;
		},

		// 下面部分每个任务前面“对号”logo的 style {width, height}
		// @return {String}
		abridgeTaskWrapIconStyle: function(data) {
			return `width: ${24 * data.ratio}px; height: ${24 * data.ratio}px;`
		},

		// 下面部分每个任务内容的 style {font-size, line-height, margin-left, width}
		// @return {String}
		abridgeTaskWrapContentStyle: function(data) {
			return `font-size: ${16 * data.ratio}px; line-height: ${19 * data.ratio}px; margin-left: ${37 * data.ratio}px; width: ${250 * data.ratio}px;`;
		},

		// 下面部分每个任务内容的 style {font-size, line-height, margin-left, width}
		// @return {String}
		abridgeTaskWrapLineStyle: function(data) {
			return `left: ${38 * data.ratio}px; bottom: 0; width: ${227 * data.ratio}px; height: ${1 * data.ratio}px;`;
		},

	},

	watch: {
		// 根据 tasks 设置 componentWidthMin
		'tasks': function() {
			let query = wx.createSelectorQuery().in(this);
			query.select('.abridge-wrap').boundingClientRect();
			query.exec(res => {
				let componentWidthMin = this.data.componentWidthMin * this.data.componentHeightMin / res[0].height;
				this.setData({
					componentWidthMin
				})
			})
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 点击缩略图后，放大或缩小
		handleEnlargeOrNarrow: function(e) {
			let ratioEnlarge = this.data.ratioEnlarge;
			let ratioMax = this.data.componentWidthMax / this.data.componentWidthMin;
			// 如果正在缩放，则忽略此次缩放
			if(ratioEnlarge > 1 && Math.abs(ratioMax - ratioEnlarge) > 0.1)
				return;
			let ratioAdd = ratioEnlarge <= 1? 0.5: -0.5;
			let timeId = setInterval(() => {
				ratioEnlarge += ratioAdd;
				if(ratioEnlarge > ratioMax) {
					ratioEnlarge = ratioMax;
					clearInterval(timeId);
				}
				else if(ratioEnlarge < 1) {
					ratioEnlarge = 1;
					clearInterval(timeId);
				}
				this.setData({
					ratioEnlarge
				})
			}, 10);
		}
	}
})
