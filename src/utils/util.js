let uniqueId = 0;
const app = getApp();

// 根据对象的 id 进行合并，不改变原数组 src
// 当 target[idx1].id === src[idx2].id，合并后者到前者
// 当 src 中不存在与后者相同 id 的 obj，后者添加到前者尾部
// src: 数组，每一项为一个 obj，包含 id 字段
// target: 数组，每一项为一个 obj，包含 id 字段
const mergeById = function (src, target) {
	if (!target.length) return [...src];
	if (!src.length) return [...target];
	let res = [],
		idx = 0;
	for (let i = 0; i < src.length; i++) {
		for (let j = 0; j < target.length; j++) {
			if (src[i].id === target[j].id) {
				res[idx++] = target[j];
				target[j].__done__ = true;
				break;
			}
			if (j + 1 === target.length) res[idx++] = src[i];
		}
	}
	for (let i = 0; i < target.length; i++) {
		if (!target[i].__done__) res[idx++] = target[i];
		delete target[i].__done__;
	}
	return res;
};

// 移除元素，与 mergeById 类似
const removeById = function (src, target) {
	let res = [],
		idx = 0;
	for (let i = 0; i < src.length; i++) {
		if (!target.length) {
			res[idx++] = src[i];
			continue;
		}
		for (let j = 0; j < target.length; j++) {
			if (src[i].id === target[j].id) break;
			if (j + 1 === target.length) res[idx++] = src[i];
		}
	}
	return res;
};

// 返回 date 对应的日期，如: 2021-07-05T13:00:00Z
const formatDate = function (date) {
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let hour = date.getHours();
	let minute = date.getMinutes();
	let second = date.getSeconds();
	return `${year}-${month < 10 ? "0" + month : month}-${
		day < 10 ? "0" + day : day
	}T${hour < 10 ? "0" + hour : hour}:${minute < 10 ? "0" + minute : minute}:${
		second < 10 ? "0" + second : second
	}Z`;
};

// 获得凌晨的 date，如: 2021-07-05T00:00:00Z
// offset: 相对于当天凌晨偏移天数，默认 0
const getDawn = function (offset) {
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
	return `${year}-${month < 10 ? "0" + month : month}-${
		day < 10 ? "0" + day : day
	}T00:00:00Z`;
};

// 返回独一无二的 id
const getUniqueId = function (url) {
	return ++uniqueId;
};

// 设置独一无二的 id，如果参数 id 比当前的 uniqueId 小，则忽略
const setUniqueId = function (id) {
	if (uniqueId < id) uniqueId = id;
};

// 以下 _hande 是辅助页面间通信保存数据的函数
// 编辑页面完成编辑后，触发事件保存数据
const _handleSaveData = function (_this, data) {
	let tasks = mergeById(_this.data.tasks || [], data.tasks || []);
	// 目前此处 data.lists 只有一个值
	let lists = _this.data.lists || [];
	for (let i = 0; i < lists.length && data.lists && data.lists.length; i++) {
		if (lists[i].title === data.lists[0].title) {
			lists[i] = data.lists[0];
			break;
		}
		if (i + 1 === lists.length) lists.push(data.lists[0]);
	}
	_this.setData({
		tasks: tasks,
		lists: lists,
	});
};

// 讲日期转化为用户所见的
// @param {String} data 世界格式时间
const dateInToOut = function (date) {
	let todayYMD = getDawn(0).substr(0, 10);
	let year = date.substr(0, 4);
	let month = date.substr(5, 2);
	let day = date.substr(8, 2);
	let time = date.substr(11, 5),
		showDate;
	// 如果是今天，不显示年月日份
	if (date.substr(0, 10) === todayYMD) {
		showDate = time;
	}
	// 如果是今年的，显示月日
	else if (year === todayYMD.substr(0, 4)) {
		showDate = `${month}月${day}日${time}`;
	} else {
		showDate = `${year}年${month}月${day}日${time}`;
	}
	return showDate;
};

