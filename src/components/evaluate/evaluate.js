// src/pages/evaluate/evaluate.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		taskFeeling: Object,
		rating: Number,
		feeling: String,
		disabled: {
			type: Boolean,
			value: false
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		stars: [
			{ left: 52, top: 98 },
			{ left: 110, top: 98 },
			{ left: 166, top: 98 },
			{ left: 224, top: 98 },
			{ left: 282, top: 98 },
		]
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 改变星星数量，并告诉父组件被选中了几个
		handleChangeRating: function(e) {
			if(this.properties.disabled)
				return;
			this.triggerEvent("handleChangeRating", {
				rating: e.currentTarget.dataset.index + 1
			})
		},
		// 告诉父组件，输入的感想
		handleInput: function(e) {
			if(this.properties.disabled)
				return;
			this.triggerEvent("handleInput", {
				value: e.detail.value
			})
		},
		// 确定输入
		handleEnsureFeeling: function(e) {
			this.triggerEvent("handleEnsureFeeling");
		},
		handleBackFeeling: function(e) {
			this.triggerEvent("handleBackFeeling")
		}
	}
})
