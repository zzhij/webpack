const Index = {
    BUILD: {
        ASSETS_ROOT: 'dist', //生产文件根目录
        PRO_ROOT: 'html', //生产时页面根目录
        ID_WX_APP: { //微信ID
            GJ: {
                PROD: '',
                TEST: ''
            },
            JLC: {
                PROD: '',
                TEST: ''
            }
        },
        URL_WX_VERIFY: '', //针对测试环境使用
        API: {
            PROD: '', //默认为  https://api.${TOP_LEVEL_DOMAIN} 如不为空，则以此值为准
            TEST: '' //默认为 https://${env}-api.${TOP_LEVEL_DOMAIN} 如不为空，则以此值为准
        },
        PUSH_DATA: { //数据埋点
            PROD: {
                TALKINGDATA_ID: '', //百度
                URL_PUSH_DATA: '',
                KEY_PUSH_DATA: ''
            },
            TEST: {
                TALKINGDATA_ID: '',
                URL_PUSH_DATA: '',
                KEY_PUSH_DATA: ''
            }
        },
        IS_HTTP2: false //是否http2
    },
    DEV: { //是否可以合并ENV和API
        ENV: '', //可为空，开发时默认环境，如在本地开发时要用qa的qa-api时就可以声明qa即可
        API: '', //与上面相同功能 开发时可以调用后端自定义开发服务 http://10.1.1.11:8212 为空时，显示用户ENV对应配置
        ROOT: '/', //浏览器打开的服务目录
        PORT: 8888, //本地开发调试服务端口
        HOST: '0.0.0.0' //默认为本地开发调试服务IP，可自定义 如：10.11.28.11
    },
    URL: {
        TOP_LEVEL_DOMAIN: 'baidu.cn', //一级域名
        SECOND_LEVEL_DOMAIN_STATIC: 's', //静态资源二级域名 js&css 例:s.ceshi.cn qa-s.ceshi.cn
        IMG_PUBLIC_PATH: 'pic' //图片域名 //省略baidu.cn 直接写pic
    },
    ENTRY: {
        ENTRY_ROOT: 'view' //项目根路径，使用webpack编译的文件夹
        // ENTRY_ROOT: 'old-v3'//项目根路径，使用webpack编译的文件夹
    },
    BROWSERS: ['iOS >= 6', 'Android >= 4.1'], //自动补充css前缀浏览器兼容配置
    COMPANY_INFO: {
        NAME: '百度',
        HOME_PAGE_LEVEL_DOMAIN: 'www',
        ICP: '京ICP备11111号',
        TEL: '400-000-000'
    }
}

module.exports = Index