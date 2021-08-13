// src/components/select/select.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		selectData: Array,
		selectIndex: Number
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		show: false,
		index: 0
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 点击下拉显示框
		selectTap(){
			this.setData({
				show: !this.data.show
			});
		},
		// 点击下拉列表
		optionTap(e){
			let Index=e.currentTarget.dataset.index;//获取点击的下拉列表的下标
			this.setData({
				index:Index,
				show:!this.data.show
			});
			// 通知父组件
			this.triggerEvent("handleChangeSelect", {
				selectIndex: Index
			})
		},
	},
	pageLifetimes: {
		onLoad: function() {
			this.setData({
				index: this.properties.selectIndex
			})
		}
	}
})
