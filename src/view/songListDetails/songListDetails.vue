<template>
 <div style='overflow:hidden'>
   <!-- <scroll-view :style="{'height': '100vh'}" :scroll-y="true" > -->
  <div class="bg-img_head">
<div class='header' :style="'background: url('+songListDetails.coverImgUrl+') center center / cover no-repeat'">
      </div>
     <div class='header_mask'></div> 
    <div class='filter-bg'>
      
      <div class='header-center'>
        <img :src='songListDetails.coverImgUrl' class='header-center-img' />
        <div class='user-info'>
          <span class='user-name'>{{songListDetails.name}}</span>
          <div class='user-message'>
            <img :src='songListDetails.creator.avatarUrl' class='user-image'/>
            <span> {{songListDetails.creator.nickname}}</span>
            <!-- <span>></span> -->
          </div>
        </div>
      </div>
      <!-- <div class='user-tips'>
        <span class='user-tips-text'>95后</span>
        <span class='user-tips-text'>Lv.8</span>
        <span class='user-tips-text'>广州市</span>
        <span class='user-tips-text'>双鱼座</span>
      </div> -->
    </div>
  </div>
  <div class='music-content'>
    <div style='height:225px'></div>
    <div class='music-content-main'>
      <div class='music-bar'>
        <span class='music-bar-text'>音乐</span>
        <span class='music-bar-text'>动态</span>
        <span class='music-bar-text'>关于我</span>
      </div>
      <!-- <div class='music-count'>
        <span>歌单(7)</span>
        <span>共被收藏1次</span>
      </div> -->
      <template v-for='(item,index) in songListDetails.tracks'>
        <div class='music-main' @click='toAudioPlay(item.id,index)'>
          <!-- <img class='music-main-image' :src='{{item.coverImgUrl}}'/> -->
          <div class="music-main_state">
            <template v-if="item.id==playList[playListIndex].id">
            <img src="/static/images/playing.png" class="playing"/>
            </template>
            <template v-else>
            <span class='music-main-numb'>{{index+1}}</span>
            </template>
          </div>
          <div class='music-main-introduce'>
            <span class='music-introduce-name'>{{item.name}}</span>
            <span class='music-introduce-count' ><template v-for='(arItem,arIndex) in item.ar' >{{arIndex>0?'/':''}}{{arItem.name}}</template> - {{item.al.name}}</span>
          </div>
          <img src="/static/images/more.png" class="more_img" @click.stop="showMusicDetail(index)"/>
        </div>
      </template>
      
      
    </div>
  </div>
  <!-- </scroll-view> -->
  <div class="commodity_screen" @click="hideModal" v-if="showModalStatus"></div>
  <div :class="[showModalStatus?'up':'down']" class="commodity_attr_box" v-if="showModalStatus">
    <div class="flex_row music_detail_title border_bottom">
      <img :src="tracksDetail.al.picUrl" class="music_detail_img"/>
      <div class="flex_column music_detail_title_right">
        <span class="music_detail_name">歌曲：{{tracksDetail.name}}</span>
        <span class="music_detail_author"><template v-for='(arItem,arIndex) in tracksDetail.ar' >{{arIndex>0?'/':''}}{{arItem.name}}</template></span>
      </div>
    </div>
    <!-- <scroll-view  :style="{'height': '280px'}" :scroll-y="true" > -->
      <ul class="flex_column music_detail_ul">
        <li class="flex_row music_detail_li" @click="nextPlay()">
          <img src="/static/images/next_play.png" class="music_detail_icon"/>
          <p class="music_detail_li_p">下一首播放</p>
        </li>
        <li class="flex_row music_detail_li">
          <img src="/static/images/comment_icon.png" class="music_detail_icon"/>
          <p class="music_detail_li_p">查看评论</p>
        </li>
        <li class="flex_row music_detail_li">
          <img src="/static/images/sing_icon.png" class="music_detail_icon"/>
          <p class="music_detail_li_p">歌手：<template v-for='(arItem,arIndex) in tracksDetail.ar' >{{arIndex>0?'/':''}}{{arItem.name}}</template></p>
        </li>
        <li class="flex_row music_detail_li">
          <img src="/static/images/album_icon.png" class="music_detail_icon"/>
          <p class="music_detail_li_p">专辑：{{tracksDetail.al.name}}</p>
        </li>
        <li class="flex_row music_detail_li">
          <img src="/static/images/del_icon.png" class="music_detail_icon"/>
          <p class="music_detail_li_p">删除</p>
        </li>
      </ul>
    <!-- </scroll-view> -->
  </div>
  <!-- <playBox></playBox> -->
