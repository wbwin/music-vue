import Vue from 'vue'
import Router from 'vue-router'
import index from '@/view/index/index'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'identity',
      component: () => import("@/view/identity/identity.vue")
    },
    {
      path: "/songListDetails",
      name: "songListDetails",
      meta: {
        hidePlayBox:false,
          // title: "约家",
          // isHeader: false
      },
      component: () => import("@/view/songListDetails/songListDetails.vue")
    },
    {
      path: "/audioPlay",
      name: "audioPlay",
      meta: {
        hidePlayBox:true,
          // title: "约家",
          // isHeader: false
      },
      component: () => import("@/view/audioPlay/audioPlay.vue")
    },
  ]
})
