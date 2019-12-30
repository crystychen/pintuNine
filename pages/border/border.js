const app = getApp()

Page({
    data: {
        page: 'photoFrame',
        imageNotChoosed: false,
        imgViewHeight: 0,
        longImageSrcs: [],
        totalHeight: 0,
        whichDeleteShow: 99999,
        // delteBoxY:0,
        frameSrcs: [],
        frameSrc: '',
        isFrameChoose: false,
        photoSrc: '',
        frameHeight: 0,
        minScale: 0.5,
        maxScale: 2,
        photoWidth: 0,
        photoHeight: 0,
        photoLeft: 0,
        photoLeftV: 0,
        photoTopV: 0, //页面显示用
        photoTop: 0, //实际画图用
        readuSave: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        choosedIndex: 0
    },
    onLoad: function(option) {
        // 隐藏底部导航栏
        wx.hideTabBar({
            animation: false //是否需要过渡动画
        });
        let that = this;
        this.device = app.globalData.myDevice
        this.deviceRatio = this.device.windowWidth / 750
        console.log("deviceRatio=" + this.deviceRatio + ",windowWidth=" + this.device.windowWidth)
        this.setData({
            page: 'photoFrame',
            longImageSrcs: [],
            imgViewHeight: this.device.windowHeight - 160 * this.deviceRatio
        })
        if (option.choosed === 'longImages') {
            this.addImages()
        }

        // 模板图片源loading下来
        if (app.globalData.border) { // 非首页已经保存过边框模板
            that.setData({
                frameSrcs: app.globalData.border
            })
            that.choosedFrameImg(app.globalData.border[0].src) // 选中第一个 模板
        } else { // 没有就loading出来
            that.getImgs().then((data) => {
                that.choosedFrameImg(that.data.frameSrcs[0].src) // 选中第一个 模板
            });
        }
        // 查看是否授权
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        success: function(res) {
                            console.log(res.userInfo)
                        }
                    })
                }
            }
        })
    },
    onReady() {
        // 模板
        // this.choosedFrameImg(this.data.frameSrcs[0].src)
    },
    onShareAppMessage: function(e) {
        return {
            // title: "问苍茫大地，谁主沉浮，你敢来战吗？",
            // path: "pages/friChallenge/index?roomSn=" + roomSn + "&userId=" + userId + "&infos=" + encodeURIComponent(JSON.stringify(
            //   userInfo)),
            // // imageUrl: that.data.shareData[0][3],
        }
    },
    getImgs() {
        // 请求图片数据
        let that = this;
        return new Promise((resolve, reject) => {
            wx.request({
                url: 'https://dati.g5378.com/pintu.json', //仅为示例，并非真实的接口地址
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success(res) {
                    console.log(res)
                    let {
                        border
                    } = res.data;

                    let frameNineSrcs = [];
                    // 循环渲染临时路径到本地
                    border.map(function(item, index) {
                        //  let frameNineSrcs = []; // 生成图片源
                        wx.showLoading({
                            title: '加载中',
                            mask: true
                        })
                        let path = item;
                        wx.getImageInfo({
                            src: path,
                            success: function(res) {
                                let obj = {};
                                obj.src = res.path;
                                frameNineSrcs.push(obj);
                                that.setData({
                                    frameSrcs: frameNineSrcs,
                                }, function() {
                                    resolve(frameNineSrcs)
                                })
                                wx.hideLoading(); // 关闭loading遮罩层
                            }
                        })
                    })
                }
            })
        })
    },
    bindGetUserInfo(e) {
        console.log(e.detail.userInfo)
        var self = this
            //下载头像
        var headUrl = e.detail.userInfo.avatarUrl;
        headUrl = headUrl.substring(0, headUrl.lastIndexOf('/') + 1) + '0';
        console.log(headUrl);
        wx.downloadFile({
            url: headUrl, //仅为示例，并非真实的资源
            success: function(res) {
                //设置头像临时路径到画布
                self.setPhoto(res.tempFilePath, 600 * self.deviceRatio)
            }
        })
    },
    addImages() {
        var self = this
        wx.chooseImage({
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                var longImageSrcs = self.data.longImageSrcs
                longImageSrcs = longImageSrcs.concat(res.tempFilePaths)
                self.setData({
                    imageNotChoosed: false,
                    longImageSrcs: longImageSrcs,
                    readuSave: true
                })
            },
            fail: function(res) {
                self.setData({
                    imageNotChoosed: true
                })
            }
        })
    },
    gotoDelete(e) {
        this.longTap = true
        this.deleteId = e.target.dataset.idx
        this.setData({
            whichDeleteShow: this.deleteId,
        })
    },
    deleteImg() {
        var longImageSrcs = this.data.longImageSrcs
        longImageSrcs.splice(this.deleteId, 1)
        this.setData({
            longImageSrcs: longImageSrcs,
            whichDeleteShow: 99999,
        })
    },
    quitDelete() {
        if (this.longTap) { //禁用了longTap伴随的tap事件
            this.longTap = false
        } else {
            this.setData({
                whichDeleteShow: 99999
            })
        }
    },
    //获取头像
    addFrame() {
        var self = this
        this.setData({
            isFrameChoose: true
        })
    },
    chooseFrame(e) {
        console.log(e)
        var self = this;
        this.setData({
            choosedIndex: e.currentTarget.dataset.index // 选中第几张模板
        })
        wx.getImageInfo({
            // '../../image/frame70/' + 
            src: e.currentTarget.dataset.src,
            success: function(res) {
                var initRatio = res.width / (750 * self.deviceRatio) //保证宽度全显
                    //图片显示大小
                self.frameWidth = (res.width / initRatio) //100%
                self.frameHeight = (res.height / initRatio)
                console.log('initRatio=,' + initRatio + ',res.w=' + res.width + ',res.H=' + res.height + ',fw=' + self.frameWidth + ',fh=' + self.frameHeight);
                self.setData({
                    frameHeight: self.frameHeight,
                    isFrameChoose: false,
                    frameSrc: e.currentTarget.dataset.src, // '../../image/frame70/' +
                    readuSave: true
                })
            }
        })
    },
    choosedFrameImg(src) {
        var self = this;
        wx.getImageInfo({
            src: src,
            success: function(res) {
                var initRatio = res.width / (750 * self.deviceRatio) //保证宽度全显
                    //图片显示大小
                self.frameWidth = (res.width / initRatio) //100%
                self.frameHeight = (res.height / initRatio)
                console.log('initRatio=,' + initRatio + ',res.w=' + res.width + ',res.H=' + res.height + ',fw=' + self.frameWidth + ',fh=' + self.frameHeight);
                self.setData({
                    frameHeight: self.frameHeight,
                    isFrameChoose: false,
                    frameSrc: src, // '../../image/frame70/' + 
                    readuSave: true
                })
            }
        })
    },
    closeFrameChoose() {
        this.setData({
            isFrameChoose: false
        })
    },
    addPhoto() {
        var self = this
        wx.chooseImage({
            count: 1,
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                self.setPhoto(res.tempFilePaths[0])
            },
            fail: function(res) {
                self.setData({
                    imageNotChoosed: true
                })
            }
        })
    },
    setPhoto(imgpath, fixW) {
        var self = this
        self.setData({
            // imageNotChoosed: false,
            photoSrc: imgpath,
        })
        wx.getImageInfo({
            src: imgpath,
            success: function(re) {
                console.log("self.frameHeight=" + self.frameHeight)
                var frameDeviceH = 600 * self.deviceRatio;
                self.frameHeight = self.frameHeight ? self.frameHeight : frameDeviceH //基本是作废了
                self.initRatio = re.height / frameDeviceH //转换为了px 图片原始大小/显示大小 
                if (self.initRatio < re.width / (750 * self.deviceRatio)) {
                    self.initRatio = re.width / (750 * self.deviceRatio)
                }
                //图片显示大小 缩放后，保证被画出来的图片居中
                self.scaleWidth = (re.width / self.initRatio) //100%
                self.scaleHeight = (re.height / self.initRatio)

                self.startX = 750 * self.deviceRatio / 2 - self.scaleWidth / 2;
                self.startY = 50 * self.deviceRatio + frameDeviceH / 2 - self.scaleHeight / 2;
                self.oldScale = 1
                self.initScaleWidth = self.scaleWidth
                self.initScaleHeight = self.scaleHeight

                console.log('photo ratio=' + self.initRatio + ',res.w=' + re.width + ',res.H=' + re.height + ',fw=' + self.scaleWidth + ',fh=' + self.scaleHeight);

                self.setData({
                    photoWidth: self.scaleWidth,
                    photoHeight: self.scaleHeight,
                    photoTop: self.startY,
                    photoLeft: self.startX,
                    readuSave: true,
                    frameHeight: self.frameHeight,
                })
            }
        })
    },
    uploadScaleStart(e) {
        console.log(e);
        let self = this
        let xDistance, yDistance
        let [touch0, touch1] = e.touches
            //self.touchNum = 0 //初始化，用于控制旋转结束时，旋转动作只执行一次

        //计算第一个触摸点的位置，并参照该点进行缩放
        self.touchX = touch0.clientX
        self.touchY = touch0.clientY
            //每次触摸开始时图片左上角坐标
        self.imgLeft = self.startX
        self.imgTop = self.startY

        // 两指手势触发
        if (e.touches.length >= 2) {
            var frameHeight = self.frameHeight ? self.frameHeight : 600 * self.deviceRatio
            self.initLeft = (self.deviceRatio * 750 / 2 - self.imgLeft) / self.oldScale
            self.initTop = (frameHeight / 2 - self.imgTop) / self.oldScale
                //计算两指距离
            xDistance = touch1.clientX - touch0.clientX
            yDistance = touch1.clientY - touch0.clientY
            self.oldDistance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
        }
    },

    uploadScaleMove(e) {
        console.log('move:' + e);
        drawOnTouchMove(this, e)
    },

    uploadScaleEnd(e) {
        let self = this
        self.oldScale = self.newScale || self.oldScale
        self.startX = self.imgLeft || self.startX
        self.startY = self.imgTop || self.startY
    },
    saveImgToPhone() {
        var self = this
        if (self.data.longImageSrcs || self.data.frameSrc) {
            wx.showLoading({
                title: '保存中',
                mask: true,
            })
        }
        if (self.data.page === 'longImages') {
            var pro = new Promise((resolve, reject) => {
                drawImagesOnTempCanvas(self, resolve)
            })
            pro.then(function(value) {
                wx.canvasToTempFilePath({
                    canvasId: 'tempCanvas',
                    success: function(res) {
                        console.log(res.tempFilePath)
                        wx.previewImage({
                                urls: [res.tempFilePath] // 需要预览的图片http链接列表
                            })
                            // wx.saveImageToPhotosAlbum({
                            //   filePath: res.tempFilePath
                            // })
                        wx.hideLoading()
                    }
                })
            })
        } else if (self.data.page === 'photoFrame') {
            var frameHeight = self.frameHeight ? self.frameHeight : 600 * self.deviceRatio
            var frameHeight2 = 600 * self.deviceRatio;
            self.setData({
                totalHeight: frameHeight
            })
            var tempCtx = wx.createCanvasContext('tempCanvas')
                //照片显示大小
            var sX = Math.max(-self.data.photoLeft * self.initRatio / self.oldScale, 0)
            var sY = Math.max(-self.data.photoTop * self.initRatio / self.oldScale, 0)
            var sW = (self.device.windowWidth) * self.initRatio / self.oldScale
            var sH = (frameHeight) * self.initRatio / self.oldScale

            console.log('photo fh=' + frameHeight + ',sx=' + sX + ',sY=' + sY + ',sW=' + sW + ',sH' + sH);
            //canvas显示大小
            var canvasW = self.device.windowWidth
            var canvasH = frameHeight
            var canvasX = 0; //Math.max(self.data.photoLeft,0); //先默认他是裁剪后出来的，不会移动
            var canvasY = 0; //Math.max(self.data.photoTop,0);
            console.log('canvas sx' + canvasX + ',sY=' + canvasY + ',sW=' + canvasW + ',sH' + canvasH);
            console.log(self.data.photoSrc + ' w=');
            //先画照片

            tempCtx.drawImage(self.data.photoSrc, sX, sY, sW, sH, canvasX, canvasY, canvasW + 95, canvasH + 95) //为什么要加95才能全呢
                //再画相框
            console.log('canvas1 sx' + canvasX + ',sY=' + canvasY + ',sW=' + canvasW + ',sH' + canvasH);
            tempCtx.drawImage(self.data.frameSrc, 0, 0, canvasW, canvasH)
            tempCtx.draw()
            setTimeout(function() {
                wx.canvasToTempFilePath({
                    canvasId: 'tempCanvas',
                    success: function(res) {
                        console.log(res.tempFilePath)
                        wx.previewImage({
                                urls: [res.tempFilePath] // 需要预览的图片http链接列表
                            })
                            // wx.saveImageToPhotosAlbum({
                            //   filePath: res.tempFilePath
                            // })
                        wx.hideLoading();
                    }
                })
            }, 100)
        }
    },
    // 切换导航栏
    changeType1() {
        wx.switchTab({
            url: '/pages/pintu/pintu',
        })
    },
    changeType2() {
        wx.switchTab({
            url: '/pages/border/border',
        })
    },
    changeType3() {
        wx.switchTab({
            url: '/pages/name/name',
        })
    }
})

