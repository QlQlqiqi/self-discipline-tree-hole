const util = require('../../utils/util');
const computedBehavior = require("miniprogram-computed").behavior;
Component({
	behaviors: [computedBehavior],
	options: {
		multipleSlots: true
	},
	/**
	 * 组件的属性列表
	 */
	properties: {
		repeat: {
			type: Number,
			value: 0
		},
		divide: {
			type: Boolean,
			value: false
		},
		content: {
			type: String,
			value: ""
		},
		finish: {
			type: Boolean,
			value: false
		},
		date: {
			type: String,
			value: util.getDawn(0)
		},
		desc: {
			type: String,
			value: ''
		},
		descShow: {
			type: Boolean,
			value: true
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 向外展示的时间
		showDate: ''
	},

	computed: {
		
	},

	watch: {
		
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 设置日期描述显示
		_showDesc: function() {
			let desc = '', repeat = this.properties.repeat;
			if(repeat)
				desc += ["不重复", "每天", "每周", "每月", "每年"][repeat];
			// let today = util.getDawn(0);
			// let date = this.properties.date;
			// // 未来事件
			// if(today.substr(0, 10).localeCompare(date.substr(0, 10)) < 0) {
			// 	if(repeat)
			// 		desc += '，';
			// 	let month = Number(date.substr(5, 2));
			// 	let day = Number(date.substr(8, 2));
			// 	desc += `${month}月${day}日`
			// }
			this.setData({
				desc: desc
			})
		},
		// 显示日期
		_showDate: function() {
			let showDate = util.dateInToOut(this.properties.date);
			console.log(showDate)
			this.setData({
				showDate: showDate
			})
		},
		// 删除任务
		handleDeleteTask: function() {
			this.triggerEvent('handleDeleteTask');
		}
	},

	pageLifetimes: {
		show: function() {
			this._showDesc();
			this._showDate();
		}
	},
	
	lifetimes: {
		ready: function() {
			this._showDesc();
			this._showDate();
		}
	}
})
