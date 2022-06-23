<template>
  <div id="app">
    <div class="tips">温馨提示：请使用正楷在框内签署您的名字，注意字迹工整。</div>
    <div class="text-list">
      <div
        v-for="(item, i) in nameList"
        :key="i"
        :class="['text-item', {'is-active': activeIndex === i}]"
      >
        {{item}}
      </div>
    </div>
    <sign-panel
      class="sign-canvas"
      ref="signPanel"
      :signText="nameList[activeIndex]"
      :lastWriteSpeed="4"
      @confirm="handleCompare"
    />
    <div class="confirm-text">已输入文字</div>
    <div class="view-list">
      <img v-for="(item, i) in imgList" :key="i" class="view-image" :src="item" width="150" height="150">
    </div>
    <div class="button-footer">
      <button class="button" @click="canvasClear()">清空</button>
      <button class="button button-primary" :class="{'is-disabled': !signDone}" :disabled="!signDone" @click="submitImg()">提交</button>
    </div>
  </div>
</template>
<script>
import SignPanel from '../packages';

export default {
  data() {
    return {
      name: '测试试',
      nameList: [],
      imgList: [],
      activeIndex: 0,
      signDone: false
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.nameList = this.name.split('')
    },
    /**
     * 清除画板
     */
    canvasClear() {
      this.$refs.signPanel.canvasClear();
      this.imgList = []
      this.activeIndex = 0
    },

    /**
     * 提交签名
     */
    submitImg() {
    },
    /**
     * 验证并更新文字
     */
    handleCompare(val) {
      if (val && this.imgList.length < this.nameList.length) {
        // 验证签名是否正确
          // const params = {
          // }
          // mailInvoice(params).then(res => {
          //   // 本次校验成功
          //   if(res.verifyResult) {
          //     this.imgList.push(val)
          //     this.activeIndex += 1
          //     // if (this.imgList.length === this.nameList.length) {
          //     //   alert('签名完成！')
          //     // }
          //   } else {
          //     alert('未能识别您的签名内容，请使用正楷字体重新签署。')
          //   }
          // })

          setTimeout(() => {
            // const params = {
            //   aiVerifyTaskId: 2357605896748007460,
            //   handDrawImageBase64: val,
            //   nameNode: this.nameList[this.activeIndex]
            // }

            const res = {
              aiVerifyTaskId: this.taskId,
              verifyResult: true,
              taskResult: 'success'
            }
            if (res.verifyResult) {
              this.imgList.push(val)
              this.activeIndex += 1
              if (this.imgList.length === this.nameList.length) {
                this.signDone = true
              }
            } else {
              alert('未能识别您的签名内容<br>请使用正楷字体重新签署');
            }
          }, 100);
      }
    },

  },
  components: {
    'sign-panel': SignPanel
  },
}
</script>
<style lang="less">
* {
  margin: 0;
  padding: 0;
}
#app {
  touch-action: none;
}
.tips{
  margin: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.sign-canvas{
  display: block;
  margin: 20px auto;
}
.confirm-text {
  text-align: center;
}
.text-list {
  display: flex;
  justify-content: center;
  .text-item {
    display: block;
    margin: 10px;
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 40px;
    border: 2px solid transparent;
    &.is-active {
      border-color: #ccc;
    }
  }
}
.view-list {
  display: flex;
  justify-content: center;
  height: 80px;
  .view-image{
    display: block;
    margin: 10px 6px;
    width: 60px;
    height: 60px;
  }
}
.config{
  width: 350px;
  margin: 20px auto;
  .ul-config{
    .li-c{
      display: flex;
      align-items: center;
      padding: 4px 10px;
      .item-label{
        font-size: 14px;
      }
      .item-content{
        margin-left: 10px;
      }
    }
  }
}
.button-footer {
  display: flex;
  justify-content: space-around;
  padding: 8px;
  .button {
    width: 100px;
    height: 50px;
    line-height: 50px;
    background: #fff;
    border-radius: 10px;
    text-align: center;
    border: 1px solid #ccc;
    cursor: pointer;
    &.button-primary {
      border-color: transparent;
      color: #fff;
      background: #1a90ff;
    }
    &.is-disabled {
      background: #e5e5e5;
    }
  }
}
</style>
