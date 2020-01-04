const getConfig=(type)=>{
    let config={}
    switch(type){
        case 'dev':
            config={
                ApiUrl:"http://47.104.254.188:3000"
            }
            break;
        case 'pro':
            config={
                ApiUrl:""
            }
            break;
    }
    return config
}
const CONFIG = getConfig('dev');
export default {
    ApiUrl: CONFIG.ApiUrl
  }