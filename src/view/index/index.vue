<template>
  <div style='overflow:hidden'>
  <div class="top">
    <img :src='userMessage.profile.backgroundUrl' class='bg-image'/>
    <div class='filter-bg'>
      <div class='header'>
        <!-- <img></img> -->
      </div>
      <div class='header-center'>
        <img :src="userMessage.profile.avatarUrl" class='header-center-image' />
        <div class='user-info'>
          <span class='user-name'>{{userMessage.profile.nickname}}</span>
          <div>
            <span>关注 {{userMessage.profile.follows}}</span>
            <span> | </span>
            <span>粉丝 {{userMessage.profile.followeds}}</span>
          </div>
        </div>
      </div>
      <div class='user-tips'>
        <span class='user-tips-text'>95后</span>
        <span class='user-tips-text'>Lv.8</span>
        <span class='user-tips-text'>广州市</span>
        <span class='user-tips-text'>双鱼座</span>
      </div>
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
      <div class='music-count'>
        <span>歌单({{musicMessage.length}})</span>
        <span>共被收藏{{collectCount}}次</span>
      </div>
      <template v-for="(item,index) in musicMessage" >
        <div class='music-main' @click='toSongListDetails' :id="item.id">
          <img class='music-main-image' :src='item.coverImgUrl'/>
          <div class='music-main-introduce'>
            <span class='music-introduce-name'>{{item.name}}</span>
            <span class='music-introduce-count'>{{item.trackCount}}首，播放{{item.playCount}}次</span>
          </div>
        </div>
      </template>
      <div class='music-count'>
        <span>收藏的歌单({{collectMusicMessage.length}})</span>
      </div>
      <template v-for="(item,index) in collectMusicMessage" >
        <div class='music-main'  @click='toSongListDetails()' :id="item.id">
          <img class='music-main-image' :src='item.coverImgUrl'/>
          <div class='music-main-introduce'>
            <span class='music-introduce-name'>{{item.name}}</span>
            <span class='music-introduce-count'>{{item.trackCount}}首，by {{item.creator.nickname}}，播放{{item.playCount}}次</span>
          </div>
        </div>
      </template>
    </div>
  </div>
  <!-- <playBox></playBox> -->
</div>
</template>

<script>
import api from '../../utils/api.js'
import playBox from '../../components/playBox.vue'
export default {
  components:{playBox},
  data () {
    return {
      userInfo: {},
      hasUserInfo: false,
      // canIUse: wx.canIUse('button.open-type.getUserInfo'),
      musicMessage:[],
      collectMusicMessage:[],
      userMessage:{profile:{}},
      collectCount:0,
    }
  },
  created(){

      let that=this
      console.log(that.globalData)
      // if (that.globalData.userInfo) {
      //     that.userInfo=that.globalData.userInfo
      //     that.hasUserInfo=true
      // } else if (that.canIUse){
      //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      //   // 所以此处加入 callback 以防止这种情况
      //   that.userInfoReadyCallback = res => {
      //     console.log(12)
      //       that.userInfo=res.userInfo
      //       that.hasUserInfo=true
      //   }
      // } else {
      //   // 在没有 open-type=getUserInfo 版本的兼容处理
      //   console.log(21)
      //   // wx.getUserInfo({
      //   //   success: res => {
      //   //     console.log(res)
      //   //     that.globalData.userInfo = res.userInfo
      //   //     that.userInfo=res.userInfo
      //   //     that.hasUserInfo=true
      //   //   }
      //   // })
      // }
      that.getUserMessage();
      that.getUserMusicMessage();
  },
  methods: {
     
    getUserMessage:function(e){
      let that=this
      that.$http.post(api.userDetail, {uid:'118644089'}).then(res => {
        console.log(res)
        that.userMessage=res.data
      })
      // util.request('http://47.104.254.188:3000/user/detail?uid=338944056', 'get', {}, res => {
      //   that.setData({
      //     userMessage: res
      //   })
      // }, res => { })
    },
    getUserMusicMessage:function(e){
      let that = this
      that.$http.post(api.userPlaylist, {uid:'118644089'}).then(res => {//338944056
        for (var i in res.data.playlist){
          if (res.data.playlist[i].description){
              that.collectMusicMessage.push(res.data.playlist[i])
          }else{
            let musicMessage = that.musicMessage
            let collectCount = 0
            musicMessage.push(res.data.playlist[i])
            for (var i in musicMessage) {
              collectCount += musicMessage[i].subscribedCount
            }
              that.musicMessage=musicMessage
              that.collectCount=collectCount
          }
        }
      })
      
    },
    getUserInfo: function(e) {
      console.log(e)
      that.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    },
    toSongListDetails:function(e){
      let that=this
      let id = e.currentTarget.id
      // alert('跳转')
      that.$router.push({path:'/songListDetails',query:{id:id}})
      // wx.navigateTo({
      //   url: '../songListDetails/main?id='+id
      // })
    },
  }
}
</script>

<style scoped>
.top{
position: relative;
width: 100%;
  height: 240px;
}
.bg-image{
  width: 100%;
  height: 100%;
  position: absolute;
  box-sizing:border-box;
  z-index:1;
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

.header-center{
  display: flex;
  font-size:16px;
  flex-direction: row;
  /* justify-content: space-between; */
  align-items: center;
  margin-top: 50px;
}
.header-center-image{
  width: 100px;
  height:100px;
  border-radius: 50%
}
.user-info{
  margin-left: 20px;
}
.user-name{
  font-size: 20px;
}
.user-tips{
  margin-top: 15px;
}
.user-tips-text{
  padding: 2px 15px;
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
  z-index: 10;
}
.music-content-main{
  background-color: #fff;
  border-top-left-radius: 13px;
  border-top-right-radius:13px;
  font-size: 15px;
  z-index: 11;
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
  padding: 2px 5px;
  border-top: 1px solid #f1f1f1;
  border-bottom: 1px solid #f1f1f1;
}
.music-main-image{
  width: 60px;
  height: 60px;
  border-radius: 4px;
}
.music-main-introduce{
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}
.music-introduce-name{
  width: 300px;
  font-size: 18px;
  margin-bottom: 2px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.music-introduce-count{
  font-size: 11px;
  margin-top: 2px;
  color: #999;
}
</style>