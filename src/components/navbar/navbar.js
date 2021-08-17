const App = getApp();

Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  externalClasses: ['custom-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    pageName:String,
    showNav: {
      type: Boolean,
      value: true
    },
    bgColor:{
      type: String,
      value: '#fff'
    },
    iconColor:{
      type: String,
      value: '#000'
    },
    windowWidth: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
   
  },
  lifetimes: {
    attached: function () {
      this.setData({
        navHeight: App.globalData.navHeight,
        navTop: App.globalData.navTop,
        windowWidth: App.globalData.windowWidth
      })
     }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
