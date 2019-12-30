const app = getApp()
Page({
    data: {
        frameSrcs: [{
            src: '../../image/pin/science/1.png',
        }, {
            src: '../../image/pin/science/2.png',
        }, {
            src: '../../image/pin/science/3.png',
        }, {
            src: '../../image/pin/science/4.png',
        }, {
            src: '../../image/pin/science/5.png',
        }, {
            src: '../../image/pin/science/6.png',
        }, {
            src: '../../image/pin/science/7.png',
        }, {
            src: '../../image/pin/science/8.png',
        }, {
            src: '../../image/pin/science/9.png',
        }],
        oneSrc: ""

    },
    onLoad: function(option) {
        // 隐藏底部导航栏
        wx.hideTabBar({
            animation: false //是否需要过渡动画
        });

        this.device = app.globalData.myDevice
        this.deviceRatio = this.device.windowWidth / 750

      let nineSrcs = JSON.parse(decodeURIComponent(option.nineSrcs));
      nineSrcs = nineSrcs.reverse(); // 倒序
      let oneSrc = JSON.parse(decodeURIComponent(option.oneImg));
      this.setData({
        frameSrcs: nineSrcs,
        oneSrc,
        userInfo: app.globalData.userInfo || ""
      })
      let that = this
      // 查看是否授权
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              success: function (res) {
                console.log(res.userInfo)
                that.setData({
                  userInfo: res.userInfo
                })
              }
            })
          }
        }
      })

    },
    onReady() {

    },
    onShareAppMessage: function(e) {
        return {
            // title: "问苍茫大地，谁主沉浮，你敢来战吗？",
            // path: "pages/friChallenge/index?roomSn=" + roomSn + "&userId=" + userId + "&infos=" + encodeURIComponent(JSON.stringify(
            //   userInfo)),
            // // imageUrl: that.data.shareData[0][3],
        }
    },


})