var date = new Date();
var currentHours = date.getHours();
var currentMinute = date.getMinutes();
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		defaultTime: String
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		startDate: "请选择日期",

    multiArray: [['今天', '明天', '3-2', '3-3', '3-4', '3-5'], [0, 1, 2, 3, 4, 5, 6], [0, 10, 20]],
    multiIndex: [0, 0, 0],
	},


	/**
	 * 组件的方法列表
	 */
	methods: {
		pickerTap:function() {
			date = new Date();
	
			var monthDay = ['今天','明天'];
			var hours = [];
			var minute = [];
			
			currentHours = date.getHours();
			currentMinute = date.getMinutes();
	
			// 月-日
			for (var i = 2; i <= 28; i++) {
				var date1 = new Date(date);
				date1.setDate(date.getDate() + i);
				var md = (date1.getMonth() + 1) + "-" + date1.getDate();
				monthDay.push(md);
			}
	
			var data = {
				multiArray: this.data.multiArray,
				multiIndex: this.data.multiIndex
			};
	
			if(data.multiIndex[0] === 0) {
				if(data.multiIndex[1] === 0) {
					this.loadData(hours, minute);
				} else {
					this.loadMinute(hours, minute);
				}
			} else {
				this.loadHoursMinute(hours, minute);
			}
	
			data.multiArray[0] = monthDay;
			data.multiArray[1] = hours;
			data.multiArray[2] = minute;
			if(data.multiArray[1] < 10) {
				data.multiArray[1] = "0" + data.multiArray[1];
			}
			if(data.multiArray[1] < 10) {
				data.multiArray[2] = "0" + data.multiArray[2];
			}
			this.setData(data);
		},
	
	
	
	
		bindMultiPickerColumnChange:function(e) {
			date = new Date();
	
			var that = this;
	
			var monthDay = ['今天', '明天'];
			var hours = [];
			var minute = [];
	
			currentHours = date.getHours();
			currentMinute = date.getMinutes();
	
			var data = {
				multiArray: this.data.multiArray,
				multiIndex: this.data.multiIndex
			};
			// 把选择的对应值赋值给 multiIndex
			data.multiIndex[e.detail.column] = e.detail.value;
	
			// 然后再判断当前改变的是哪一列,如果是第1列改变
			if (e.detail.column === 0) {
				// 如果第一列滚动到第一行
				if (e.detail.value === 0) {
	
					that.loadData(hours, minute);
					
				} else {
					that.loadHoursMinute(hours, minute);
				}
	
				data.multiIndex[1] = 0;
				data.multiIndex[2] = 0;
	
				// 如果是第2列改变
			} else if (e.detail.column === 1) {
	
				// 如果第一列为今天
				if (data.multiIndex[0] === 0) {
					if (e.detail.value === 0) {
						that.loadData(hours, minute);
					} else {
						that.loadMinute(hours, minute);
					}
					// 第一列不为今天
				} else {
					that.loadHoursMinute(hours, minute);
				}
				data.multiIndex[2] = 0;
	
				// 如果是第3列改变
			} else {
				// 如果第一列为'今天'
				if (data.multiIndex[0] === 0) {
	
					// 如果第一列为 '今天'并且第二列为当前时间
					if(data.multiIndex[1] === 0) {
						that.loadData(hours, minute);
					} else {
						that.loadMinute(hours, minute);
					}
				} else {
					that.loadHoursMinute(hours, minute);
				}
			}
			data.multiArray[1] = hours;
			data.multiArray[2] = minute;
			// 设置 01:05
			if(data.multiArray[1] < 10) {
				data.multiArray[1] = "0" + data.multiArray[1];
			}
			if(data.multiArray[1] < 10) {
				data.multiArray[2] = "0" + data.multiArray[2];
			}
			this.setData(data);
		},
	
		loadData: function (hours, minute) {
	
			var minuteIndex;
			if (currentMinute > 0 && currentMinute <= 10) {
				minuteIndex = 10;
			} else if (currentMinute > 10 && currentMinute <= 20) {
				minuteIndex = 20;
			} else if (currentMinute > 20 && currentMinute <= 30) {
				minuteIndex = 30;
			} else if (currentMinute > 30 && currentMinute <= 40) {
				minuteIndex = 40;
			} else if (currentMinute > 40 && currentMinute <= 50) {
				minuteIndex = 50;
			} else {
				minuteIndex = 60;
			}
	
			if (minuteIndex == 60) {
				// 时
				for (var i = currentHours + 1; i < 24; i++) {
					hours.push(i);
				}
				// 分
				for (var i = 0; i < 60; i += 10) {
					minute.push(i);
				}
			} else {
				// 时
				for (var i = currentHours; i < 24; i++) {
					hours.push(i);
				}
				// 分
				for (var i = minuteIndex; i < 60; i += 10) {
					minute.push(i);
				}
			}
		},
	
		loadHoursMinute: function (hours, minute){
			// 时
			for (var i = 0; i < 24; i++) {
				hours.push(i);
			}
			// 分
			for (var i = 0; i < 60; i += 10) {
				minute.push(i);
			}
		},
	
		loadMinute: function (hours, minute) {
			var minuteIndex;
			if (currentMinute > 0 && currentMinute <= 10) {
				minuteIndex = 10;
			} else if (currentMinute > 10 && currentMinute <= 20) {
				minuteIndex = 20;
			} else if (currentMinute > 20 && currentMinute <= 30) {
				minuteIndex = 30;
			} else if (currentMinute > 30 && currentMinute <= 40) {
				minuteIndex = 40;
			} else if (currentMinute > 40 && currentMinute <= 50) {
				minuteIndex = 50;
			} else {
				minuteIndex = 60;
			}
	
			if (minuteIndex == 60) {
				// 时
				for (var i = currentHours + 1; i < 24; i++) {
					hours.push(i);
				}
			} else {
				// 时
				for (var i = currentHours; i < 24; i++) {
					hours.push(i);
				}
			}
			// 分
			for (var i = 0; i < 60; i += 10) {
				minute.push(i);
			}
		},
	
		bindStartMultiPickerChange: function (e) {
			var that = this;
			var monthDay = that.data.multiArray[0][e.detail.value[0]];
			var hours = that.data.multiArray[1][e.detail.value[1]];
			var minute = that.data.multiArray[2][e.detail.value[2]];
			var month, day;
			console.log(monthDay, hours, minute)
			if (monthDay === "今天") {
				var month = date.getMonth()+1;
				var day = date.getDate();
				monthDay = month + "月" + day + "日";
			} else if (monthDay === "明天") {
				var date1 = new Date(date);
				date1.setDate(date.getDate() + 1);
				month = (date1.getMonth() + 1);
				day = date1.getDate();
				monthDay = (date1.getMonth() + 1) + "月" + date1.getDate() + "日";
				console.log(monthDay)
			} else {
				var month = monthDay.split("-")[0]; // 返回月
				var day = monthDay.split("-")[1]; // 返回日
				monthDay = month + "月" + day + "日";
			}
			if(hours < 10)
				hours = '0' + hours;
			if(minute < 10)
				minute = '0' + minute;
			var startDate = monthDay + " " + hours + ":" + minute;
			that.setData({
				startDate: startDate
			})
			// 按照格式传时间
			console.log(month, day)
			var year = Number(this.properties.defaultTime.substr(0, 4));
			var month = Number(month);
			var day = Number(day);
			var hour = Number(hours);
			var minute = Number(minute);
			var second = 0;
			console.log(month, day)
			let time = `${year}-${month < 10? "0" + month: month}-${day < 10? "0" + day: day}T${hour < 10? "0" + hour: hour}:${minute < 10? "0" + minute: minute}:${second < 10? "0" + second: second}Z`;
			this.triggerEvent("handleChangeTime", {
				time: time
			})
		}
	},
	lifetimes: {
		ready: function() {
			// 设置时间
			let defaultTime = this.properties.defaultTime;
			let month = Number(defaultTime.substr(5, 2));
			let day = Number(defaultTime.substr(8, 2));
			let hour = Number(defaultTime.substr(11, 2));
			let minute = Number(defaultTime.substr(14, 2));
			this.setData({
				startDate: `${month}月${day}日 ${hour}:${minute}`
			})
		}
	}
})
