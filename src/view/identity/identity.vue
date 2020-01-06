<template>
<div class="content">
  <div class="content_button ">我是游客</div>
  <div class="content_button">我要登陆</div>
</div>
</template>

<script>
export default {
  data () {
    return {
      userInfo: {},
    }
  },
  created(){

      let that=this
      
  },
  methods: {

  }
}
</script>

<style lang="less">
    .content{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        .content_button{
            width: 80%;
            border-radius: 30px;
            text-align: center;
            padding: 15px 0;
            margin: 50px 0;
            color: #fff;
            background:rgba(255,132,27,1);
            box-shadow:0px 0px 8px 0px rgba(255,132,27,0.3);
        }
    }
</style>