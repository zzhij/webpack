const glob = require('glob')
const path = require('path')
const Config = require('../config')
const autoprefixer = require('autoprefixer')
const MiniCssExtractPlugin = require("mini-css-extract-plugin") //webpack4提取样式到单独文件
// const env = process.env.env
const env = (process.argv[6] && process.argv[6].slice(2)) || 'prod'
const isHttp2 = Config.BUILD.IS_HTTP2

const pageList = require('../config/invalidList').pages

/**
 * 工具类
 */
let Utils = {
    /**
     * 自动添加样式处理loader
     * @param {String} type css或scss目前仅这两种
     * @return {*[]}
     */
    autoprofixer(type) {
        let rs = [{
            loader: "postcss-loader",
            options: {
                plugins: () => [autoprefixer({
                    browsers: Config.BROWSERS
                })],
            }
        }]
        if (type === 'css') {
            rs.unshift({
                loader: 'vue-style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    modules: true
                }
            })
        } else if (type === 'scss') {
            rs.unshift({
                loader: 'vue-style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    modules: true
                }
            }, {
                loader: 'sass-loader'
            })
        }
        return rs
    },
    /**
     * 获取入口文件
     * @param {String} filePath
     * @return {Object} {key:val}
     */
    getEntries(filePath) {
        let absolutePath = path.join(process.cwd(), filePath)
        let entries = {},
            keyName, ENTRY_ROOT = Config.ENTRY.ENTRY_ROOT
        let pageListLength = pageList.length
        glob.sync(absolutePath).forEach((entry) => { //E:/study/webpack4/src/html/page2/index.html
            //处理key即资源生成路径
            keyName = entry.substr(entry.indexOf(ENTRY_ROOT) + ENTRY_ROOT.length + 1).replace(/\.html$/, '')
            let val = entry.substr(entry.indexOf('src')).replace(/\.html$/, '.js')
            let isCheck = false
            for (let i = 0; i < pageListLength; i++) {
                let temPage = pageList[i].replace(/\//g, '\\/')
                let reg = new RegExp(`^${temPage}`)
                isCheck = reg.test(keyName)
                if (isCheck) {
                    return false
                }
            }
            if (!isCheck) {
                entries[keyName] = `./${val}`
            }
        })
        return entries
    },

    setAssetsPath(temPath, type = 'js') {
        switch (type) {
            case 'js':
                temPath = this.isDev() ? temPath : `static/${type}/${temPath}?[chunkhash:8]`
                break;
            case 'css':
                temPath = this.isDev() ? temPath : `static/${type}/${temPath}?[chunkhash:8]`
                break;
            case 'image':
                temPath = temPath
                break;
            default:
                break
        }
        temPath = path.posix.join(temPath)

        return temPath
    },
    /**
     * 获取当前环境 production生产
     */
    isProdution() {
        // if (env === 'production') {//生产环境
        //     return true
        // } else {//测试
        //     return env
        // }

        if (env === 'prod' || env === 'production') { //生产环境
            return true
        } else { //测试
            return env
        }
    },
    /**
     * 是否本地开发环境
     */
    isDev() {
        if (/(production|prod)|^(q|dev)(a|b|c|d)|yuyan/.test(env)) {
            return false
        } else {
            return true
        }
    },

    /**
     * 设置出口路径，目前为release
     */
    getOutPath() {
        return path.resolve(__dirname, Config.BUILD.ASSETS_ROOT)
    },
    /**
     * 根据当前环境，设置是否使用source-map
     */
    getDevTool() {
        return this.isDev() ? "eval-source-map" : false
    },
    /**
     * 根据当前环境，设置静态资源js css image域名
     */
    setUrl(type) {
        let topLevel = this.isProdution() === true ? Config.URL.TOP_LEVEL_DOMAIN : 'jianlc.com',
            secondLeve = Config.URL.SECOND_LEVEL_DOMAIN_STATIC,
            secondLeveHtml = Config.URL.SECOND_LEVEL_DOMAIN_HTML,
            env = this.isProdution(),
            rs = ''
        switch (type) {
            case 'js':
            case 'css':
                rs = this.isDev() ?
                    '/' : isHttp2 ? './static' :
                    env === true ? `//${secondLeve}.${topLevel}` : `//${env}-${secondLeve}.${topLevel}`
                break;
            case 'image':
                rs = this.isDev() ?
                    '/' : isHttp2 ? './images' :
                    env === true ? `//${Config.URL.IMG_PUBLIC_PATH}.${topLevel}` : `//${env}-img.${topLevel}`
                break;
            case 'font':
            case 'html':
                rs = this.isDev() ?
                    './static' : isHttp2 ? './static' : '.'
                break;
            default:
                break;
        }

        return rs;
    },
    /**
     * 设置引用别名时路径
     * @return {string}
     */
    setAliasPath(strPath) {
        let rs = ''
        if (!!strPath) {
            rs = path.resolve(__dirname, `.${strPath}`) //增加. 指向上一级目录
        }
        return rs
    },
    cssLoaders(options) {
        options = options || {}

        const cssLoader = {
            loader: 'css-loader',
            options: {
                //minimize: true,
                sourceMap: options.sourceMap
            }
        }

        const postcssLoader = {
            loader: 'postcss-loader',
            options: {
                sourceMap: options.sourceMap,
                plugins: () => [autoprefixer(Config.BROWSERS)],
            }
        }

        // generate loader string to be used with extract text plugin
        function generateLoaders(loader, loaderOptions) {
            const loaders = options.usePostCSS ? [
                cssLoader, postcssLoader
            ] : [cssLoader]

            if (loader) {
                loaders.push({
                    loader: loader + '-loader',
                    options: Object.assign({}, loaderOptions, {
                        sourceMap: options.sourceMap
                    })
                })
            }

            // Extract CSS when that option is specified
            // (which is the case during production build)
            if (options.extract) {

                // return ExtractTextPlugin.extract({
                //     use: loaders,
                //     fallback: 'vue-style-loader'
                // })
                return [MiniCssExtractPlugin.loader].concat(loaders)
            } else {
                return ['vue-style-loader'].concat(loaders)
            }
        }

        // console.log('options::',options);
        //         console.log(JSON.stringify(generateLoaders('sass')))
        // https://vue-loader.vuejs.org/en/configurations/extract-css.html
        return {
            css: generateLoaders(),
            postcss: generateLoaders(),
            less: generateLoaders('less'),
            sass: generateLoaders('sass', {
                indentedSyntax: true
            }),
            scss: generateLoaders('sass'),
            stylus: generateLoaders('stylus'),
            styl: generateLoaders('stylus')
        }
    },
    styleLoaders(options) {
        var output = [];

        var loaders = this.cssLoaders(options);
        for (var extension in loaders) {
            var loader = loaders[extension];
            output.push({
                test: new RegExp('\\.' + extension + '$'),
                use: loader
            })
        }
        return output
    },
    removeInvalidList(entries) {
        // let pageList = process.env.invalidPageList
        //
        // for(let item in entries){
        //     console.log('::::',item);
        // }
        // console.log(entries);
    },
    getLocalHost() {
        const os = require('ip') //node核心模块，提供系统操作函数
        const localIp = this.isDev() ? os.address() : '';
        return Config.DEV.HOST || localIp;
    }
}

module.exports = Utils