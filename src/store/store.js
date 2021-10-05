const util = require("../utils/util");
const app = getApp();

// 从后端拉取 url 对应的信息
// @param {String} url: 不包含 owner 等参数
// @param {Object} {token}
// @return {Array}
const getDataFromSqlByUrl = async function (url, { token }) {
	if (!url)
		throw new Error('function "getDataFromSqlByUrl" requires param url!');
	if (!token)
		throw new Error(
			'function "getDataFromSqlByUrl" requires param {token}'
		);
	let { data } = await util.myRequest({
		url: url,
		header: { token: token },
		method: "GET",
	});
	return data;
};

// 将数据 tasks 同步到后端，如果 tasks 存在 urlSql 字段，则采用 PUT 方式
// 如果不存在，则采用 POST 方式，并从后端拉取 tasks ，得到相应的 url，并直接在源数据上增加 urlSql 属性
// @param {Arary} tasksLocal 本地 tasks 格式
// @param {Array} listsLocal 本地 lists 格式
// @param {Object} {token, owner}
// @return {void}
const saveTasksToSql = async function (
	tasksLocal = [],
	listsLocal = [],
	{ owner, token }
) {
	if (!token || !owner)
		throw new Error('function "saveTasksToSql" requires param {token, owner}');
	let tasksPost = [],
		tasksPut = [];
	tasksLocal.forEach(item => {
		item.hasOwnProperty("urlSql") ? tasksPut.push(item) : tasksPost.push(item);
	});
	// 并行 post 和 put 数据
	let tasksPostPr = util
		.formatTasksFromLocalToSql(tasksPost, listsLocal, { owner, token })
		.map(item => {
			console.log("post", item);
			let pr = util
				.myRequest({
					url:
						app.globalData.url + "check/check/?owner=" + JSON.stringify(owner),
					header: { Authorization: "Token " + token },
					method: "POST",
					data: item,
				});
				pr.then(res => console.log(res));
				return pr;
		});
	console.log(tasksLocal);
	let tasksPutPr = tasksPut.map(item => {
		console.log("put", item);
		let pr = util
			.myRequest({
				url: item.urlSql,
				header: { Authorization: "Token " + token },
				method: "PUT",
				data: util.formatTasksFromLocalToSql([item], listsLocal, {
					owner,
					token,
				})[0],
			});
			pr.then(res => console.log(res));
			return pr;
	});
	await Promise.all([...tasksPostPr, ...tasksPutPr]);
	// 从后端 get tasks
	let tasksSql = await getDataFromSqlByUrl(
		app.globalData.url + "check/check/?owner=" + JSON.stringify(owner),
		{ owner, token }
	);
	tasksSql.forEach(taskSql => {
		for (let tmpTask of tasksPost) {
			if (tmpTask.id === taskSql.task_num) {
				tmpTask.urlSql = taskSql.url;
				break;
			}
		}
	});
};

// 将数据 chats 同步到后端，如果 chats 存在 urlSql 字段，则采用 PUT 方式
// 如果不存在，则采用 POST 方式，并从后端拉取 chats ，得到相应的 url，并直接在源数据上增加 urlSql 属性
// @param {Array} chatsLocal chat 数组
// @param {Object} {owner, token}
// return {void}
const saveChatsToSql = async function(chatsLocal, {owner, token}) {
	if (!token || !owner)
		throw new Error('function "saveChatsToSql" requires param {token, owner}');
	let chatsPost = [], chatsPut = [];
	chatsLocal.forEach(item => {
		item.hasOwnProperty("urlSql") ? chatsPut.push(item) : chatsPost.push(item);
	});
	// 并行 post 和 put 数据
	let chatsPostPr = util.formatChatsFromLocalToSql(chatsPost).map(item => {
		console.log("post", item);
		let pr = util
			.myRequest({
				url: app.globalData.url + "community/blog/?owner=" + JSON.stringify(owner),
				header: { Authorization: "Token " + token },
				method: "POST",
				data: item
			})
		pr.then(res => console.log(res));
		return pr;
	});
	let chatsPutPr = chatsPut.map(item => {
		let pr = util
			.myRequest({
				url: item.urlSql,
				header: { Authorization: "Token " + token },
				method: "PUT",
				data: util.formatChatsFromLocalToSql([item])[0]
			});
			pr.then(res => console.log(res));
			return pr;
	});
	await Promise.all([...chatsPutPr, ...chatsPostPr])
	// 从后端 get chats
	let chatsSql = await getDataFromSqlByUrl(
		app.globalData.url + "community/blog/",
		{ owner, token }
	);
	chatsSql.forEach(chatSql => {
		for (let tmpChat of chatsPost) {
			if (tmpChat.owner === chatSql.owner && tmpChat.id === chatSql.data.pic.picId) {
				tmpChat.urlSql = app.globalData.url + 'community/blog/' + chatSql.picid + '/';
				break;
			}
		}
	});
}

module.exports = {
	getDataFromSqlByUrl,
	saveTasksToSql,
	saveChatsToSql,
};
