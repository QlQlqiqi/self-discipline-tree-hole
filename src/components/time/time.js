Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		// 世界时间格式
		defaultTime: String,
		// 显示日期的长度
		timeLength: {
			type: Number,
			value: 30
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		showDate: "请选择日期",
    multiArray: [[], [], []],
    multiIndex: [0, 0, 0],
	},


	/**
	 * 组件的方法列表
	 */
	methods: {
		// 点击显示 picker
		pickerTap:function() {
			let {defaultHour, defaultMinute} = this.data;
			// 根据当前 hours 和 minutes 重新绘制 multiArray
			let hours = [], minutes = [];
			let {multiArray, multiIndex} = this.data;
			let date = new Date(this.properties.defaultTime);
			// 设置 multiIndex
			for(let i = 0, currentMD = date.getUTCMonth() + 1 + '-' + date.getUTCDate(); i < multiArray[0].length; i++)
				if(multiArray[0][i] === currentMD) {
					multiIndex[0] = i;
					break;
				}
			// multiIndex[2] = date.getUTCMinutes() - def
			// 如果是今天，则不绘制全天的 hours 和 minutes ，否则绘制全天
			let fromHour = 0, fromMinute = 0;
			if(!multiIndex[0]) {
				multiIndex[1] = date.getUTCHours() - defaultHour;
				fromHour = defaultHour;
				if(date.getUTCHours() === defaultHour) {
					fromMinute = defaultMinute;
					multiIndex[2] = date.getUTCMinutes() - defaultMinute;
				}
				else multiIndex[2] = +date.getUTCMinutes();
			}
			else {
				multiIndex[1] = date.getUTCHours();
				multiIndex[2] = date.getUTCMinutes();
			}
			([multiArray[1], multiArray[2]] = this.reloadHoursAndMinutes(fromHour, fromMinute));
			console.log(hours, minutes);
			// multiIndex[2] = date.getUTCMinutes() - minutes[0];
			// multiIndex[1] = date.getUTCHours() - hours[0];
			// if(!this.data.multiIndex[0] && date.getUTCHours() > hours[0]) {
			// 	([hours, minutes] = this.reloadHoursAndMinutes(defaultHour, 0));
			// 	console.log(minutes)
			// 	multiIndex[2] = 0;
			// }
					
			this.setData({
				multiArray,
				multiIndex
			})
			console.log(this.data);
		},

		// 根据给定的参数加载 hour 和 minute
		// @param {Number} currentHour
		// @param {Number} currentMinute
		// @return {Array[][]} 
		reloadHoursAndMinutes: function(currentHour, currentMinute) {
			let hours = [], minutes = [];
			for(let i = currentHour; i < 24; i++)
				hours.push(i < 10? '0' + i: '' + i);
			for(let i = currentMinute; i < 60; i++)
				minutes.push(i < 10? '0' + i: '' + i);
			return [hours, minutes];
		},
	
		// 列选择时触发，重新绘制数据
		bindMultiPickerColumnChange: function(e) {
			let {column, value} = e.detail;
			let multiArray = this.data.multiArray, multiIndex = this.data.multiIndex;
			let {defaultHour, defaultMinute} = this.data;
			// 如果改变年份那一列，则相应的重新绘制月份和日期
			if(!column) {
				if(!multiIndex[0])
					([multiArray[1], multiArray[2]] = this.reloadHoursAndMinutes(0, 0));
				if(!value)
					([multiArray[1], multiArray[2]] = this.reloadHoursAndMinutes(defaultHour, defaultMinute));
			}
			// 改变 hour
			else if(column === 1) {
				console.log(multiIndex)
				if(!multiIndex[0]) {
					if(value)
						([multiArray[1], multiArray[2]] = this.reloadHoursAndMinutes(defaultHour, 0));
					else 
						([multiArray[1], multiArray[2]] = this.reloadHoursAndMinutes(defaultHour, defaultMinute));
				}
			}
			multiIndex[column] = value;
			this.setData({
				multiArray,
				multiIndex
			})
			console.log(this.data);
		},
		
		// 确定选择日期
		bindStartMultiPickerChange: function (e) {
			let date = new Date(this.data.startTime);
			let {multiArray, multiIndex} = this.data;
			// date.setTime(date.getTime() + multiIndex[0] * 24 * 60 * 60 * 1000);
			date.setTime(date.getTime() + multiIndex[0] * 24 * 60 * 60 * 1000);
			console.log(date, multiArray, multiIndex, this.data.startTime)
			date.setUTCHours(+multiArray[1][multiIndex[1]]);
			date.setUTCMinutes(+multiArray[2][multiIndex[2]]);
			let year = date.getUTCFullYear(),
				month = date.getUTCMonth() + 1,
				day = date.getUTCDate(),
				hour = date.getUTCHours(),
				minute = date.getUTCMinutes(),
				second = date.getUTCSeconds();
			this.setData({
				showDate: `${month < 10? '0' + month: month}月${day < 10? '0' + day: day}日 ${hour < 10? '0' + hour: hour}:${minute < 10? '0' + minute: minute}`
			})
			let time = `${year}-${month < 10? "0" + month: month}-${day < 10? "0" + day: day}T${hour < 10? "0" + hour: hour}:${minute < 10? "0" + minute: minute}:${second < 10? "0" + second: second}Z`;
			this.triggerEvent("handleChangeTime", {
				time: time
			})
		}
	},
	lifetimes: {
		show() {
			
		},
		ready: function() {
			// 设置时间
			let date = new Date(this.properties.defaultTime),
			 	year = +date.getUTCFullYear(),
				month = +date.getUTCMonth() + 1,
				day = +date.getUTCDate(),
				hour = +date.getUTCHours(),
				minute = +date.getUTCMinutes(),
				second = +date.getUTCSeconds();
			let {multiArray, multiIndex} = this.data;
			// 月-日
			let defaultMD = month + '-' + day;
			for (let i = 0, oneDay = 24 * 60 * 60 * 1000; i <= this.properties.timeLength; i++) {
				let tmpMD = date.getUTCMonth() + 1 + "-" + date.getUTCDate();
				if(defaultMD === tmpMD)
					multiIndex[0] = i;
				multiArray[0].push(i >= 2? tmpMD: ['今天','明天'][i]);
				date.setTime(date.getTime() + oneDay);
			}
			this.setData({
				multiArray,
				multiIndex,
				showDate: `${month < 10? '0' + month: month}月${day < 10? '0' + day: day}日 ${hour < 10? '0' + hour: hour}:${minute < 10? '0' + minute: minute}`,
				defaultYear: year,
				defaultMonth: month,
				defaultDay: day,
				defaultHour: hour,
				defaultMinute: minute,
				defaultSecond: second,
				startTime: this.properties.defaultTime,
			})
		}
	}
})
