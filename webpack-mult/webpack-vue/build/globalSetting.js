const Utils = require('./utils')
const Config = require('../config')

module.exports = function () {
    let TOP_LEVEL_DOMAIN = Config.URL.TOP_LEVEL_DOMAIN,
        apiResult = null,
        temEvn = Utils.isProdution(),
        isPro = false, //true OR qa qb...
        env = '',
        static = Config.URL.SECOND_LEVEL_DOMAIN_STATIC;
    if (temEvn === true) {
        isPro = true
    } else {
        if (temEvn == 'dev') {
            env = Config.DEV.ENV || 'please set CONFIG.DEV.ENV'
        } else {
            env = temEvn
        }
    }
    //处理API配置
    if (isPro) {
        apiResult = !!Config.BUILD.API.PROD ? Config.BUILD.API.PROD : `https://api.${TOP_LEVEL_DOMAIN}`
    } else {
        TOP_LEVEL_DOMAIN = 'jianlc.com'
        if (temEvn == 'dev') {
            if (!Config.DEV.API && !Config.DEV.ENV) {
                apiResult = `http://${Utils.getLocalHost()}:${Config.DEV.PORT}`
            } else {
                apiResult = !!Config.DEV.API ? Config.DEV.API : `https://${env}-api.${TOP_LEVEL_DOMAIN}`
            }
        } else {
            apiResult = !!Config.BUILD.API.TEST ? Config.BUILD.API.TEST : `https://${env}-api.${TOP_LEVEL_DOMAIN}`
        }

    }
    GlobalObj = `
            window.GLOBAL_PATH = {
            "URL_HTML": "https://${isPro ? 'www' : `${env}-www`}.${TOP_LEVEL_DOMAIN}/",
            "URL_HTML_WAP": "https://${isPro ? 'm' : `${env}-m`}.${TOP_LEVEL_DOMAIN}/",
            "URL_API": "${apiResult}",
            "URL_WX_WAP": "https://${isPro ? 'm' : `${env === 'qb' ? 'qa' : 'qc'}`}.${TOP_LEVEL_DOMAIN}/",
            "URL_WX_VERIFY": "${isPro ? `wx.${TOP_LEVEL_DOMAIN}` : `${Config.BUILD.URL_WX_VERIFY ? Config.BUILD.URL_WX_VERIFY : env}.wx.baidu.com`}",
            "ID_WX_APP_JLC": "${isPro ? Config.BUILD.ID_WX_APP.JLC.PROD : Config.BUILD.ID_WX_APP.JLC.TEST}",
            "ID_WX_APP_GJ":"${isPro ? Config.BUILD.ID_WX_APP.GJ.PROD : Config.BUILD.ID_WX_APP.GJ.TEST}",
            "ID_TD_APP": "${isPro ? Config.BUILD.PUSH_DATA.PROD.TALKINGDATA_ID : Config.BUILD.PUSH_DATA.TEST.TALKINGDATA_ID}",
            "URL_PUSH_DATA": "${isPro ? Config.BUILD.PUSH_DATA.PROD.URL_PUSH_DATA : Config.BUILD.PUSH_DATA.TEST.URL_PUSH_DATA}",
            "KEY_PUSH_DATA": "${isPro ? Config.BUILD.PUSH_DATA.PROD.KEY_PUSH_DATA : Config.BUILD.PUSH_DATA.TEST.KEY_PUSH_DATA}",
            "COMPANY_NAME": "${Config.COMPANY_INFO.NAME}",
            "COMPANY_ICP": "${Config.COMPANY_INFO.ICP}",
            "SERVICE_Tel": "${Config.COMPANY_INFO.TEL}",
            "URL_STATIC": "https://${isPro ? static : `${env}-${static}`}.${TOP_LEVEL_DOMAIN}/",
            "URL_JM":"${isPro ? 'https' : 'http'}://${isPro ? 'm' : 'qa-m'}.baidu.com"
        }
    `
    return GlobalObj
}