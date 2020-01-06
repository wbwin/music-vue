<template>
    <div class="playBox_box" @click="hideModal" :style="{backgroundColor:showModalStatus?'rgba(0,0,0,0.2)':'transparent','zIndex':showModalStatus?'500':'auto'}">
        <div class="playBox" @click.stop="goToAudioPlay()">
            <img :src="playList[playListIndex].al.picUrl" class="playBox_img"/>
            <div class="playBox_content">
                <p class="title" >{{playList[playListIndex].name}}</p>
                <p class="singer" v-if="!play||(play&&playListTime<lyricList[0][0]-1.7)">
                    <template v-for='(arItem,arIndex) in playList[playListIndex].ar' >{{arIndex>0?'/':''}}{{arItem.name}}</template>
                    </p>
                    <p class="singer" v-else>
                    {{lyricList[lyricListIndex][1]}}
                    </p>
            </div>
            <div class='canvasBox' @click.stop="audioPause">
                <div class='bigCircle' :style="{backgroundColor:playSec||play?'#ccc':'#585858'}"></div>
                <div class='littleCircle'></div>
                <img :src="playSec||play?'/static/images/playBox_pause.png':'/static/images/playBox_play.png'" class="playBox_pause" />
                <canvas canvas-id="runCanvas" ref="canvas" width="30" height="30" id="runCanvas" class='canvas'></canvas>
            </div>
            <img src="/static/images/playBox_list.png" @click.stop="showModal" class="playBox_list"/>
            
        </div>
        <div :class="[showModalStatus?'up':'down']" @click.stop="" class="commodity_attr_box" v-if="showModalStatus">
                <div class="flex_row music_detail_title border_bottom">
                    播放音乐列表(99)
                </div>
                <!-- <scroll-view  :style="{'height': '50vh'}" :scroll-y="true" > -->
                <ul class="flex_column music_detail_ul">
                    <template v-for="(item,index) in showPlayList">
                        <li class="flex_row music_detail_li" @click="toAudioPlay(item.id)">
                            <div class="music_detail_left">
                                <img src="/static/images/playing.png" class="playing"  v-if="item.id==playList[playListIndex].id"/>
                                <div class="music_box" >
                                    <p class="music_name">{{item.name}}-</p>
                                    <p class="author"><template v-for='(arItem,arIndex) in item.ar' >{{arIndex>0?'/':''}}{{arItem.name}}</template></p>
                                </div>
                            </div>
                            <img src="/static/images/delete_play.png" @click.stop="deletList(item.id,index)" class="delete_play" />
                        </li>
                    </template>
                </ul>
                <!-- </scroll-view> -->
                
            </div>
            <audio ref="audio" 
    @pause="onPause"
    @play="onPlay"
    :src="audioMusic" @ended="onEnded" @canplay="getDuration" controls="controls"></audio>
    </div>
