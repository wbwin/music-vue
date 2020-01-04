<template>
  <div>
  <div class='bg-img' :style='{background:"url("+playList[playListIndex].al.picUrl+") no-repeat center",backgroundSize:"cover"}'>
  </div>
  <div class="bg-img_bg"></div>
<div class='main'>
    <div class='main-musicMsg'>
      <div class='main-musicMsg-lf'>
        <span class='main-musicMsg-name'>{{playList[playListIndex].name}}</span>
        <span class='main-musicMsg-author'><template v-for='(arItem,arIndex) in playList[playListIndex].ar' >{{arIndex>0?'/':''}}{{arItem.name}}</template>></span>
      </div>
      <div>

      </div>

    </div>
    <div class='main-musicMsg-img' @click="showOrHideLyric()" :style="{'opacity':lyricShow?0:1,zIndex:lyricShow?1:2}">
      <div class='img-bg'></div>
      <img class='music-img' :style="{animationPlayState:play?'running':'paused'}"  :src='playList[playListIndex].al.picUrl'/>
    </div>
    <div class="lyric_box" @click="showOrHideLyric()"  :style="{'opacity':lyricShow?1:0,zIndex:lyricShow?2:1}">
      <div class="lyric_box_scroll" id="ele" ref="ele" >
        <div class="lyric_text_box"  >
          <template v-for="(item,index) in lyricList"> 
            <div :key="index" class="lyric_text" :style="{'color': index === lyricListIndex ? '#fff' : '#8e9ba1'}" :ref="'ele'+index">
              <p>{{item[1]}}</p>
              <p>{{item[2]}}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="music_view">
      <div class='music-sliderView'>
        <span class='musicTime'>{{audioValueShow}}</span>
        <!-- <slider :value="audioValue" step="10" backgroundColor="rgba(255,255,255,0.3)" block-size="14" class='music-slider' :max="audioMaxTime"></slider> -->
        <vue-slider v-model="playListTime" :max="playListMaxTime" :dragOnClick="true" ref="slider" @drag-end="sliderDragEnd" class='music-slider' :dotSize="8" :height="2" :processStyle="{backgroundColor:'rgba(255,255,255,1)'}" :railStyle="{backgroundColor:'rgba(255,255,255,0.3)'}" tooltip="none"></vue-slider>
        <span class='musicTime'>{{audioMaxTimeShow}}</span>
      </div>
      <div class='main-musicButton'>
        <img src='/static/images/icon-listLoop.png' class="musicButton_img"/>
        <img src='/static/images/icon-np.png' @click="playLastAudio()" class="musicButton_img"/>
        <div class="pause_box" @click.stop="audioPause">
          <img :src="play?'/static/images/icon-pause.png':'/static/images/icon-begin.png'" class="musicButton_img"/>
        </div>
        <img src='/static/images/icon-np.png' @click="playNextAudio()" class="musicButton_img next_right"/>
        <img src='/static/images/playBox_list_w.png' class="musicButton_img "/>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import api from '../../utils/api.js'
