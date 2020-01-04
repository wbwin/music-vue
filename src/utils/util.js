const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
  
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  const msTime=timeTemp=>{
    if (!timeTemp) return ''
    timeTemp = new Date(timeTemp).getTime()
    timeTemp = new Date(timeTemp)
    
    var min = timeTemp.getMinutes()
    min = checkAddZone(min)
  
    var se = timeTemp.getSeconds()
    se = checkAddZone(se)
  
    return  min + ':' + se
  }
  function checkAddZone(num) {
    return num < 10 ? '0' + num.toString() : num
  }
  const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  const setBackgroundAudio=detail=>{
    let innerAudioContext=wx.getBackgroundAudioManager()
    //调用播放
    innerAudioContext.title = detail.name
    innerAudioContext.epname = 2
    let singer=''
    for(var i in detail.ar){
      singer+=i>1?'/'+detail.ar[i].name:detail.ar[i].name
    }
    innerAudioContext.singer = singer
    innerAudioContext.coverImgUrl =detail.al.picUrl
    innerAudioContext.src = 'https://music.163.com/song/media/outer/url?id='+detail.id+'.mp3'
    return innerAudioContext
  }
  
  module.exports = {
    formatTime: formatTime,
    msTime: msTime,
    setBackgroundAudio:setBackgroundAudio
  }