</template>
<script>
import api from '../utils/api.js'
import {mapState,mapActions} from 'vuex'
const util = require("../utils/util.js")
export default {
    data(){
        return{
            percentage: '', //百分比
            animTime: '', // 动画执行时间
            playDetail:{al:{}},
            // innerAudioContext:wx.getBackgroundAudioManager(),
            playSec:false,
            currentTime:0,
            canvasTimer:'',
            currentTimer:'',
            showModalStatus:false,
            showPlayList:{},
            
            audioMusic:'',//新
        }
    },
    computed:{
        ...mapState(['playListIndex','playListTime','playList','playListMaxTime','play','plannedSpeed','jumpCurrentTime','lyricList','lyricListIndex'])
    },
    watch:{
        playList(newPlayList,oldPlayList){
            const that=this
            var playListDetail=newPlayList[this.playListIndex]
            this.audioMusic='https://music.163.com/song/media/outer/url?id='+playListDetail.id+'.mp3'
            this.$nextTick(() => {
                this.$refs.audio.play()
            })
            that.lyric()
        },
        play(newPlay,oldPlay){
            const that=this
            if(!newPlay){
                that.pauseAudio()
            }else{
                that.playAudio()
            }
        },
        jumpCurrentTime(newTime,oldTime){
            const that=this
            that.$refs.audio.currentTime=newTime
             var duration=that.$refs.audio.duration
            var plannedSpeed=((newTime/duration)*100).toFixed(2)
            that.updatePlannedSpeed(plannedSpeed)
        },
        playListTime(newPlayListTime,oldPlayListTime){
            const that=this
            let lyricListIndex = 0;
            let lyricListI=that.lyricListIndex>0?that.lyricListIndex:0
            let lyricList=that.lyricList
            for(let i = lyricListI; i < this.lyricList.length; i++){
                if(newPlayListTime>lyricList[i][0]-1.5){
                lyricListIndex=i
                }
            }
            that.updateLyricListIndex(lyricListIndex)
        }
    },
    created(){
        const that=this
        that.playSec=that.play
    },
    methods:{
        ...mapActions(['updatePlay','updatePlannedSpeed','updatePlayListMaxTime','updatePlayListIndex','updatePlayList','updatePlayListTime','updateLyricList','updateLyricListIndex']),
        //歌词
    lyric(){
      
      let that = this
      var timestamp = Date.parse(new Date());
      that.$http.post(api.lyric+'?timestamp='+timestamp,{id:that.playList[that.playListIndex].id}).then(res => {
        var lines=res.data.lrc.lyric
        
         lines = lines.split('\n');
        var result=[]
        let pattern = /\[\d{2}:\d{2}.\d{3}\]/g;
        let pattern2 = /\[\d{2}:\d{2}.\d{2}\]/g;
        while (!pattern.test(lines[0])&&!pattern2.test(lines[0])) {
          lines = lines.slice(1);
        }
        
        lines[lines.length - 1].length === 0 && lines.pop();
        for (var i in lines) {
          let index = lines[i].indexOf(']');
          let time = lines[i].substring(0, index + 1);
          let value = lines[i].substring(index + 1);
          let timeString = time.substring(1, time.length - 1);
          let timeArr = timeString.split(':');
          result.push([parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1]), value]);
        }
        result.sort(function(a, b) {
          return a[0] - b[0];
        });

        //中文
        var chLines=res.data.tlyric.lyric
        chLines=chLines.split('\n');
        let chResult=[]
        while (!pattern.test(chLines[0])&&!pattern2.test(chLines[0])) {
          chLines = chLines.slice(1);
        }
        chLines[chLines.length - 1].length === 0 && chLines.pop();
        for (var i in chLines) {
          let index = chLines[i].indexOf(']');
          
          let time = chLines[i].substring(0, index + 1);
          
          let value = chLines[i].substring(index + 1);
          
          let timeString = time.substring(1, time.length - 1);
          let timeArr = timeString.split(':');
          chResult.push([parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1]), value]);
        }
        chResult.sort(function(a, b) {
          return a[0] - b[0];
        });
        
        for(let i in chResult){
          for(let j in result){
            if(chResult[i][0]==result[j][0]){
              result[j][2]=chResult[i][1]
              break;
            }
          }
        }
        that.updateLyricList(result)
      })
    },
        //音乐详情
        goToAudioPlay(){
            const that=this
            that.$router.push({path:'/audioPlay'})

        },
        //删除播放列表中的音乐
        async deletList(audioId,index){
            const that=this
            const showPlayList=that.showPlayList
            showPlayList.splice(index,1)
            localStorage.setItem('playList',JSON.stringify(showPlayList))
            // wx.setStorageSync('playList',showPlayList)
            that.showPlayList=showPlayList
            var playId=that.playList[that.playListIndex].id
            for(var i in that.playList){
                if(audioId==that.playList[i].id){
                    if(audioId==playId){
                        var playAudioId=that.playListIndex==that.playList.length-1?showPlayList[0].id:that.playList[that.playListIndex+1].id
                        that.toAudioPlay(playAudioId)
                    }else{
                        var playList=await that.getPlayList(that.playList[that.playListIndex].id)
                        var currentIndex = playList.findIndex(item => item.id === that.playList[that.playListIndex].id)
                        //更新数据到vuex中 给playBox用
                        that.updatePlayListIndex(currentIndex)
                        that.updatePlayList(playList)
                    }
                }
            }
            
        },
        //点击切换音乐
         async toAudioPlay(audioId){
            let that=this
            const playList=await that.getPlayList(audioId)
            const currentIndex = playList.findIndex(item => item.id === audioId)
            const playListDetail=playList[currentIndex]
            //更新数据到vuex中 给playBox用
            that.updatePlannedSpeed(0)
            that.updatePlayListIndex(currentIndex)
            that.updatePlayList(playList)
            
        },
        //暂停开始音乐
        audioPause(){
            const that=this
            if(that.play){
                that.playSec=false
                that.updatePlay(false)
                var currentTime=that.$refs.audio.currentTime
                var duration=that.$refs.audio.duration
                var plannedSpeed=((currentTime/duration)*100).toFixed(2)
                that.updatePlannedSpeed(plannedSpeed)
                clearTimeout(that.canvasTimer)
            }else{
                that.playSec=true
                that.draw('runCanvas',that.plannedSpeed,100,that.playListMaxTime*1000);
                that.updatePlay(true)
            }
        },
        async getPlayList(audioId,index){
            const that=this
            const playList=JSON.parse(localStorage.getItem('playList'))
            if(playList && playList.length > 0){//判断缓存中是否有音乐列表 有则直接使用 否则重新存缓存
                return that.subPlayList(playList, audioId)
            }else{
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
                    const newList =await that.getPlayList(that.playList[nextIndex].id)
                    // 当前音频在这5条数据中的索引
                    const index = newList.findIndex(item => item.id === that.playList[nextIndex].id)
                    // 更新到vuex
                    that.updatePlayListIndex(index)
                    that.updatePlayList(newList)
                }else{

                }
            }
        },
        showModal() {
            var that=this
            const playList=JSON.parse(localStorage.getItem('playList'))
            that.showPlayList=playList
            that.showModalStatus=true
        },
        hideModal(){
            var that=this
            that.showModalStatus=false
        },
        // 播放音频
        playAudio () {
            this.$refs.audio.play()
        },
        // 暂停音频
        pauseAudio () {
            this.$refs.audio.pause()
        },
        //当音频能播放时
        getDuration(){
            var that=this
            that.playSec=true
            var playListMaxTime=that.$refs.audio.duration
            var currentTime=that.$refs.audio.currentTime
            that.updatePlayListMaxTime(Number(playListMaxTime.toFixed(0)))
            clearInterval(that.currentTimer)
            that.updatePlayListTime(currentTime)
            that.currentTimer=setInterval(()=>{
                that.updatePlayListTime(currentTime++)
            },1000)
            clearTimeout(that.canvasTimer)
            that.draw('runCanvas',that.plannedSpeed,100,playListMaxTime*1000);
            that.updatePlay(true)
        },
        // 当音频播放
        onPlay (e) {
            const that=this
            clearInterval(that.currentTimer)
            var currentTime=e.target.currentTime
            that.updatePlayListTime(currentTime)
            that.currentTimer=setInterval(()=>{
                that.updatePlayListTime(currentTime++)
            },1000)
        },
        //当音频播放结束时
        onEnded(){
            const that=this
            that.playNextAudio()
        },
        // 当音频暂停
        onPause (e) {
            const that=this
            clearInterval(that.currentTimer)
            // this.audio.playing = false
        },
        // 绘制圆形进度条方法
        run(c, w, h) {
        let that = this;
        var num = (2 * Math.PI / 100 * c) - 0.5 * Math.PI;
        that.ctx2.beginPath();
        that.ctx2.arc(w, h, w-1, -0.5 * Math.PI, num); //每个间隔绘制的弧度
        that.ctx2.strokeStyle="#c95564";
        that.ctx2.lineWidth="2";
        that.ctx2.lineCap="butt";
        that.ctx2.stroke();
        
	    
        // that.ctx2.draw();
        },
    /**
     * start 起始百分比
     * end 结束百分比
     * w,h 其实就是圆心横纵坐标
     */
    // 动画效果实现
    canvasTap(start, end, time, w, h) {
        var that = this;
        start++;
        if (start > end) {
        return false;
        }
        that.ctx2.clearRect(0,0,w*2,h*2);
        that.run(start, w, h);
        that.canvasTimer=setTimeout(function () {
        that.canvasTap(start, end, time, w, h);
        }, time);
    },
        draw(id,speedPercent,percent, animTime){//speedPercent开始百分比
        var that = this;
        var rect=that.$refs.canvas
        if(that.ctx2){
            that.ctx2.clearRect(0,0,rect.width,rect.height);
        }else{
            const ctx2 = rect.getContext('2d');
            that.ctx2=ctx2
        }
        
            that.percentage=percent,
            that.animTime=animTime
        var time = that.animTime / that.percentage;
        // wx.createSelectorQuery().select('#'+id).boundingClientRect(function (rect) { //监听canvas的宽高
            var w = parseInt(rect.width/2); //获取canvas宽的的一半
            var h = parseInt(rect.height/2); //获取canvas高的一半，
            that.canvasTap(speedPercent, that.percentage, time, w, h)
        // }).exec();
        // }
        },
    }
}
</script>
<style lang="less">
audio{
    display: none;
}
.playBox_box{
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100vh;
    .playBox{
        transform:translate3d(0,0,0);
        -webkit-transform:translate3d(0,0,0);
        -o-transform:translate3d(0,0,0);
        -moz-transform:translate3d(0,0,0);
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50px;
        background: #fff;
        z-index: 500;
        border-top: 1px solid #f5f5f5;
        .flex_row;
        .playBox_img{
            width: 40px;
            height: 40px;
            margin: 0 5px;
            border-radius: 50%;
        }
        .playBox_content{
            .flex_column;
            flex: 1;
            margin:0 10px 0 5px;
            .title{
                font-size: 15px;
                color: #3e3e3e;
                .text_ellipsis;
                width: 60vw;
            }
            .singer{
                font-size: 12px;
                color: #bababa;
                width: 225px;
                .text_ellipsis();
                
            }
        }
        .canvasBox{
            width: 30px;
            height: 30px;
            position: relative;
            background-color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            .bigCircle{
                width: 30px;
                height: 30px;
                border-radius: 50%;
                position: absolute;
                top:0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: auto auto;
                background-color: #ccc;
            }
            .littleCircle{
                width: 28px;
                height: 28px;
                border-radius: 50%;
                position: absolute;
                top:0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: auto auto;
                background-color: #fff;
            }
            .playBox_pause{
                position: relative;
                width: 15px;
                height: 15px;
                margin: auto auto 8px auto
            }
            .canvas{
                width:30px;
                height: 30px;
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                right: 0;
                margin: auto auto;
                z-index: 99;
            }
        }
        .playBox_list{
            width: 25px;
            height: 25px;
            margin: 0 10px 0 20px
        }
       
        
    }
     .commodity_attr_box{
            padding-top: 0;
            .music_detail_title{
                width: 100%;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color:#333;
            }
            .music_detail_ul{
                display: block;
                height: 50vh;
                overflow: scroll;
                .music_detail_li{
                    padding: 15px 10px;
                    .flex_row;
                    .jc_flex_sb;
                    .music_detail_left{
                        .flex_row;
                        .playing{
                            width: 18px;
                            height: 18px;
                            margin-right: 10px;
                        }
                        .music_box{
                            
                            display: block;
                            width: 300px;
                            .text_ellipsis;
                            .music_name{
                                display: inline-block;
                                font-size: 16px;
                                color: #525252;
                            }
                            .author{
                                display: inline;
                                vertical-align: bottom;
                                font-size: 13px;
                                color: #a0a0a0;
                            }
                        }
                    }
                    .delete_play{
                        width: 18px;
                        height: 18px;
                    }
                }
            }
            
        }
}
    
    
    
    

</style>