const util = require("../../utils/util.js")
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import {mapState,mapActions} from 'vuex'
export default {
  data () {
    return {
      audioValue:0,
      audioMaxTime:0,
      audioMaxTimeShow:'00:00',
      audioValueShow:'00:00',
      singer:'',
      musicMsg:{al:{},ar:[]},
      lyricShow:false,
      touch:false,
      touchtimer:'',
    }
  },
  components: {
    VueSlider
  },
  computed:{
    ...mapState(['playListIndex','playListTime','playList','play','plannedSpeed','playListMaxTime','lyricList','lyricListIndex'])
  },
  watch:{
    lyricListIndex(){
      const that=this
      var lyricListIndex=that.lyricListIndex
      if(!that.touch){
          that.scrollTo(lyricListIndex)
      }
      
      
    },
   
    playListTime(newPlayListTime,oldPlayListTime){
      const that=this
      if(newPlayListTime==0){
        var audioValueShow = '00:00'
      }else{
        var audioValue = Number((newPlayListTime * 1000).toFixed(0))
        var audioValueShow = util.msTime(audioValue)
      }
      
      that.audioValueShow=audioValueShow
    },
    playListMaxTime(newPlayListMaxTime,oldPlayListMaxTime){
      const that=this
      that.touch=false
      let audioMaxTime = Number((newPlayListMaxTime* 1000).toFixed(0))
      let audioMaxTimeShow = util.msTime(audioMaxTime)
      that.audioMaxTimeShow=audioMaxTimeShow
    }
  },
  created(){
      let that=this
      let audioMaxTime = Number((that.playListMaxTime* 1000).toFixed(0))
      let audioMaxTimeShow = util.msTime(audioMaxTime)
      that.audioMaxTimeShow=audioMaxTimeShow
      that.audio();
      
      
  },
  mounted(){
    const that=this
    that.$refs.ele.addEventListener('touchmove', that.touchMoveBox, false)
    that.$refs.ele.addEventListener('touchend', that.touchEndBox, false)
  },
  methods: {
    ...mapActions(['updatePlayListIndex','updatePlayListTime','updatePlayList','updatePlayListMaxTime','updatePlay','updatePlannedSpeed','updateJumpCurrentTime','updateLyricListIndex']),
    //滚动动画
     scrollTo(i) {
      const that=this
      const targetOffsetTop=that.$refs['ele'+i][0].offsetTop-180
      let scrollTop=document.getElementById('ele').scrollTop
      let difference=targetOffsetTop-scrollTop
      let step=0
      if(difference>200||difference<-200){
        step =30
      }else{
        step = 3
      }
      
      // 判断是往下滑还是往上滑
      if (scrollTop > targetOffsetTop) {
        // 往上滑
        smoothUp()
      } else {
        // 往下滑
        smoothDown()
      }
      // 定义往下滑函数
      function smoothDown() {
        // 如果当前 scrollTop 小于 targetOffsetTop 说明视口还没滑到指定位置
        if (scrollTop < targetOffsetTop) {
          // 如果和目标相差距离大于等于 STEP 就跳 STEP
          // 否则直接跳到目标点，目标是为了防止跳过了。
          if (targetOffsetTop - scrollTop >= step) {
            scrollTop += step
          } else {
            scrollTop = targetOffsetTop
          }
          document.getElementById('ele').scrollTop = scrollTop
          // 屏幕在绘制下一帧时会回调传给 requestAnimationFrame 的函数
          // 关于 requestAnimationFrame 可以自己查一下，在这种场景下，相比 setInterval 性价比更高
          requestAnimationFrame(smoothDown)
        }
      }
      // 定义往上滑函数
      function smoothUp() {
        if (scrollTop > targetOffsetTop) {
          if (scrollTop - targetOffsetTop >= step) {
            scrollTop -= step
          } else {
            scrollTop = targetOffsetTop
          }
          // console.log(scrollTop )
          document.getElementById('ele').scrollTop = scrollTop
          requestAnimationFrame(smoothUp)
        }
      }
    },
    //触摸滑动停止滚动
    touchMoveBox(){
      const that=this
      if(!that.touch){
        that.touch=true
        clearTimeout(that.touchtimer)
        
      }
    },
    //触摸结束开始滚动
    touchEndBox(){
      const that=this
      let touchtimer=setTimeout(()=>{
        that.touch=false
      },2000)
      that.touchtimer=touchtimer
    },
    //拖拽点击结束改变slider的值
    sliderDragEnd(){
      const that=this
      that.touch=false
      let lyricListIndex = 0;
      let lyricList=that.lyricList
      let value=that.$refs.slider.getValue()
      for(let i = 0; i < this.lyricList.length; i++){
            if(value>lyricList[i][0]-1){
              // console.log(audioValue)
              lyricListIndex=i
            }
          }
          that.updateLyricListIndex(lyricListIndex)
      that.updateJumpCurrentTime(value)
    },
    //点击显示隐藏歌词
    showOrHideLyric(){
      const that=this
      that.lyricShow=!that.lyricShow
    },
    audio: function (){
      let that = this
      let musicMsg = that.playList[that.playListIndex]
      that.musicMsg=musicMsg
    },
    
    //暂停开始音乐
        audioPause(){
            const that=this
            if(that.play){
                that.updatePlay(false)
                var currentTime=that.playListTime
                var duration=that.playListMaxTime
                var plannedSpeed=((currentTime/duration)*100).toFixed(2)
                that.updatePlannedSpeed(plannedSpeed)
            }else{
                that.updatePlay(true)
            }
        },
        async getPlayList(audioId){
            const that=this
            const playList=JSON.parse(localStorage.getItem('playList'))
            if(playList && playList.length > 0){//判断缓存中是否有音乐列表 有则直接使用 否则重新存缓存
                return that.subPlayList(playList, audioId)
            }else{
                // const list=that.songListDetails.tracks
                // wx.setStorageSync('playList',list)
                // return that.subPlayList(list, audioId)
                console.log('缓存没数据')
            }
        },
        //更新vuex中的音乐列表 保证一定有5条数据
        subPlayList(playList, audioId) {
            let tempArr = [...playList]
            const count = 5 // 保持vuex中最多5条数据
            const middle = parseInt(count / 2) // 中点的索引
            const len = tempArr.length
            // 如果整个原始的播放列表本来就少于5条数据，说明不需要裁剪，直接返回
            if (len <= count) {
                return tempArr
            }
            // 找到当前要播放的音频的所在位置
            const index = tempArr.findIndex(item => item.id === audioId)
            // 截取当前音频的前后两条数据
            tempArr = tempArr.splice(Math.max(0, Math.min(len - count, index - middle)), count)
            return tempArr
        },
       //下一首
        async playNextAudio() {
            const that=this
            const nextIndex = that.playListIndex + 1
            if (nextIndex < that.playList.length) {
                that.updatePlayListIndex(nextIndex)
                that.updatePlayList(that.playList)
                // 当判断到已经到vuex的playList的边界了，重新从storage中拿数据补充到playList
                if (nextIndex === that.playList.length - 1 || nextIndex === 0) {
                    // 拿到只有当前音频前后最多5条数据的列表
                    
                    const newList = await that.getPlayList(that.playList[nextIndex].id)
                    // 当前音频在这5条数据中的索引
                    const index = newList.findIndex(item => item.id === that.playList[nextIndex].id)
                    // 更新到vuex
                    
                    that.updatePlayListIndex(index)
                    that.updatePlayList(newList)
                }
            }
        },
        //上一首
        async playLastAudio() {
            const that=this
            const lastIndex = that.playListIndex - 1
            if (lastIndex >= 0) {
                that.updatePlayListIndex(lastIndex)
                that.updatePlayList(that.playList)
                // 当判断到已经到vuex的playList的边界了，重新从storage中拿数据补充到playList
                if (lastIndex === 0) {
                    // 拿到只有当前音频前后最多5条数据的列表
                    const newList = await that.getPlayList(that.playList[lastIndex].id)
                    // 当前音频在这5条数据中的索引
                    const index = newList.findIndex(item => item.id === that.playList[lastIndex].id)
                    // 更新到vuex
                    that.updatePlayListIndex(index)
                    that.updatePlayList(newList)
                }
                
            }
        },
  }
}
</script>

