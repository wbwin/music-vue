<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <play-box v-show="!$route.meta.hidePlayBox&&playList.length>0&&playList[0].id!=0"></play-box>
    <router-view/>
  </div>
</template>

<script>
import playBox from './components/playBox'
import {mapState,mapActions} from 'vuex'
export default {
  name: 'App',
  components: {
      playBox,  
  },
  computed:{
        ...mapState(['playList'])
    },
  methods:{}
}
</script>

<style>
body{
  margin: 0
}
p,ul,li{
  margin: 0;
  padding: 0;
}
/*底部弹框*/
.commodity_screen {
 width: 100%;
 height: 100%;
 position: fixed;
 top: 0;
 left: 0;
 background: #000;
 opacity: 0.2;
 overflow: hidden;
 z-index: 550;
 color: #fff;
}
 
.commodity_attr_box {
 width: 100%;
 overflow: hidden;
 position: fixed;
 bottom: 0;
 left: 0;
 z-index:600;
 background: #fff;
 padding-top: 10px;
/* height: 200px; */
 border-radius: 20px 20px 0 0
}
.up{
  animation: up .7s;
}
.down{
  animation: down 1s;
}
@keyframes up{
  0% {transform: translateY(225px);}
  100% { transform: translateY(0); }
}
@keyframes down{
  0% { transform: translateY(0);}
  100% { transform: translateY(225px);}
}

</style>
