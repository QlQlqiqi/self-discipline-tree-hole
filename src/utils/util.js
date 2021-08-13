let uniqueId = 0;

// 根据对象的 id 进行合并，不改变原数组 src
// 当 target[idx1].id === src[idx2].id，合并后者到前者 
// 当 src 中不存在与后者相同 id 的 obj，后者添加到前者尾部
// src: 数组，每一项为一个 obj，包含 id 字段
// target: 数组，每一项为一个 obj，包含 id 字段
const mergeById = function(src, target) {
  let res = [], idx = 0;
  for(let i = 0; i < src.length; i++) {
    if(!target.length) {
      res[idx++] = src[i];
      continue;
    }
    for(let j = 0; j < target.length; j++) {
      if(src[i].id === target[j].id) {
        res[idx++] = target[j];
        target[j].__done__ = true;
        break;
      }
      if(j + 1 === target.length)
        res[idx++] = src[i];
    }
  }
  for(let i = 0; i < target.length; i++) {
    if(!target[i].__done__)
      res[idx++] = target[i];
    delete target[i].__done__;
  }
  return res;
}

// 移除元素，与 mergeById 类似
const removeById = function(src, target) {
  let res = [], idx = 0;
  console.log(src, target)
  for(let i = 0; i < src.length; i++) {
    if(!target.length) {
      res[idx++] = src[i];
      continue;
    }
    for(let j = 0; j < target.length; j++) {
      if(src[i].id === target[j].id)
        break;
      if(j + 1 === target.length)
        res[idx++] = src[i];
    }
  }
  console.log(res)
  return res;
}

// 返回 date 对应的日期，如: 2021-07-05T13:00:00Z
const formatDate = function(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  return `${year}-${month < 10? "0" + month: month}-${day < 10? "0" + day: day}T${hour < 10? "0" + hour: hour}:${minute < 10? "0" + minute: minute}:${second < 10? "0" + second: second}Z`;
}

// 获得凌晨的 date，如: 2021-07-05T00:00:00Z
// offset: 相对于当天凌晨偏移天数，默认 0
const getDawn= function(offset) {
  offset = offset || 0;
  let date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  date.setTime(date.getTime() + offset * 1000 * 60 * 60 * 24);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  return `${year}-${month < 10? "0" + month: month}-${day < 10? "0" + day: day}T00:00:00Z`;
}

// 返回独一无二的 id
const getUniqueId = function() {
  return ++uniqueId;
}

// 设置独一无二的 id
const setUniqueId = function(id) {
  uniqueId = id;
}

// 以下 _hande 是辅助页面间通信保存数据的函数
// 编辑页面完成编辑后，触发事件保存数据
const _handleSaveData = function(_this, data) {
  let tasks = mergeById(_this.data.tasks || [], data.tasks || []);
  // 目前此处 data.lists 只有一个值
  let lists = _this.data.lists || [];
  console.log(lists, data)
  for(let i = 0; i < lists.length && data.lists && data.lists.length; i++) {
    if(lists[i].title === data.lists[0].title) {
      lists[i] = data.lists[0];
      break;
    }
    if(i + 1 === lists.length)
      lists.push(data.lists[0]);
  }
  _this.setData({
    tasks: tasks,
    lists: lists
  });
}

// 讲日期转化为用户所见的
const dateInToOut = function(date) {
  let todayYMD = getDawn(0).substr(0, 10);
  let year = date.substr(0, 4);
  let month = date.substr(5, 2);
  let day = date.substr(8, 2);
  let time = date.substr(11, 5), showDate;
	// 如果是今天，不显示年月日份
	if(date.substr(0, 10) === todayYMD) {
		showDate = time;
	}
	// 如果是今年的，显示月日
	else if(year === todayYMD.substr(0, 4)) {
		showDate = `${month}月${day}日${time}`;
  }
  else {
    showDate = `${year}年${month}月${day}日${time}`;
  }
	return showDate;
}

// 触发事件删除任务
const _handleDeleteData = function(_this, data) {
  let tasks = removeById(_this.data.tasks || [], data.tasks || []);
  console.log(_this.data.tasks, data)
  // 目前此处 data.lists 只有一个值
  let lists = _this.data.lists || [];
  for(let i = 0; i < lists.length && data.lists && data.lists.length; i++) {
    if(lists[i].title === data.lists[0].title) {
      lists.splice(i, 1);
      break;
    }
  }
  _this.setData({
    tasks: tasks,
    lists: lists
  });
}

// 登录并保存 token 和 openId
// 接收一个 url
const login = function(url) {
  return new Promise(function(resolve) {
    wx.login({
      success: res => {
        wx.request({
          url: url,
          data: {
            code: res.code
          },
          method: "POST",
          success: res => resolve(res)
        })
      }
    })
  })
}

// 封装 request
const myRequest = function({url, header, method, data}) {
  return new Promise(function(resolve) {
    wx.request({
      url: url,
      header: header || {'content-type': 'application/json'},
      method: method || "GET",
      data: data || {},
      success: res => resolve(res)
    })
  })
}

module.exports = {
  formatDate,
  getDawn,
  getUniqueId,
  setUniqueId,
  mergeById,
  removeById,
  _handleSaveData,
  _handleDeleteData,
  login,
  myRequest,
  dateInToOut
}
