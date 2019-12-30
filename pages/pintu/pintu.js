const app = getApp();
// import regeneratorRuntime from './packages/regenerator-runtime/runtime-module';
Page({
        data: {
            emotionUrl: '',
            allText: [],
            isTextEdit: false,
            isChooseFontSize: false,
            isChooseFontColor: false,
            isChooseFontPattern: false,
            inputFocus: false,
            texted: false,
            allColor: ['#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#ffaec9', '#a349a4', '#ffffff', '#c3c3c3'],
            tempImageSrc: '',
            pintu: [],
            building: false,
            frameNineSrcs: [{
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
            // 大的canvas 是 小的canvas 的 multiple 倍
            multiple: 3,
            // 一个格子的宽度，也就是canvas的宽度/3
            grid: 200, // 一个canvas的大小rpx
            width: 600, // 一个canvas的大小rpx
            maxWidth: 600, //canvas的宽度px
            // 在小canvas上画的线的颜色
            lineColor: '#fff',
            // 初始时底图颜色
            heartColor: '#EEEEEE',
            saveType: 0, // 保存图片模式: 0-九宫格;1-单图
            istoggle: false
        },
        onLoad: function(option) {
            // 隐藏底部导航栏
            wx.hideTabBar({
                animation: false //是否需要过渡动画
            });

            this.device = app.globalData.myDevice
            this.deviceRatio = this.device.windowWidth / 750

            let that = this;
            let ctx = wx.createCanvasContext('myCanvas');
            let ctx2 = wx.createCanvasContext('myCanvas2');
            let width = that.data.maxWidth;
            // let multiple = that.data.multiple;
            // let grid = that.data.grid;
            let maxWidth = width * that.deviceRatio;
            this.setData({
                maxWidth
            })


            // 给两个canvas先填充上颜色，避免最后保存时，产生黑色背景
            ctx.setFillStyle('#ffffff')
            ctx.fillRect(0, 0, maxWidth, maxWidth);
            ctx.draw()

            ctx2.setFillStyle('#ffffff');
            ctx2.fillRect(0, 0, maxWidth, maxWidth);
            // ctx2.drawImage(fileUrl, 0, 0, maxWidth * multiple, maxWidth * multiple);
            ctx2.draw();


            // 获取拼图资源
            this.getImgs().then(() => {
                // 调用重置方法，画出九宫格底图
                // that.reset();
                // 默认第一个模板
                let timer = setTimeout(function() {
                    that.chooseFrame(that.data.pintu[0].type)
                    clearTimeout(timer)
                }, 1000)
            });

        },
        onReady() {
            this.saveIndicatorImgs();
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
                            pintu,
                            mask,
                            border
                        } = res.data;
                        // logo图片mask
                        wx.getImageInfo({
                                src: mask,
                                success: function(res) {
                                    that.setData({
                                        mask: res.path
                                    })

                                }
                            })
                            // 拼图图片数据
                        that.setData({
                                pintu
                            })
                            // 循环渲染临时路径到本地
                            // pintu.map(function(item, index) {
                            //  let frameNineSrcs = []; // 生成图片源
                        wx.showLoading({
                            title: '加载中',
                            mask: true
                        })
                        let path = pintu[0].type;
                        let frameNineSrcs = [];
                        // console.log(item)
                        // item.map(function(item2, index2) {
                        //         let obj = {};
                        //         let filepath = 'https://cdnimg.chudianad.com/pintu/' + path + '/';
                        //         let src = filepath + i + '.png';
                        //         wx.getImageInfo({
                        //             src: src,
                        //             success: function(res) {
                        //                 obj.src = res.path;
                        //                 frameNineSrcs.push(obj);
                        //                 // if (i < 9) {
                        //                 //     return;
                        //                 // }
                        //                 that.setData({
                        //                     [path]: frameNineSrcs,
                        //                 })
                        //                 wx.hideLoading(); // 关闭loading遮罩层
                        //                 resolve()
                        //             }
                        //         })
                        //     })
                        for (let i = 1; i < 10; i++) {
                            let obj = {};
                            let filepath = 'https://cdnimg.chudianad.com/pintu/' + path + '/';
                            let src = filepath + i + '.png';
                            wx.getImageInfo({
                                src: src,
                                success: function(res) {
                                    obj.src = res.path;
                                    obj.index = i;
                                    frameNineSrcs.push(obj);
                                    // frameNineSrcs[i] = obj;
                                    if (i < 9) {
                                        return;
                                    }
                                    that.setData({
                                        [path]: frameNineSrcs,
                                    })
                                    wx.hideLoading(); // 关闭loading遮罩层
                                    resolve()
                                }
                            })
                        }
                        // })

                        // frameSrcs
                    }
                })
            })

        },
        focusInput() {
            this.setData({
                inputFocus: !this.data.inputFocus,
            })
        },
        competeAddText() {
            var self = this
            var allText = this.data.allText
            if (allText[allText.length - 1].someText == "点击输入文字" || allText[allText.length - 1].someText == "") {
                this.cancelAddText()
            } else {
                allText[allText.length - 1].isTextActive = false
                this.setData({
                    allText: allText,
                    isTextEdit: false,
                    inputFocus: false,
                    isChooseFontSize: false,
                    isChooseFontColor: false,
                    isChooseFontPattern: false,
                    texted: true
                })
                var ctx = wx.createCanvasContext('tempCanvas')

                ctx.drawImage(self.data.tempImageSrc ? self.data.tempImageSrc : self.data.emotionUrl, 0, 0, 400 * self.deviceRatio, 400 * self.deviceRatio)

                ctx.setFillStyle(allText[allText.length - 1].fontColor)
                    // ctx.font = "oblique bold 30px sans-serif"
                ctx.font = allText[allText.length - 1].fontStyle + ' ' + allText[allText.length - 1].fontWeight + ' ' + allText[allText.length - 1].fontSize + 'px sans-serif'

                ctx.setTextAlign('left')
                ctx.setTextBaseline('top')
                ctx.fillText(allText[allText.length - 1].someText, (allText[allText.length - 1].textL - 30) * self.deviceRatio, (allText[allText.length - 1].textT + 0) * self.deviceRatio)
                ctx.draw(true)
                    //保存图片到临时路径
                saveImgUseTempCanvas(self, 200)
            }
        },
        saveImgToPhone() {
            wx.previewImage({
                urls: [this.data.tempImageSrc ? this.data.tempImageSrc : this.data.emotionUrl] // 需要预览的图片http链接列表
            })
        },
        chooseFrame(e) {
            var that = this;
            let index, path;
            // obj instanceof Object
            if (e instanceof Object) {
                index = e.currentTarget.dataset.index;
                path = e.currentTarget.dataset.path;
            } else {
                index = 0;
                path = e
            }
            this.setData({
                choosedIndex: index, // 选中第几张模板
                frameNineSrcs: [],
                heart: ""
            });
            console.log(path)

            if (path == 'custom') { // 自定义
                this.reset(); // 重置底图
                return;
            }
            if (this.data[path]) { // 存在不用请求网络图片
                console.log("存在请求过:", this.data[path])
                    // 直接替换画布
                let arr = this.data[path].sort(sortData); // 按照index属性进行排序，会改变原数组
                let [...newPath] = arr;
                let newheart = transArray(newPath);
                that.data.heart = newheart;
                // 清除画布再重画
                that.clearCanvas();
                // 画出图片
                that.drawFrameImgs(newheart);
                // 画上水印 70
                that.drawLogo();
                //画出九宫格线条
                that.drawLine();
                return;
            } else { // 请求网络图片后再画
                console.log("不存在请求:", this.data[path])

                let frameNineSrcs = [];
                // let i = 1;
                for (let i = 1; i < 10; i++) {
                    wx.showLoading({
                        title: '加载中',
                        mask: true
                    })
                    let obj = {};
                    let filepath = 'https://cdnimg.chudianad.com/pintu/' + path + '/';
                    let src = filepath + i + '.png';
                    wx.getImageInfo({
                        src: src,
                        success: function(res) {
                            obj.src = res.path;
                            obj.index = i;
                            frameNineSrcs.push(obj);
                            // frameNineSrcs[i] = obj;
                            if (i < 9) {
                                return;
                            }
                            that.setData({
                                [path]: frameNineSrcs,
                            })
                            let timer = setTimeout(function() {
                                    // 直接替换画布
                                    let [...newPath] = frameNineSrcs.sort(sortData);
                                    let newheart = transArray(newPath);
                                    that.data.heart = newheart;
                                    // 清除画布再重画
                                    that.clearCanvas();
                                    // 画出图片
                                    that.drawFrameImgs(newheart);
                                    // 画上水印 70
                                    that.drawLogo();
                                    //画出九宫格线条
                                    that.drawLine();
                                    clearTimeout(timer);
                                    wx.hideLoading(); // 关闭loading遮罩层
                                }, 1000) // 延时1秒画画布
                                // wx.hideLoading(); // 关闭loading遮罩层
                        }
                    })
                }
                // that.getImageInfoPromise(path, i).then(data => {
                //         frameNineSrcs.push(data);
                //         ++i;
                //         console.log(i);
                //         if (i < 10) {
                //             // ++i;
                //             console.log(i);

                //             that.getImageInfoPromise(path, i);
                //             that.setData({
                //                 [path]: frameNineSrcs
                //             })
                //         } else {
                //             console.log(i);

                //             that.setData({
                //                 [path]: frameNineSrcs
                //             })
                //         }
                //     })
            }
        },
        getImageInfoPromise(path, i) {
            return new Promise((resolve, reject) => {
                wx.showLoading({
                    title: '加载中',
                    mask: true
                })
                let obj = {};
                let filepath = 'https://cdnimg.chudianad.com/pintu/' + path + '/';
                let src = filepath + i + '.png';
                wx.getImageInfo({
                    src: src,
                    success: function(res) {
                        obj.src = res.path;
                        resolve(obj);
                        // frameNineSrcs.push(obj);
                        // that.setData({
                        //     [path]: frameNineSrcs,
                        // })
                        wx.hideLoading(); // 关闭loading遮罩层
                    }
                })
            })
        },
        // 切换导航tab
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
        },
        // 点击心形，选择一张图片, 重新绘制画布
        oneImg: function(e) {
            const ctx = wx.createCanvasContext('myCanvas')
            const ctx2 = wx.createCanvasContext('myCanvas2')

            let that = this;
            // let multiple = that.data.multiple;
            // let maxWidth = that.data.maxWidth;
            let grid = that.data.grid * that.deviceRatio;
            console.log(that.data.heart)

            let [...heart1] = that.data.heart;
            // 获取点击时 x 轴的值
            let x = e.changedTouches[0].x;
            // 获取点击时 y 轴的值
            let y = e.changedTouches[0].y;

            // 确定 x 轴是在第几个格子
            x = Math.floor(x / grid);

            // 确定 y 轴是在第几个格子
            y = Math.floor(y / grid);

            console.log(y, x)

            // 判断是不是在心形范围内
            if (!heart1[y][x] > 0) {
                return;
            }

            autoTailor()

            function autoTailor() {
                // 选择图片
                wx.chooseImage({
                    // 点击心形时，只能选一张图片
                    count: 1,
                    success: function(res) {
                        console.log('res', res);
                        let fileUrl = res.tempFilePaths[0];
                        // 获取图片信息
                        wx.getImageInfo({
                            src: res.tempFilePaths[0],
                            success: function(res) {
                                console.log('图片信息', res);
                                heart1[y][x].src = fileUrl;
                                console.log("heart1", heart1)

                                // 调用 drawImg 方法，画出选择的图片
                                // that.drawImg(fileUrl, res, x, y);
                                that.drawFrameImgs(heart1)
                                    // 并画上底图70和九宫格线条
                                that.drawLogo();
                                that.drawLine();

                                // 把选择的图片路径保存在 chooseImgUrl 中
                                // let chooseImgUrl = that.data.chooseImgUrl;
                                // chooseImgUrl['' + x + y] = fileUrl;

                                // that.setData({
                                //   chooseImgUrl: chooseImgUrl
                                // })
                                // 点击心形区域，画的图片等级是3
                                // heart[y][x] = 3;
                            }
                        })
                    }
                })
            }
        },
        // 重置
        reset: function() {
            let that = this;
            let ctx = wx.createCanvasContext('myCanvas');
            let ctx2 = wx.createCanvasContext('myCanvas2');
            let multiple = that.data.multiple;
            let grid = that.data.grid * that.deviceRatio;
            let maxWidth = that.data.maxWidth;
            let heartColor = that.data.heartColor;
            console.log(ctx);
            console.log(ctx2);
            ctx.clearRect(0, 0, maxWidth, maxWidth);
            ctx.clearRect(0, 0, maxWidth, maxWidth);

            let heart = [
                [{ src: 0 }, { src: 0 }, { src: 0 }],
                [{ src: 0 }, { src: 0 }, { src: 0 }],
                [{ src: 0 }, { src: 0 }, { src: 0 }]
            ];

            that.data.heart = heart

            // 重置，画出九宫格底图
            for (let i = 0; i < heart.length; i++) {
                for (let j = 0; j < heart[i].length; j++) {
                    // if (heart[i][j].src == 1) {
                    // ctx.rect(j * grid * multiple, i * grid * multiple, grid * multiple, grid * multiple);
                    ctx.rect(j * grid, i * grid, grid, grid);
                    ctx.setFillStyle(heartColor)
                    ctx.fill();
                }
            }

            ctx2.draw(true);
            ctx.draw(true);

            // that.drawFrameImgs(); // 画模板图
            // 画上水印 70
            that.drawLogo();
            that.drawAddFont(); // 画上传十字样
            //画出九宫格线条
            that.drawLine();

            this.setData({
                choosedIndex: -1
            })
        },
        // 清除画布
        clearCanvas() {
            let that = this;
            let ctx = wx.createCanvasContext('myCanvas');
            let ctx2 = wx.createCanvasContext('myCanvas2');
            let maxWidth = that.data.maxWidth;
            console.log(ctx);
            console.log(ctx2);
            ctx.clearRect(0, 0, maxWidth, maxWidth);
            ctx2.clearRect(0, 0, maxWidth, maxWidth);
        },
        // 画九宫格的线
        drawLine: function() {
            let that = this;
            let ctx = wx.createCanvasContext('myCanvas');
            let ctx2 = wx.createCanvasContext('myCanvas2');

            let multiple = that.data.multiple;
            let grid = that.data.grid * that.deviceRatio;
            let maxWidth = that.data.maxWidth;
            let lineColor = that.data.lineColor;

            // 画出九宫格
            ctx.lineWidth = "6";
            // ctx2.lineWidth = "6";
            ctx.setStrokeStyle(lineColor);
            ctx2.setStrokeStyle(lineColor);
            for (let i = 1; i < 3; i++) {
                ctx.moveTo(i * grid, 0);
                ctx.lineTo(i * grid, maxWidth);
                ctx.stroke();

                ctx.moveTo(0, i * grid);
                ctx.lineTo(maxWidth, i * grid);
                ctx.stroke();
            }
            ctx.draw(true);
            ctx2.draw(true);
        },
        // 九宫格图片  heart // 图片源九宫格格式
        drawFrameImgs(postheart) {
            let that = this;
            let ctx = wx.createCanvasContext('myCanvas');
            let ctx2 = wx.createCanvasContext('myCanvas2');
            let heartColor = that.data.heartColor;
            let grid = that.data.grid * that.deviceRatio;

            // 画出九宫格模板图
            for (let i = 0; i < postheart.length; i++) {
                for (let j = 0; j < postheart[i].length; j++) {
                    let path = postheart[i][j].src;
                    if (path) {
                        ctx.drawImage(path, j * grid, i * grid, grid, grid);
                        ctx2.drawImage(path, j * grid, i * grid, grid, grid);
                    } else {
                        ctx.rect(j * grid, i * grid, grid, grid);
                        ctx.setFillStyle(heartColor)
                        ctx.fill();
                        // 画十字样
                        // 横线条
                        let x1 = j * grid + (grid / 10) * 4;
                        let y1 = i * grid + (grid / 10) * 5;
                        let x2 = j * grid + (grid / 10) * 6;
                        let y2 = i * grid + (grid / 10) * 5;
                        console.log("x1, y1, x2, y2")
                        console.log(x1, y1, x2, y2)
                        that.AddFontTen(ctx, x1, y1, x2, y2);
                        // 竖线条
                        let a1 = j * grid + (grid / 10) * 5;
                        let b1 = i * grid + (grid / 10) * 4;
                        let a2 = j * grid + (grid / 10) * 5;
                        let b2 = i * grid + (grid / 10) * 6;
                        console.log("a1, b1, a2, b2")
                        console.log(a1, b1, a2, b2)
                        that.AddFontTen(ctx, a1, b1, a2, b2);
                    }
                }
            }
            ctx2.draw(false);
            ctx.draw(false);
        },
        drawAddFont() {
            let that = this;
            let ctx = wx.createCanvasContext('myCanvas');
            let ctx2 = wx.createCanvasContext('myCanvas2');
            let grid = that.data.grid * that.deviceRatio;

            let heart = that.data.heart

            // 重置，画出九宫格底图
            for (let i = 0; i < heart.length; i++) {
                for (let j = 0; j < heart[i].length; j++) {
                    // 画十字样
                    // 横线条
                    let x1 = j * grid + (grid / 10) * 4;
                    let y1 = i * grid + (grid / 10) * 5;
                    let x2 = j * grid + (grid / 10) * 6;
                    let y2 = i * grid + (grid / 10) * 5;
                    console.log("x1, y1, x2, y2")
                    console.log(x1, y1, x2, y2)
                    that.AddFontTen(ctx, x1, y1, x2, y2);
                    // 竖线条
                    let a1 = j * grid + (grid / 10) * 5;
                    let b1 = i * grid + (grid / 10) * 4;
                    let a2 = j * grid + (grid / 10) * 5;
                    let b2 = i * grid + (grid / 10) * 6;
                    console.log("a1, b1, a2, b2")
                    console.log(a1, b1, a2, b2)
                    that.AddFontTen(ctx, a1, b1, a2, b2);
                }
            }
            ctx2.draw(true);
            ctx.draw(true);
        },
        AddFontTen(ctx, x1, y1, x2, y2) {

            //重新开始一条路径使颜色不互相影响
            ctx.beginPath();
            ctx.lineWidth = "4";
            //设置笔触的颜色
            ctx.strokeStyle = "#E4E4E4";
            //设置开始坐标
            ctx.moveTo(x1, y1);
            //设置结束坐标
            ctx.lineTo(x2, y2);
            //绘制线条
            ctx.stroke();
            // 后画竖线
            // //重新开始一条路径使颜色不互相影响
            // ctx.beginPath();
            // ctx.lineWidth = "4";
            // //设置笔触的颜色
            // ctx.strokeStyle = "#E4E4E4";
            // //设置开始坐标
            // ctx.moveTo(0, 0);
            // //设置结束坐标
            // ctx.lineTo(200, 100);
            // //绘制线条
            // ctx.stroke();
        },
        // 画出70图标图
        drawLogo() {
            let that = this;
            let maxWidth = this.data.maxWidth;
            // let path = "../../image/bcg-img.png";
            let path = that.data.mask;
            let ctx = wx.createCanvasContext('myCanvas');
            let ctx2 = wx.createCanvasContext('myCanvas2');
            ctx.drawImage(path, 0, 0, maxWidth, maxWidth);
            ctx2.drawImage(path, 0, 0, maxWidth, maxWidth);
            ctx2.draw(true);
            ctx.draw(true);
        },
        // 在canvas画图像(自定义)
        drawImg: function(fileUrl, res, x, y) {
            let that = this;
            let ctx = wx.createCanvasContext('myCanvas');
            let ctx2 = wx.createCanvasContext('myCanvas2');

            let multiple = that.data.multiple;
            let grid = that.data.grid;
            let heart = that.data.heart;

            let width = res.width;
            let height = res.height;

            //  如果图片不是正方形，只画中间的部分
            let sWidth = width > height ? height : width;
            let sx = 0;
            let sy = 0;
            if (width > height) {
                sx = (width - height) / 2;
            }
            if (width < height) {
                sy = (height - width) / 2;
            }

            ctx.drawImage(fileUrl, sx, sy, sWidth, sWidth, x * grid, y * grid, grid, grid);
            ctx.draw(true)

            ctx2.drawImage(fileUrl, sx, sy, sWidth, sWidth, x * grid * multiple, y * grid * multiple, grid * multiple, grid * multiple);
            ctx2.draw(true)
        },
        // 生成图片按钮点击
        saveImgToPhone() {
            let that = this;
            // 判断是保存一张还是保存九张
            if (this.data.saveType == 1) { // 单图保存模式
                that.saveOne();
            } else { // 九宫格
                // 保存为九张
                that.saveNine(2, 2);
            }
        },
        // 保存另外两张提示照片(这是第一张和第九张)
        saveIndicatorImgs() {
            let that = this;
            let grid = 100;
            let ctx3 = wx.createCanvasContext('myCanvas3');
            let ctx4 = wx.createCanvasContext('myCanvas4');
            let path3 = '../../image/first.jpg';
            let path4 = '../../image/last.jpg';
            ctx3.drawImage(path3, 0, 0, grid, grid);
            ctx4.drawImage(path4, 0, 0, grid, grid);
            ctx3.draw(true);
            ctx4.draw(true);
        },
        // 保存为九张图片
        saveNine(x, y) {
            let that = this
                // 显示进度条，并禁用 保存 按钮
            that.setData({
                btnDis: true,
                progressVis: "block",
            })
            let multiple = that.data.multiple;
            let grid = that.data.grid * that.deviceRatio;
            let maxWidth = that.data.maxWidth;
            let width = grid;
            let saveNineImgs = []; // 存放九宫格九张图片数组
            // 第九张提示
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: that.data.grid,
                height: that.data.grid,
                canvasId: 'myCanvas4',
                quality: 1,
                fileType: 'jpg',
                success: function(res) {
                    console.log(res.tempFilePath)
                        // 保存图片到相册
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success(res) {
                            save(x, y);
                        },
                        fail(res) {
                            console.log(res.errMsg)
                            that.setData({
                                btnDis: false
                            })
                        }
                    })
                }
            })

            // save(x, y);  // 保存九宫格图片

            function save(x, y) {

                if (x < 0) {
                    --y;
                    x = 2;
                }

                if (y < 0) {
                    // console.log("x:", x)
                    // console.log("y:", y)
                    that.saveOneCanvas(); //保存整张画布为临时图片
                    // 第一张提示图片
                    wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        width: that.data.grid,
                        height: that.data.grid,
                        canvasId: 'myCanvas3',
                        quality: 1,
                        fileType: 'jpg',
                        success: function(res) {
                            console.log(res.tempFilePath)
                                // 保存图片到相册
                            wx.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success(res) {
                                    wx.showToast({
                                        title: '保存九宫图完成',
                                        icon: 'success',
                                        duration: 2000
                                    })
                                    that.setData({
                                        btnDis: false
                                    })
                                    let oneImg = encodeURIComponent(JSON.stringify(that.data.oneImgSrc));
                                    let nineSrcs = encodeURIComponent(JSON.stringify(saveNineImgs));
                                    // 跳转到保存页面
                                    wx.navigateTo({
                                        url: '/pages/pintuToast/index?oneImg=' + oneImg + '&nineSrcs=' + nineSrcs,
                                    })
                                },
                                fail(res) {
                                    console.log(res.errMsg)
                                }
                            })
                        }
                    })

                    console.log(saveNineImgs);
                    that.setData({
                        saveNineImgs
                    })

                    return;
                }

                wx.canvasToTempFilePath({
                    x: x * width,
                    y: y * width,
                    width: grid,
                    height: grid,
                    canvasId: 'myCanvas',
                    quality: 1,
                    fileType: 'jpg',
                    success: function(res) {
                        console.log(res.tempFilePath)
                        saveNineImgs.push({
                                src: res.tempFilePath
                            })
                            // 保存图片到相册
                        wx.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success(res) {
                                // 保存下一张
                                save(--x, y);
                                // 增加进度条的值
                                // that.progressAdd();
                            },
                            fail(res) {
                                console.log(res.errMsg)
                            }
                        })
                    }
                })
            }

        },
        saveOneCanvas() {
            let that = this;
            let maxWidth = that.data.maxWidth; // 整张画布的宽度
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: maxWidth,
                height: maxWidth,
                canvasId: 'myCanvas',
                fileType: 'jpg',
                success: function(res) {
                    console.log(res.tempFilePath)
                        // 保存图片到相册
                    that.setData({
                        oneImgSrc: res.tempFilePath
                    })
                }
            })
        },
        // 保存为一张图片
        saveOne() {
            let that = this;
            let multiple = that.data.multiple;
            let maxWidth = that.data.maxWidth; // 整张画布的宽度
            wx.showLoading({
                title: '保存中',
                mask: true,
            })

            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: maxWidth,
                height: maxWidth,
                canvasId: 'myCanvas',
                fileType: 'jpg',
                success: function(res) {
                    console.log(res.tempFilePath)
                    wx.previewImage({
                        urls: [res.tempFilePath] // 需要预览的图片http链接列表
                    })

                    // 保存图片到相册
                    // wx.saveImageToPhotosAlbum({
                    //         filePath: res.tempFilePath,
                    //         success(res) {
                    //             wx.showToast({
                    //                 title: '保存单图模式完成',
                    //                 icon: 'success',
                    //                 duration: 2000
                    //             })
                    //         },
                    //         fail(res) {
                    //             console.log(res.errMsg)
                    //         }
                    //     })
                    wx.hideLoading();
                }
            })
        },
        // 切换保存图片模式
        openActionsheet() {
            let that = this;
            that.setData({
                istoggle: true
            })
            wx.showActionSheet({
                itemList: ['九宫格模式', '单图模式'],
                itemColor: '#909090',
                success(res) {
                    console.log(res.tapIndex);
                    that.setData({
                        istoggle: false
                    })
                    that.setData({
                            saveType: res.tapIndex
                        })
                        // if (res.tapIndex === 0) {
                        //     that.data.saveType = 0
                        //     that.setData({
                        //         saveType: 0
                        //     })
                        // } else if (res.tapIndex === 1) {
                        //     that.setData({
                        //         saveType: 0
                        //     })
                        // }
                },
                fail() {
                    that.setData({
                        istoggle: false
                    })
                }
            })
        },
    })
    // 保存画布
