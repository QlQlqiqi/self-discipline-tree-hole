// src/components/input-limit/input-limit.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		content: String,
		// 最小文字长度
		minLength: {
			type: Number,
			value: 0
		},
		// 最大文字长度
		maxLength: {
			type: Number,
			value: -1
		},
		// 文字过短提示
		minLimitDialog: {
			type: String,
			value: "输入不得为空"
		},
		// 文字过短时所用的默认值
		minDefaultMsg: {
			type: String,
			value: "好"
		},
		placeholder: String,
		width: Number
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		show: false,
		value: ""
	},

	observers: {
		"value": function(val) {
			this.triggerEvent("input", { value: val })
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		input: function() {
			this.triggerEvent("input", { value: this.data.value })
		},
		dialogClose: function() {
			this.setData({
				show: false,
				value: this.properties.minDefaultMsg
			})
		},
		blur: function() {
			this.triggerEvent("blur");
			if(this.data.value.length < this.properties.minLength) {
				this.setData({
					show: true
				});
			}
		}
	},
	lifetimes: {
		attached: function() {
			if(this.properties.content)
				this.setData({
					value: this.properties.content
				})
		}
	}
})