// 触发事件删除任务
const _handleDeleteData = function (_this, data) {
	let tasks = removeById(_this.data.tasks || [], data.tasks || []);
	// 目前此处 data.lists 只有一个值
	let lists = _this.data.lists || [];
	for (let i = 0; i < lists.length && data.lists && data.lists.length; i++) {
		if (lists[i].title === data.lists[0].title) {
			lists.splice(i, 1);
			break;
		}
	}
	_this.setData({
		tasks: tasks,
		lists: lists,
	});
};

// 登录并保存 token 和 openId
// 接收一个 url
const login = async function (url) {
	return await new Promise(function (resolve) {
		wx.login({
			success: res => {
				if (res.code) {
					wx.request({
						url: url,
						data: {
							code: res.code,
						},
						method: "POST",
						success: res => resolve(res),
					});
				} else throw new Error("登录失败！" + res.errMsg);
			},
		});
	});
};

// 封装 request
const myRequest = function ({ url, header, method, data }) {
	return new Promise(function (resolve) {
		wx.request({
			url: url,
			header: header || { "content-type": "application/json" },
			method: method || "GET",
			data: data || {},
			success: res => resolve(res),
		});
	});
};

// 如果用户未登录或登录过期，则登录
// @param {String} url
// @return {Object} { token, owner }
let getTokenAndOwner_token, getTokenAndOwner_owner;
const getTokenAndOwner = async function (url) {
	if (!url) throw new Error("function getTokenAndOwner requires param url!");
	return await new Promise(resolve => {
		let loginFn = async () => {
			let { data } = await login(url);
			getTokenAndOwner_token = data.token;
			getTokenAndOwner_owner = data.user_id;
			resolve({ token: getTokenAndOwner_token, owner: getTokenAndOwner_owner });
		};
		wx.checkSession({
			success: async () => {
				if (!getTokenAndOwner_token || !getTokenAndOwner_owner) {
					loginFn();
				} else {
					resolve({
						token: getTokenAndOwner_token,
						owner: getTokenAndOwner_owner,
					});
				}
			},
			fail: loginFn,
		});
	});
};

// 给定后端数据格式的 lists ，返回本地数据格式的 lists
// @param {Array} listsSql
// @return {Array}
const formatListsFromSqlToLocal = function (listsSql) {
	return listsSql.map(item => {
		return {
			title: item.tag,
			icon: item.icon,
			urlSql: item.url,
		};
	});
};

// 给定后端数据格式的 tasksSql 和本地格式的 listsLocal ，返回本地数据格式的 tasks
// @param {Array} tasksSql
// @param {Array} listsLocal
// @param {Object} {token, owner}
// @return {Array}
const formatTasksFromSqlToLocal = function (
	tasksSql = [],
	listsLocal = [],
	{ owner, token }
) {
	if (!owner || !token)
		throw new Error(
			'function "formatTasksFromSqlToLocal" requires param {token, owner}'
		);
	return tasksSql.map(item => {
		// 根据 c_time 和 e_date 得到 remind
		// 目前不用 remind ，则直接设为 0
		// let div = (new Date(item.e_time).getTime() - new Date(item.c_time).getTime()) / 1000;
		// let remind = [0, 60, 300, 600, 1800, 3600].indexOf(div);
		let remind = 0;
		// 根据 listsLocal 得到该 item 的 list
		let list = {};
		for (let listLocal of listsLocal) {
			if (listLocal.urlSql === item.tag) {
				list.title = listLocal.title;
				list.icon = listLocal.icon;
				break;
			}
		}
		let task = {
			id: item.task_num,
			priority: item.priority,
			repeat: item.repeat,
			date: item.e_time,
			remind: remind,
			finish: item.finish === 0 ? false : true,
			finishDate: item.fin_date || item.e_time,
			content: item.text,
			desc: item.todo_desc === "default" ? "" : item.todo_desc,
			list: list,
			delete: item.todo_delete === 0 ? false : true,
			rating: item.star,
			feeling: item.star_text === "default" ? "" : item.star_text,
			urlSql: item.url,
		};
		return task;
	});
};

// 给定本地数据格式的 lists ，返回后端数据格式的 lists
// @param {Array} listsLocal
// @param {Object} {owner}
// @return {Array}
const formatListsFromLocalToSql = function (listsLocal, { owner }) {
	if (!owner)
		throw new Error(
			"function formatListsFromLocalToSql requires param {owner}!"
		);
	return listsLocal.map(item => {
		return {
			tag: item.title,
			icon: item.icon,
			owner: app.globalData.url + "login/user/" + owner + "/",
		};
	});
};