function saveImgUseTempCanvas(self, delay) {
    setTimeout(function() {
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 400 * self.deviceRatio,
            height: 400 * self.deviceRatio,
            canvasId: 'tempCanvas',
            success: function(res) {
                wx.hideLoading();
                console.log(res.tempFilePath);
                self.setData({
                    tempImageSrc: res.tempFilePath
                });
                wx.previewImage({
                    urls: [res.tempFilePath] // 需要预览的图片http链接列表
                })
            }
        })
    }, delay)
}
// 转换图片源为九宫格二维数组
function transArray(baseArray) {
    var [...originArray] = baseArray;
    let len = originArray.length;
    let n = 3; //假设每行显示4个
    let lineNum = len % 3 === 0 ? len / 3 : Math.floor((len / 3) + 1);
    let res = [];
    // let newRes = [];
    for (let i = 0; i < lineNum; i++) {
        // slice() 方法返回一个从开始到结束（不包括结束）选择的数组的一部分浅拷贝到一个新数组对象。且原始数组不会被修改。
        let temp = originArray.slice(i * n, i * n + n);
        console.log(temp)
        res.push(JSON.parse(JSON.stringify(temp)));
    }
    console.log(res);
    return res;
}
// 根据数组中的元素对象属性进行排序 .index为原本图片应该的下标
// 用法arrayObject.sort(sortby)
function sortData(a, b) {
    return a.index - b.index
}