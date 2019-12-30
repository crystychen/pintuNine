//app.js
App({
    onLaunch: function() {
        let app = this;
        // // 展示本地存储能力
        // var logs = wx.getStorageSync('logs') || []
        // logs.unshift(Date.now())
        // wx.setStorageSync('logs', logs)
        // 隐藏底部导航栏
        wx.hideTabBar({
            animation: false //是否需要过渡动画
        });

        this.globalData.myDevice = wx.getSystemInfoSync()
            // 登录
        wx.login({
                success: res => {
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                    console.log(res)
                }
            })
            // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })

        // // 请求图片数据
        wx.request({
            url: 'https://dati.g5378.com/pintu.json', //仅为示例，并非真实的接口地址
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                console.log(res)
                    // mask, name, pintu
                let {
                    border
                } = res.data;
                // app.globalData.border = border;
                // app.globalData.mask = mask;
                // app.globalData.name = name;
                // app.globalData.pintu = pintu;
                // 先缓存border的图片
                // 循环渲染临时路径到本地
                let frameBorderSrcs = [];
                border.map(function(item, index) {
                    //  let frameNineSrcs = []; // 生成图片源
                    let path = item;
                    let obj = {};
                    console.log(item)
                    wx.getImageInfo({
                        src: path,
                        success: function(res) {
                            // context.drawImage(res.path, 0, 0, that.data.imagewidth, that.data.imageheight);
                            // context.draw();
                            obj.src = res.path;
                            frameBorderSrcs.push(obj);
                            // app.globalData.border = frameBorderSrcs
                        }
                    })
                })
            }
        })
    },
    globalData: {
        userInfo: null,
        myDevice: null,
        imgUrl: [],
        isNotIndex: false, // 是否首页加载过, isNotIndex=true 说明已经加载过首页 
    }
})