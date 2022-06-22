<template>
  <div class="canvas-container">
    <canvas
      :ref="bgId"
      class="sign-canvas-bg"
      :id="bgId"
      :style="config.isShowBorder && {border: `${config.borderWidth}px solid ${config.borderColor}`}"
    ></canvas>
    <canvas
      :ref="domId"
      class="sign-canvas" :id="domId"
      @mousedown.prevent.stop="handleMousedown"
      @mousemove.prevent.stop="handleMousemove"
      @mouseup.prevent.stop="handleMouseup"
      @mouseleave.prevent.stop="handleMouseleave"
      @touchstart.prevent.stop="handleTouchstart"
      @touchmove.prevent.stop="handleTouchmove"
      @touchend.prevent.stop="handleTouchend">
        您的浏览器不支持canvas技术,请升级浏览器!
    </canvas>
  </div>
</template>
<script>

export default {
  name: 'SignPanel',
  model: {
    value: 'image',
    event: 'compare'
  },
  props: {
    image: {
      required: false,
      type: [String],
      default: null
    },

    options: {  // 配置项
      required: false,
      type: [Object],
      default: () => null
    },

    currentText: {
      type: String
    }

  },

  data() {
    return {
      value: null, // base64
      domId: `sign-canvas-${Math.random().toString(36).substr(2)}`,  // 生成唯一dom标识
      bgId: `sign-canvas-bg-${Math.random().toString(36).substr(2)}`,  // 生成唯一dom标识
      canvas: null,    //canvas dom对象
      context: null,   //canvas 画布对象
      dpr: 1,
      config: {
        isFullScreen: false, // 暂不实现 是否全屏手写 [Boolean] 可选
        isFullCover: false,  // 暂不实现 是否全屏模式下覆盖所有的元素 [Boolean] 可选
        isDpr: false,        // 是否使用dpr兼容高分屏 [Boolean] 可选
        lastWriteSpeed: 1,   // 书写速度 [Number] 可选
        lastWriteWidth: 2,   // 下笔的宽度 [Number] 可选
        lineCap: 'round',    // 线条的边缘类型 [butt]平直的边缘 [round]圆形线帽 [square]	正方形线帽
        lineJoin: 'bevel',   // 线条交汇时边角的类型  [bevel]创建斜角 [round]创建圆角 [miter]创建尖角。
        canvasWidth: 360,    // canvas宽高 [Number] 可选
        canvasHeight: 360,   // 高度  [Number] 可选
        isShowBorder: true,  // 是否显示边框 [可选]
        bgColor: '#fff',     // 背景色 [String] 可选 注:这背景色仅仅只是canvas背景,保存的图片仍然是透明的
        borderWidth: 1,      // 网格线宽度  [Number] 可选
        borderColor: "#ccc", // 网格颜色  [String] 可选
        bgTextSize: 240,     // 背景临摹文字大小
        writeWidth: 4,       // 基础轨迹宽度  [Number] 可选
        maxWriteWidth: 30,   // 写字模式最大线宽  [Number] 可选
        minWriteWidth: 4,    // 写字模式最小线宽  [Number] 可选
        writeColor: '#101010', // 轨迹颜色  [String] 可选
        isSign: false,       // 签名模式 [Boolean] 默认为非签名模式,有线框, 当设置为true的时候没有任何线框
        imgType:'png',       // 下载的图片格式  [String] 可选为 jpeg  canvas本是透明背景的
        isShowText: true,    // 显示写入文字提示 [Boolean] 可选
        autoWriteDone: true, // 停笔后默认结束 [Boolean] 可选
        doneTime: 1500,      // 停笔后默认结束的时间设置（autoWriteDone为true时有效） [Number] 可选
      },
      writeDoneTimer: null,
      resizeTimer: null,
    };
  },
  mounted() {
    this.init();
    //监听窗口变化
    window.addEventListener('resize',  ()=> {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(()=>{
        this.init()
      } , 1000);
    });
  },

  watch: {
    options: {
      handler() {
        this.init();
      },
      deep: true
    },
    currentText: {
      handler() {
        this.canvasClear()
      }
    }
  },

  methods: {
    init () {
      const options = this.options;
      if (options) {
        for (const key in options) {
          this.config[key] = options[key];
        }
      }
      this.dpr = typeof window !== 'undefined' && this.config.isDpr ? window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1 : 1;
      this.canvas = document.getElementById(this.domId);
      this.canvasBg = document.getElementById(this.bgId);
      this.context = this.canvas.getContext("2d");
      this.contextBg = this.canvasBg.getContext("2d");
      this.canvasBg.style.background = this.config.bgColor;

      // this.setCanvasSize(this.canvas);
      // this.setCanvasSize(this.canvasBg);

      this.canvasInit(this.canvas)
      this.canvasInit(this.canvasBg)

      this.canvasClear();
    },

    /**
     * 设置画布尺寸
     */
    setCanvasSize(canvas) {
      const config = this.config
      if (config.isFullScreen) {
        config.canvasWidth = window.innerWidth || document.body.clientWidth;
        config.canvasHeight = window.innerHeight || document.body.clientHeight;
        if (config.isFullCover) { // 开启全屏覆盖
          canvas.style.position = 'fixed';
          canvas.style.top = 0;
          canvas.style.left = 0;
          canvas.style.margin = 0;
          canvas.style.zIndex = 20001;
        }
      }
      canvas.height = config.canvasWidth;
      canvas.width = config.canvasHeight;
    },

    /**
     * 初始化画板
     */
    canvasInit (canvas) {
      const { config, dpr } = this
      canvas.width = config.canvasWidth * dpr;
      canvas.height = config.canvasHeight * dpr;
      canvas.style.width = `${config.canvasWidth}px`;
      canvas.style.height = `${config.canvasHeight}px`;
      config.emptyCanvas = canvas.toDataURL(`image/${config.imgType}`);
    },

    /**
     * 清空画板
     */
    canvasClear() {
      if (this.config.autoWriteDone && this.writeDoneTimer) {
        clearTimeout(this.writeDoneTimer)
      }
      const { context, contextBg } = this
      context.save();
      contextBg.save();
      context.strokeStyle = this.config.writeColor;
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      contextBg.clearRect(0, 0, this.canvas.width, this.canvas.height);
      context.beginPath();
      contextBg.beginPath();
      if (this.config.isShowBorder && !this.config.isSign) {
        this.setBgLineDash(this.canvasBg, contextBg)
      }
      if(this.config.isShowText && this.currentText) {
        this.setBgCurrentText(contextBg)
      }

      contextBg.restore();
      context.restore();
    },

    /**
     * 绘制画框中虚线
     */
    setBgLineDash(canvasBg, contextBg) {
      const { width, height } = canvasBg
      contextBg.lineWidth = this.config.borderWidth * this.dpr;
      contextBg.strokeStyle = this.config.borderColor;

      contextBg.setLineDash([8, 8]);
      contextBg.moveTo(0, 0);
      contextBg.lineTo(width, height);
      contextBg.stroke();
      contextBg.moveTo(width, 0);
      contextBg.lineTo(0, height);
      contextBg.stroke();
      contextBg.moveTo(width, 0);
      contextBg.lineTo(0, height);
      contextBg.stroke();
      contextBg.moveTo(width / 2, 0);
      contextBg.lineTo(width / 2, height);
      contextBg.stroke();
      contextBg.moveTo(0, height / 2);
      contextBg.lineTo(width, height / 2);
      contextBg.stroke();
    },

    /**
     * 绘制画框中提示的临摹文字
     */
    setBgCurrentText(contextBg) {
      const { canvasWidth, canvasHeight, bgTextSize } = this.config
      contextBg.font = `${bgTextSize}px sans-serif`;
      contextBg.textBaseline = "middle";
      contextBg.fillStyle= "rgba(0, 0, 0, 0.1)";
      const x = (canvasWidth - bgTextSize)/2;
      const y = (canvasHeight)/2 + 20
      const maxWidth = (canvasWidth - (canvasWidth - bgTextSize)/2)
      contextBg.fillText(this.currentText, x, y, maxWidth)
    },


    /**
     * 轨迹宽度
     */
    setLineWidth() {
      const { config, context, dpr } = this
      const nowTime = new Date().getTime();
      const diffTime = nowTime - config.lastWriteTime;
      config.lastWriteTime = nowTime;
      let returnNum = config.minWriteWidth + (config.maxWriteWidth - config.minWriteWidth) * diffTime / 30;
      if (returnNum < config.minWriteWidth) {
        returnNum = config.minWriteWidth;
      } else if (returnNum > config.maxWriteWidth) {
        returnNum = config.maxWriteWidth;
      }
      returnNum = returnNum.toFixed(2);
      // 写字模式和签名模式
      if (config.isSign) {
        context.lineWidth = config.writeWidth * dpr;
      } else {
        const lineWidth = config.lastWriteWidth = config.lastWriteWidth / 4 * 3 + returnNum / 4
        context.lineWidth = lineWidth * dpr;
      }
    },

    /**
     * 写开始
     */
    writeBegin(point) {
      if (this.config.autoWriteDone && this.writeDoneTimer) {
        clearTimeout(this.writeDoneTimer)
      }
      if(this.currentText) {
        this.config.isWrite = true;
        this.config.lastWriteTime = new Date().getTime();
        this.config.lastPoint = point;
        this.writeContextStyle();
      }
    },

    /**
     * 绘制轨迹
     */
    writing(point) {
      const { context, config, dpr } = this
      context.beginPath();
      context.moveTo(config.lastPoint.x * dpr, config.lastPoint.y * dpr);
      context.lineTo(point.x * dpr, point.y * dpr);
      this.setLineWidth();
      context.stroke();
      config.lastPoint = point;
      context.closePath();
    },

      /**
     * 写结束
     */
    writeEnd(point) {
      const config = this.config
      config.isWrite = false;
      config.lastPoint = point;
      if (config.autoWriteDone) {
        this.writeDoneTimer = setTimeout(() => {
          const image = this.saveAsImg()
          this.$emit('compare', image)
        }, config.doneTime)
      }
    },

    /**
     * 轨迹样式
     */
    writeContextStyle () {
      this.context.beginPath();
      this.context.strokeStyle = this.config.writeColor;
      this.context.lineCap = this.config.lineCap;
      this.context.lineJoin = this.config.lineJoin;
    },

    /**
     *  保存图片 格式base64
     */
    saveAsImg() {
      const image = new Image();
      image.src = this.canvas.toDataURL(`image/${this.config.imgType}`);
      this.canvasInit(this.canvas)
      this.canvasInit(this.canvasBg)
      this.canvasClear()
      return image.src;
    },

    /**
     * 鼠标按下 => 下笔
     */
    handleMousedown(e){
      this.writeBegin({ x: e.offsetX || e.clientX, y: e.offsetY || e.clientY });
    },

    /**
     * 书写过程 => 下笔书写
     */
    handleMousemove(e) {
      this.config.isWrite && this.writing({ x: e.offsetX, y: e.offsetY });
    },

    /**
     * 鼠标松开 => 提笔
     */
    handleMouseup(e){
      this.writeEnd({ x: e.offsetX, y: e.offsetY });

    },

    /**
     * 离开书写区域 => 提笔离开
     */
    handleMouseleave(e){
      this.config.isWrite = false;
      this.config.lastPoint = { x: e.offsetX, y: e.offsetY };
    },

    /* ==========================移动端兼容=Start================================ */

    /**
     * 手指按下 => 下笔
     */
    handleTouchstart(e){
      const touch = e.targetTouches[0];
      const x = touch.clientX ? touch.clientX - this.getRect().left :  touch.pageX - this.offset(touch.target,'left');
      const y = touch.clientY ? touch.clientY - this.getRect().top  : touch.pageY - this.offset(touch.target,'top');
      this.writeBegin({ x, y});
    },

    /**
     * 手指移动 => 下笔书写
     */
    handleTouchmove(e){
      const touch = e.targetTouches[0];
      const x = touch.clientX ? touch.clientX - this.getRect().left :  touch.pageX - this.offset(touch.target,'left');
      const y = touch.clientY ? touch.clientY - this.getRect().top  : touch.pageY - this.offset(touch.target,'top');
      this.config.isWrite && this.writing({ x, y });
    },

    /**
     * 手指移动结束 => 提笔离开
     */
    handleTouchend(e){
      const tcs = e.targetTouches;
      const ccs = e.changedTouches;
      const touch = tcs && tcs.length && tcs[0] || ccs && ccs.length && ccs[0];
      const x = touch.clientX ? touch.clientX - this.getRect().left :  touch.pageX - this.offset(touch.target,'left');
      const y = touch.clientY ? touch.clientY - this.getRect().top  : touch.pageY - this.offset(touch.target,'top');
      this.writeEnd({ x, y });
    },

    /* ==========================移动端兼容=End================================== */

    /**
     * 下载二维码到本地
     */
    downloadSignImg(name) {
      const c = document.getElementById(this.domId);
      const dataURL = c.toDataURL('image/png');
      this.saveFile(dataURL, name ? `${name}.${this.config.imgType}` : `${Date.parse(new Date())}.${this.config.imgType}`);
    },

    /**
     * 保存文件
     */
    saveFile(data, filename) {
      const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
      saveLink.href = data;
      saveLink.download = filename;
      const event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      saveLink.dispatchEvent(event);
    },

    /**
     * 获取画布的元素的大小及其相对于视口的位置
     * @return {}
     */
    getRect() {
      return this.$refs[this.domId].getBoundingClientRect();
    },

    /**
     * 获取dom对象的偏移量 可以获取解决position定位的问题
     * @returns number
     */
    offset(obj, direction) {
      //将top,left首字母大写,并拼接成offsetTop,offsetLeft
      const offsetDir = 'offset'+ direction[0].toUpperCase()+direction.substring(1);
      let realNum = obj[offsetDir];
      let positionParent = obj.offsetParent;  //获取上一级定位元素对象
      while(positionParent != null){
        realNum += positionParent[offsetDir];
        positionParent = positionParent.offsetParent;
      }
      return realNum;
    },

    /**
     * 图片压缩
     */
    dealImage()  {
      //压缩系数0-1之间
      // var quality = 0.6;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var dealWidth = 300;    //目标尺寸
      var dealHeight = 200;
      canvas.width = dealWidth;
      canvas.width = dealHeight;


      // if (Math.max(imgWidth, imgHeight) > w) {
      //     if (imgWidth > imgHeight) {
      //         canvas.width = w
      //         canvas.height = w * imgHeight / imgWidth
      //     } else {
      //         canvas.height = w
      //         canvas.width = w * imgWidth / imgHeight
      //     }
      // } else {
      //     canvas.width = imgWidth
      //     canvas.height = imgHeight
      //     quality = 0.6
      // }
      const c = document.getElementById(this.domId);
      const dataURL = c.toDataURL('image/png');
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(dataURL, 0, 0, canvas.width, canvas.height)
      // var ba = canvas.toDataURL('image/jpeg', quality) //压缩语句
    }
  }
};
</script>

<style lang="less" scoped>
.canvas-container {
  position: relative;
  .sign-canvas-bg {
    position: absolute;
    z-index: -1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