function drawImagesOnTempCanvas(self, fn) {
    self.setData({
        totalHeight: 0
    })
    var tempCtx = wx.createCanvasContext('tempCanvas')
    getImageInfo(self, tempCtx, 0, fn)
}

function getImageInfo(self, tempCtx, i, fn) {
    if (i < self.data.longImageSrcs.length) {
        wx.getImageInfo({
            src: self.data.longImageSrcs[i],
            success: function(res) {
                var initRatio = res.width / (750 * self.deviceRatio) // 宽度全显 图片原始大小/显示大小
                    //图片显示大小
                var scaleWidth = (res.width / initRatio) //100%
                var scaleHeight = (res.height / initRatio)
                var startX = 0;
                var startY = self.data.totalHeight;
                var totalHeight = self.data.totalHeight + scaleHeight
                self.setData({
                    totalHeight: totalHeight
                })
                tempCtx.drawImage(self.data.longImageSrcs[i], startX, startY, scaleWidth, scaleHeight)
                tempCtx.draw(true)
                getImageInfo(self, tempCtx, i + 1, fn)
            }
        })
    } else {
        setTimeout(fn, 500)
    }
}

function drawOnTouchMove(self, e) {
    let {
        minScale,
        maxScale
    } = self.data
    let [touch0, touch1] = e.touches
    let xMove, yMove, newDistance, xDistance, yDistance

    // 单指手势时触发
    if (e.touches.length === 1) {
        //计算单指移动的距离
        xMove = touch0.clientX - self.touchX
        yMove = touch0.clientY - self.touchY
            //转换移动距离到正确的坐标系下
        self.imgLeft = self.startX + xMove
        self.imgTop = self.startY + yMove
        self.setData({
            photoTop: self.imgTop,
            photoLeft: self.imgLeft
        })
    }
    // 两指手势触发
    if (e.touches.length >= 2) {
        var frameHeight = self.frameHeight ? self.frameHeight : 600 * self.deviceRatio
            // 计算二指最新距离
        xDistance = touch1.clientX - touch0.clientX
        yDistance = touch1.clientY - touch0.clientY
        newDistance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
            //  使用0.005的缩放倍数具有良好的缩放体验
        self.newScale = self.oldScale + 0.005 * (newDistance - self.oldDistance)

        //  设定缩放范围
        self.newScale <= minScale && (self.newScale = minScale)
        self.newScale >= maxScale && (self.newScale = maxScale)

        self.scaleWidth = self.newScale * self.initScaleWidth
        self.scaleHeight = self.newScale * self.initScaleHeight

        self.imgLeft = self.deviceRatio * 750 / 2 - self.newScale * self.initLeft
        self.imgTop = frameHeight / 2 - self.newScale * self.initTop
        self.setData({
            photoTop: self.imgTop,
            photoLeft: self.imgLeft,
            photoWidth: self.scaleWidth,
            photoHeight: self.scaleHeight
        })
    }
}