const util = require('./src/utils/util');
App({
  globalData: {
    checkUrl: 'https://witime.wizzstudio.com/check/',
    url: 'https://witime.wizzstudio.com/',
    // success 用于判断数据是否请求完成
    success: 0
  },
  onLaunch() {
    let _this = this;
    // 数据同步了就不必再从后端获取
    // 数据同步包括：任务 tasks、清单 lists 和 个性签名 signText
    let exist = wx.getStorageSync('exist');
    console.log(exist)
    // 获取数据并保存在本地
    if(!exist) {
      util.login(_this.globalData.url + 'login/login/')
      .then(res => {
        let token = res.data.token;
        let owner = res.data.user_id;
        let lists = [];
        let tasks = [];
        let signText = '';
        // 先请求 lists
        util.myRequest({
          url: _this.globalData.checkUrl + 'taglist/?owner=' + JSON.stringify(owner),
          header: { token: token },
          method: "GET"
        }).then(function(res) {
          res.data.forEach(function(item) {
            let list = {
              title: item.tag,
              icon: item.icon,
              url: item.url
            }
            lists.push(list);
          });
          if(!lists.length)
            lists = [
              { title: "个人清单", icon: "/src/image/menu-self-list0.svg" },
              { title: "工作清单", icon: "/src/image/menu-self-list1.svg" }
            ]
          wx.setStorageSync('lists', JSON.stringify(lists));
          _this.globalData.success++;
        })
        // 再请求 tasks
        .then(function() {
          util.myRequest({
            url: _this.globalData.checkUrl + 'check/?owner=' + JSON.stringify(owner),
            header: { token: token },
            method: "GET"
          }).then(function(res) {
            // 将请求到的 res.data 中数据转化为本地数据 tasks ，并保存在本地
            res.data.forEach(item => {
              // 根据 c_time 和 e_date 得到 remind
              let div = (new Date(item.e_time).getTime() - new Date(item.c_time).getTime()) / 1000;
              let remind = [0, 60, 300, 600, 1800, 3600].indexOf(div);
              // 根据 lists 得到该 item 的 list
              let list = {};
              for(let tmpList of lists) {
                if(tmpList.url === item.tag) {
                  list.title = tmpList.title;
                  list.icon = tmpList.icon;
                  break;
                }
              }
              let task = {
                id: util.getUniqueId(),
                priority: item.priority,
                repeat: item.repeat,
                date: item.e_time,
                remind: remind,
                finish: item.finish === 0? false: true,
                finishDate: item.fin_date || item.e_time,
                content: item.text,	
                desc: item.todo_desc === "default"? "": item.todo_desc,
                list: list,
                delete: item.todo_delete === 0? false: true,
                rating: item.star,
                feeling: item.star_text === "default"? "": item.star_text,
                url: item.url
              };
              tasks.push(task);
            });
            wx.setStorageSync('tasks', JSON.stringify(tasks));
            // console.log(tasks)
            _this.globalData.success++;
          });
        })
        // 请求 signText
        util.myRequest({
          url: _this.globalData.checkUrl + 'sign/?owner=' + JSON.stringify(owner),
          header: { token: token },
          method: "GET",
        }).then(function(res) {
          if(!res.data.length) {
            signText = "好好学习 天天向上";
            util.myRequest({
              url: _this.globalData.checkUrl + 'sign/?owner=' + JSON.stringify(owner),
              header: { Authorization: "Token " + token },
              method: "POST",
              data: {
                signText: signText,
                owner: _this.globalData.url + 'login/user/' + owner + '/'
              }
            }).then(res => wx.setStorage({key: 'signTextUrl', data: JSON.stringify(res.data.url)}))
          }
          else signText = res.data[0].signText;
          wx.setStorageSync('signText', JSON.stringify(signText));
          _this.globalData.success++;
          // console.log(signText)
        })
        wx.setStorageSync('token', JSON.stringify(token));
        wx.setStorageSync('owner', JSON.stringify(owner));
        wx.setStorageSync('uniqueId', JSON.stringify(10000));
      });
    }
    else {
      this.globalData.success = 3;
    }
    
    // 获取设备相关信息
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        console.log(res)
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;
        // 导航栏高度
        this.globalData.navHeight = navHeight;
        // 导航栏距离顶部距离
        this.globalData.navTop = navTop;
        // 可使用窗口高度
        this.globalData.windowHeight = res.windowHeight;
        // 可使用窗口宽度
        this.globalData.windowWidth = res.windowWidth;
        console.log(this.globalData, wx.getMenuButtonBoundingClientRect())
      },
      fail(err) {
        console.error(err);
      }
    })
  },
  onHide: function() {
    wx.setStorage({
      key: 'exist',
      data: true
    })
  }
})