</div>

</template>

<script>
import api from '../../utils/api.js'
import playBox from '../../components/playBox.vue'
import {mapState, mapActions} from 'vuex'
import { Toast } from 'vant'
const util = require("../../utils/util.js")
export default {
  components:{playBox},
  data () {
    return {
     songListDetails:{creator:{}},
     animation:'',
     animationData:'',
     showModalStatus:false,
     tracksDetail:{al:{}},
    //  innerAudioContext:wx.getBackgroundAudioManager(),
    }
  },
  computed:{
    ...mapState(['playListIndex','playListTime','playList','play'])
  },
  created(){
    let that = this
    var timestamp = Date.parse(new Date());
    that.$http.post(api.playlistDetail+'?timestamp='+timestamp,{id:that.$route.query.id}).then(res=>{
      that.songListDetails=res.data.playlist
    })
    
  },
  methods: {
    ...mapActions(['updatePlayListIndex','updatePlayListTime','updatePlayList','updatePlayListMaxTime','updatePlay']),
    //下一首播放
    nextPlay(){
      var that=this
      that.hideModal()
      let tracksDetail=that.tracksDetail
      if(that.playList.length>0&&that.playList[0].id!=0){
        let playListId=that.playList[that.playListIndex].id
        if(playListId!=tracksDetail.id){
          let playList=JSON.parse(localStorage.getItem("playList"))
          let tracksDetailIndex=playList.findIndex(item=>item.id===tracksDetail.id)
          console.log(tracksDetailIndex)
          playList.splice(tracksDetailIndex,1)
          console.log(playList)
          let index=playList.findIndex(item=>item.id===playListId)
          playList.splice(index+1,0,tracksDetail)
          localStorage.setItem('playList',JSON.stringify(playList))
          that.toAudioPlay(playListId)
        }
        Toast('已添加到下一首播放');
        
      }else{
        that.toAudioPlay(tracksDetail.id)
      }
    },
    async toAudioPlay(audioId,index){
      let that=this
      const playList=await that.getPlayList(audioId,index)
      const currentIndex = playList.findIndex(item => item.id === audioId)
      const playListDetail=that.songListDetails.tracks[index]
      //更新数据到vuex中 给playBox用
      that.updatePlayListIndex(currentIndex)
      that.updatePlayList(playList)
    },
    async getPlayList(audioId,index){
      const that=this
      let list=[]
      if(index||index===0){
        list=that.songListDetails.tracks
      }else{
        list=JSON.parse(localStorage.getItem('playList'))
      }
      localStorage.setItem('playList',JSON.stringify(list))
      const playList=list
      if(playList && playList.length > 0){//判断缓存中是否有音乐列表 有则直接使用 否则重新存缓存
         return that.subPlayList(playList, audioId)
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
          // 没有超出数组长度，说明在vuex的列表中，可以直接播放
          let innerAudioContext=util.setBackgroundAudio(that.playList[nextIndex])
          innerAudioContext.onPlay(() => {
            that.updatePlayListMaxTime(innerAudioContext.duration.toFixed(0))
              that.updatePlay(true)
          })
          innerAudioContext.onEnded(()=>{
            that.playNextAudio()
          })
          that.updatePlayListIndex(nextIndex)
          // 当判断到已经到vuex的playList的边界了，重新从storage中拿数据补充到playList
          if (nextIndex === that.playList.length - 1 || nextIndex === 0) {
            // 拿到只有当前音频前后最多5条数据的列表
            const newList =await that.getPlayList(that.playList[nextIndex].id)
            // 当前音频在这5条数据中的索引
            const index = newList.findIndex(item => item.id === that.playList[nextIndex].id)
            // 更新到vuex
            that.updatePlayListIndex(index)
            that.updatePlayList(newList)
          }
      }
  },
    showMusicDetail(index){
      var that=this
      var tracks=that.songListDetails.tracks
      that.tracksDetail=tracks[index]
      that.showModalStatus=true
    },
    showModal() {
      var that=this
      that.showModalStatus=true
      
    },
    hideModal(){
        var that=this
        that.showModalStatus=false
    },
  }
}
</script>

