const app = getApp();

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
        navHeight: app.globalData.navHeight,
        navTop: app.globalData.navTop,
        windowWidth: app.globalData.windowWidth,
        ratio: 750 / app.globalData.windowWidth
      })
     }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