// 给定本地数据格式的 tasks 和 lsits ，返回后端数据格式的 tasks
// @param {Array} tasksLocal
// @param {Array} listsLocal
// @param {Object} {owner}
// @return {Array}
const formatTasksFromLocalToSql = function (
	tasksLocal,
	listsLocal,
	{ owner, token }
) {
	if (!owner || !token)
		return new Error(
			'function "formatTasksFromLocalToSql" requires param {owner, token}'
		);
	let listUrl = [],
		listTitle = [];
	listsLocal.forEach(item => {
		listUrl.push(item.urlSql);
		listTitle.push(item.title);
	});
	let res = [];
	// 保存 tasks
	tasksLocal.forEach(function (item) {
		// 根据 remind 和 e_time 得到 c_time
		// 目前不使用 remind ，则设 c_time = date
		// let div = [0, 60, 300, 600, 1800, 3600][item.remind] * 1000 + 8 * 60 * 60 * 1000;
		// let date = new Date();
		// date.setTime(new Date(item.date).getTime() - div);
		// let c_time = formatDate(date)
		let c_time = item.date;
		// 得到 list
		let list = listUrl[listTitle.indexOf(item.list.title)];
		if (!list) console.log(listUrl, listTitle, item.list.title);
		let task = {
			priority: item.priority,
			repeat: item.repeat,
			e_time: item.date,
			c_time: c_time,
			finish: item.finish ? 1 : 0,
			text: item.content,
			todo_desc: item.desc || "default",
			tag: list,
			todo_delete: item.delete ? 1 : 0,
			star: item.rating,
			star_text: item.feeling || "default",
			owner: app.globalData.url + "login/user/" + owner + "/",
			fin_date: item.finishDate || formatDate(new Date()),
			task_num: item.id,
		};
		res.push(task);
	});
	return res;
};

// 给定后端格式的说说，返回本地格式的说说
// @param {Array} chats 后台的说说数据格式
// @return {Array} 说说的本地格式
const formatChatsFromSqlToLocal = function (chats) {
	return chats.map(item => {
		let chat = {};
		chat.id = item.picid;
    chat.owner = item.owner;
    ({reviewAbridge: chat.reviewAbridge, pic: chat.pic} = item.data);
		chat.pic.date = item.time.substr(0, 19) + "Z";
		chat.comments = item.article.map(item => {
			let comment = {};
			let tmp = item.url.split("/");
      comment.id = +tmp[tmp.length - 2];
      comment.content = item.content;
			comment.urlSql = item.url;
			comment.date = item.time.substr(0, 19) + "Z";
			tmp = item.pic.split("/");
			comment.chatId = +tmp[tmp.length - 2];
			tmp = item.from_user.split("/");
			comment.fromUser = +tmp[tmp.length - 2];
			tmp = item.to_user.split("/");
			comment.toUser = +tmp[tmp.length - 2];
      let title = '';
      title += chat.owner === comment.fromUser
        ? '洞主'
        : ['小红', '绿绿', '小黄', '小蓝'][comment.fromUser % 4];
      title += comment.toUser === chat.owner
        ? ''
        : '回复' + ['小红', '绿绿', '小黄', '小蓝'][comment.toUser % 4];
      comment.title = title;
      return comment;
    });
    return chat;
	});
};

// 给定本地格式的说说，返回后端格式的说说
// @param {Array} chats 后端的说说数据格式
// @return {Array} 说说的后端格式
const formatChatsFromLocalToSql = function(chats) {
  return chats.map(item => {
    let chat = {};
    chat.owner = item.owner;
    chat.data = JSON.stringify({
      reviewAbridge: item.reviewAbridge,
      pic: item.pic
    })
    return chat;
	});
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
	dateInToOut,
	getTokenAndOwner,
	formatListsFromSqlToLocal,
	formatListsFromLocalToSql,
	formatTasksFromSqlToLocal,
	formatTasksFromLocalToSql,
  formatChatsFromSqlToLocal,
  formatChatsFromLocalToSql,
};