<style lang="less">
.bg-img{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  padding:1px;
  box-sizing:border-box;
  z-index:1;
  filter: blur(50px);
}
.bg-img_bg{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  background-color: #000;
  opacity: 0.5;
  //  filter: blur(10px);
}
.main{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3
}
.main-musicMsg{
  padding: 10px 20px;
  border-bottom: thin solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 15px;
}
.main-musicMsg-lf{
  display: flex;
  flex-direction: column;
  justify-content: center
}
.main-musicMsg-name{
  font-size: 18px;
}
.main-musicMsg-author{
  opacity: 0.4
}
.main-musicMsg-img{
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  transition: opacity 0.5s linear 0.5s;
}
.img-bg{
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background-color: #999;
  opacity: 0.3
}
.music-img{
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  animation: music-img 40s linear infinite;
}
@keyframes music-img {
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(180deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
.music-sliderView{
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 15px;
  color: #fff;
  font-size: 10px;
  margin-top: 50px;
  margin-bottom: 20px;
}
.musicTime{
  opacity: 0.5
}
.music-slider{
  flex: 1;
  margin: 0 10px;
}
.music_view{
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  z-index:3;
}
.main-musicButton{
  padding: 0 25px;
  .flex_row;
  .jc_flex_sa;
  .pause_box{
    .flex_row;
    .jc_flex_center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid #fff;
  }
  .musicButton_img{
    width:24px;
    height:24px
  }
  .next_right{
    transform: rotate(180deg);
  }
}
.lyric_box{
  position: absolute;
  top: 100px;
  bottom: 140px;
  left: 10px;
  right: 10px;
  overflow: hidden;
  transition: opacity 0.5s linear 0.5s;
  .lyric_box_scroll{
    overflow: scroll;
    height: 100%;
    .lyric_text_box{
      padding: 100px 0;
      // transition: -webkit-transform 0.5s linear 0.5s;
      // transform-origin: 0 0 0;
      // transition: transform 0.5s linear 0.5s;
      .lyric_text{
        // height: 42px;
        font-size: 16px;
        color: #fff;
        text-align: center;
        margin: 25px 0;
        p{

        }
      }
    }
  }
}


</style>