const api={
    userDetail:'/user/detail',//登陆后调用此接口 , 传入用户 id, 可以获取用户详情 参数uid: 用户 id
    userPlaylist:'/user/playlist',//登陆后调用此接口 , 传入用户 id, 可以获取用户歌单 参数uid: 用户 id
    playlistDetail:'/playlist/detail',//歌单能看到歌单名字 , 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可 以获取对应歌单内的所有的音乐，但是返回的trackIds是完整的，tracks 则是不完整的，可拿全部 trackIds 请求一次 song/detail 接口获取所有歌曲的 参数：id : 歌单 id
    lyric:'/lyric',//获取歌词
};
export default api;