<style lang="less" scoped>
.bg-img_head{
  width: 100%;
  height: 240px;
  position: relative;
  background-size:100% 100%;
  padding:1px;
  box-sizing:border-box;
  z-index:1;
}
.bg-img_head::after{
    content: "";
    width:100%;
    height:240px;
    position: absolute;
    left:0;
    top:0;
    background: inherit;
    filter: blur(2px);
    z-index: 2;
}
.filter-bg{
  font-size: 14px;
  color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 240px;
  z-index: 3;
  padding: 0 15px 0 20px;
  
}
.header_mask{
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      bottom: 0;
      z-index: 2;
      background-color: #000;
      opacity: 0.5;
}
.header{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 240px;
    z-index: 1;
    -webkit-filter: blur(50px);
    filter: blur(50px);
  }
.header-center{
  display: flex;
  font-size: 16px;
  flex-direction: row;
  /* justify-content: space-between; */
  align-items: center;
  margin-top: 50px;
}
.header-center-img{
  width: 100px;
  height:100px;
  border-radius: 4px;
}
.user-info{
  margin-left: 20px;
}
.user-name{
  display: block;
  font-size: 20px;
  margin-bottom: 20px;
}
.user-message{
  display: flex;
  flex-direction: row;
  align-items: center;
}
.user-image{
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 5px;
}
.user-tips{
  margin-top: 15px;
}
.user-tips-text{
  padding: 3px 15px;
  margin-right: 5px;
  background: rgba(255,255,255,0.5);
  border-radius: 15px;
  
}
.music-content{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 499;
}
.music-content-main{
  background-color: #fff;
  border-top-left-radius: 13px;
  border-top-right-radius:13px;
  font-size: 15px;
  z-index: 999;
}
.music-bar{
  padding: 13px 0;
  display: flex;
  flex-direction: row;
}
.music-bar-text{
  flex: 1;
  text-align: center;
}
.music-count{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 7px;
  background: #f1f1f1;
  font-size: 12px;
  color: #999;
}
.music-main{
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 7px 5px;
  border-top: 1px solid #f1f1f1;
  border-bottom: 1px solid #f1f1f1;
  .music-main_state{
    width: 40px;
    .flex_row;
    justify-content:center;
    padding-left: 5px;
    .playing{
        width: 20px;
        height: 20px;

    }
  }
  
}
.music-main-image{
  width: 60px;
  height: 60px;
  border-radius: 4px;
}
.music-main-numb{
  font-size: 18px;
  color: #999;
  margin: 0 13px 0 18px;
}
.music-main-introduce{
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  flex: 1;
}
.music-introduce-name{
  max-width: 270px;
  font-size: 18px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.music-introduce-count{
  display: inline-block;
  max-width: 270px;
  font-size: 13px;
  color: #999;
  margin-top: 3px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  
}

.more_img{
  width: 24px;
  height: 24px;
  margin-right: 10px
}
.music_detail_img{
  width: 50px;
  height: 50px;
  border-radius: 5px;
}
.music_detail_title{
  padding: 15px
}
.music_detail_title_right{
  margin-left: 12px;
  flex: 1;
}
.music_detail_name{
  font-size: 16px;
  color: #333
}
.music_detail_author{
  font-size: 13px;
  color: #999;
  margin-top: 5px
}
.music_detail_ul{

  .music_detail_li{
    padding-left: 20px;
      .music_detail_icon{
        width: 22px;
        height: 22px;
        margin-right: 12px;
      }
      .music_detail_li_p{
        font-size: 16px;
        color: #434343;
        padding: 16px 12px 16px 0;
        flex: 1;
        .text_ellipsis();
        .border_bottom();
      }
  }
}


</style>