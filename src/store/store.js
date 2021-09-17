const util = require("../utils/util");
const app = getApp();

// 从后端拉取 url 对应的信息
// @param {String} url: 不包含 owner 等参数
// @param {Object} {owner, token}
// @return {Array}
const getDataFromSqlByUrl = async function(url, {owner, token}) {
	if(!url)
		throw new Error('function "getDataFromSqlByUrl" requires param url!');
	if(!token || !owner)
		throw new Error('function "getDataFromSqlByUrl" requires param {token, owner}');
	let {data: lists} = await util.myRequest({
		url: url + '?owner=' + JSON.stringify(owner),
		header: { token: token },
		method: "GET"
	});
	return lists;
}

// 将数据 tasks 同步到后端，如果 tasks 存在 urlSql 字段，则采用 PUT 方式
// 如果不存在，则采用 POST 方式，并从后端拉取 tasks ，得到相应的 url，并直接在源数据上增加 urlSql 属性
// @param {Arary} tasksLocal 本地 tasks 格式
// @param {Array} listsLocal 本地 lists 格式
// @param {Object} {token, owner}
// @return {void}
const saveTasksToSql = async function(tasksLocal = [], listsLocal = [], {owner, token}) {
	if(!token || !owner)
		throw new Error('function "saveTasksToSql" requires param {token, owner}');
	let tasksPost = [], tasksPut = [];
	tasksLocal.forEach(item => {
		item.hasOwnProperty('urlSql')
		? tasksPut.push(item)
		: tasksPost.push(item);
	});
	// 并行 post 和 put 数据
	let tasksPostPr = util.formatTasksFromLocalToSql(tasksPost, listsLocal, {owner, token}).map(item => {
		console.log('post', item);
		return util.myRequest({
			url: app.globalData.url + 'check/check/?owner=' + JSON.stringify(owner),
			header: { Authorization: 'Token ' + token },
			method: 'POST',
			data: item
		}).then(res => console.log(res))
	})
	console.log(tasksLocal)
	let tasksPutPr = tasksPut.map(item => {
		console.log('put', item);
		return util.myRequest({
			url: item.urlSql,
			header: { Authorization: 'Token ' + token },
			method: 'PUT',
			data: util.formatTasksFromLocalToSql([item], listsLocal, {owner, token})[0]
		}).then(res => console.log(res))
	})
	await Promise.all(tasksPostPr, tasksPutPr);
	// 从后端 get tasks
	let tasksSql = await getDataFromSqlByUrl(app.globalData.url + 'check/check/', {owner, token});
	tasksSql.forEach(taskSql => {
		for(let tmpTask of tasksPost) {
			if(tmpTask.id === taskSql.task_num) {
				tmpTask.urlSql = taskSql.url;
				break;
			}
		}
	})
}


module.exports = {
	getDataFromSqlByUrl,
	saveTasksToSql
}