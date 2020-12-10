const {
    resolve,
    join
} = require('path')
const srcDir = resolve(__dirname, './src')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin') //生成html文件

const MiniCssExtractPlugin = require("mini-css-extract-plugin") //webpack4提取样式到单独文件,并且进行压缩，配合下面两个插件使用
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin') //css压缩
const UglifyJsPlugin = require('uglifyjs-webpack-plugin') //js压缩

const InlineHeadPlugin = require('./build/inlineHead') //自定义插件，将meta文件嵌入html头部
const CleanWebpackPlugin = require('clean-webpack-plugin') //清空目录
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin') //将vendor.css嵌入html头部
const fileChunk = require('./build/fileChunck') //删除已内嵌到页面内的文件

const os = require('os') //node核心模块，提供系统操作函数
const HappyPack = require('happypack') //构建加速
const happyThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length
})

const Config = require('./config') //用户配置文件
const Utils = require('./build/utils') //工具类
const isDev = Utils.isDev() //是否开发环境

const entries = Utils.getEntries(`./src/${Config.ENTRY.ENTRY_ROOT}/**/*.html`) //以.html结尾的入口文件
// const apiMocker = require('./mocker/server') //Mocker数据
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const imageRoot = Config.ENTRY.ENTRY_ROOT === 'html-v3' ? 'image' : 'images' //兼容简理财图片路径
console.log(entries)
module.exports = {
    // entry: entries,
    entry: './src/view/index/index.js',
    context: resolve(__dirname, './'),
    output: {
        path: resolve(__dirname, Config.BUILD.ASSETS_ROOT),
        publicPath: Utils.setUrl('js'),
        filename: Utils.setAssetsPath("[name].js", "js"), //本地开发服务器时路径
        chunkFilename: Utils.setAssetsPath("[name].js", "js")
    },
    resolve: {
        //别名
        alias: {
            'vue$': 'vue/dist/vue.min.js',
            'commonCss': Utils.setAliasPath('./src/assets/css/common/common.scss'),
            '@components': Utils.setAliasPath('./src/components'),
            '@css': Utils.setAliasPath('./src/assets/css'),
            '@js': Utils.setAliasPath('./src/assets/js'),
            '@image': Utils.setAliasPath('./src/assets/images'),
            'jqueryForm': Utils.setAliasPath('./src/js/lib/jqueryui/jquery.form.min.js'),
            'vueExt': Utils.setAliasPath('./src/js/modules/vueExt.js'),
            '@fonts': Utils.setAliasPath('./src/assets/fonts'),
            '@src': Utils.setAliasPath('./src')
        },
        //后缀名
        extensions: ['.js', '.css', '.vue']
    },
    module: {
        rules: [
            //css
            ...Utils.styleLoaders({
                extract: true,
                usePostCSS: true
            }),
            //js
            {
                test: /\.js$/,
                include: [resolve(__dirname, 'src'),/@jianlc/],
                use: 'babel-loader'
            },
            //image
            {
                test: /\.(png|jpe?g|gif|svg|ico|mp3|wav)(\?.*)?$/,
                use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 8192, // 小于8k的图片自动转成base64格式，并且不会存在实体图片
                            name: '[path][name].[ext]?[hash:8]',
                            outputPath: function (path) {
                                // return path.replace('src/assets/', '');
                                //path = path.replace('src/assets/', '').replace(`src/${Config.ENTRY.ENTRY_ROOT}/`, `${imageRoot}/`)
                                path = path
                                    .replace('src/assets/images/', `${imageRoot}/`)
                                    .replace(`src/${Config.ENTRY.ENTRY_ROOT}/`, `${imageRoot}/`)
                                    .replace('images/', '')
                                return path
                            },
                            publicPath: function (path) {
                                let url = Utils.setUrl('image'),
                                    temPath = path
                                    .replace('src/assets/', `${imageRoot}/`)
                                    .replace(`src/${Config.ENTRY.ENTRY_ROOT}/`, `${imageRoot}/`)
                                    .replace('images/', '')
                                return isDev ? url + temPath.replace(/^images?\//, `${imageRoot}/`) : url + temPath.replace(/images?\//g, '/');
                            }
                        }
                    }]
                    .concat(isDev ? [] : [ //图片压缩
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                gifsicle: {
                                    interlaced: false,
                                },
                                optipng: {
                                    optimizationLevel: 7,
                                },
                                pngquant: {
                                    quality: [0.65, 0.90],
                                    speed: 4
                                },
                                mozjpeg: {
                                    progressive: true,
                                    quality: 65
                                }
                            }
                        }
                    ])
            },
            //字体
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 2000, // 小于8k的字体自动转成base64格式，并且不会存在实体字体
                        name: '[path][name].[ext]?[hash:8]',
                        outputPath: function (path) {
                            return path
                                .replace(/(src\/assets\/|src\/)/, 'static/')
                        },
                        publicPath: function (path) {
                            let url = Utils.setUrl('css'),
                                temPath = path.replace(/(src\/assets\/|src\/)/, '/'),
                                devPath = `//${Config.DEV.HOST || 'localhost'}:${Config.DEV.PORT}/static${temPath}`,
                                rs = isDev ? devPath : url + temPath

                            //字体资源存在跨域问题，生产时已在测试环境和cdn环境下配置了可跨域，开发环境只能将资源指向localhost
                            return rs;
                        }
                    }
                }]
            },
            //vue
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: Utils.cssLoaders({
                        sourceMap: isDev ? true : false,
                        extract: isDev ? false : true
                    })
                }
            }
        ]
    },
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: isDev ? true : false, // set to true if you want JS source maps,
                uglifyOptions: {
                    warnings: false
                }
            }),
            new OptimizeCSSPlugin({
                cssProcessorOptions: isDev ? true : false ? {
                    safe: true,
                    map: {
                        inline: false
                    }
                } : {
                    safe: true
                }
            })
        ],
        //模块提取
        splitChunks: {
            chunks: 'initial',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: false,
            cacheGroups: {
                vendors: {
                    chunks: 'initial',
                    name: 'vendors',
                    priority: 10,
                    test: /[\\/]node_modules[\\/]vue[\\/]|fastclick[\\/]|babel-polyfill[\\/]|js-base64[\\/]|axios[\\/]/
                },
                commons: {
                    name: 'commons',
                    test: /\.(js|vue)$/,
                    chunks: 'initial',
                    minChunks: 2,
                    reuseExistingChunk: true,
                },
                styles: {
                    name: 'vendors', //如命名为其它，如styles时，构建后会生成对应名称的js依赖文件
                    test: /\.(sa|sc|c)ss$/,
                    priority: 20,
                    chunks: 'all',
                    minChunks: 2,
                    reuseExistingChunk: true,
                    enforce: true
                }
            }
        }
    },
    // 开启调试模式
    devtool: Utils.getDevTool(),
    //本地开发服务
    devServer: {
        contentBase: resolve(__dirname, Config.BUILD.ASSETS_ROOT),
        port: 8888,
        host: '0.0.0.0',
        // open: true,
        hot: true,
        inline: true,
        clientLogLevel: 'warning',
        historyApiFallback: {
            index: '/html/app/index.html'//
        }
        /* before(app) {
            apiMocker(app, resolve('./mocker/data.js'), {
                proxy: {
                    '/repos//*': '',
                },
                changeHost: true
            })
        } */
    },
    plugins: [
        // 目前采用嵌入到页面的方案
        new webpack.DefinePlugin({
            // GLOBAL: {
            //     PATH: JSON.stringify(Config.BUILD.PRO_ROOT)
            // }//html测试用
        }),

        //引入第三方库时，可以全局暴露。这样在打包时，4.x会按需打包。
        new webpack.ProvidePlugin({
            // $: 'zepto-webpack',
            $: resolve(__dirname, 'src/assets/js/lib/zepto/zepto.min.js'),
            Tools: resolve(__dirname, 'src/assets/js/module/Tools.js')
        }),

        /*提取css到页面引入*/
        new MiniCssExtractPlugin({
            filename: Utils.setAssetsPath("[name].css", "css"),
            chunkFilename: Utils.setAssetsPath("[name].css", "css")
        }),

        /*构建加速*/
        new HappyPack({
            id: 'happy',
            verbose: false,
            loaders: [{
                loader: 'vue-loader'
            }],
            threadPool: happyThreadPool
        }),


        //构建前清空目前
        // new CleanWebpackPlugin([Config.BUILD.ASSETS_ROOT]),

    ],

}
if (isDev) {
    module.exports.watch = true;
    module.exports.watchOptions = {
        ignored: /node_modules/,
        aggregateTimeout: 200,
        poll: 200
    };

    module.exports.plugins.push(
        //热重载
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    )
} else {
    module.exports.plugins.push(
        // new BundleAnalyzerPlugin()//模块依赖图
    )
}


for (pathname in entries) {
    if (entries.hasOwnProperty(pathname) && pathname !== 'vendors') {
        // 生成到html目录下
        let conf = {
            filename: `${Config.BUILD.PRO_ROOT}/${pathname}.html`, // html文件输出路径
            template: `./src/${Config.ENTRY.ENTRY_ROOT}/${pathname}.html`, // 模板路径 读取html-v3
            // inject: 'body', // js插入位置
            minify: {
                //压缩设置
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                minifyCSS: true,
                minifyJS: true
            },
            chunksSortMode: 'manual',
            chunks: ['manifest', 'vendors', 'commons', pathname], //vendors chunk 包含js 和 css 两种 即，此处也依赖了vendors.css
            inlineSource: '(vendors.css)|(manifest.js)' //字符串里为正则匹配。
        }

        module.exports.plugins.push(
            new HtmlWebpackPlugin(conf), //根据入口文件生成对应html文件，并将静态资源以link script引入
            new HtmlWebpackInlineSourcePlugin(), //将vendor.css嵌入head内
            new InlineHeadPlugin() //将meta和GlobalPath写入页面head内
        )
    }

}

module.exports.plugins.push(
    new fileChunk({
        del: ['manifest.js', 'vendors.css'],
        copy: [{
                from: 'html/app/invite/invite_circle/invite_circle.html',
                to: 'html/wap/app/invite_circle.html'
            },
            {
                from: 'html/app/invite/invite_circle_list/invite_circle_list.html',
                to: 'html/wap/app/invite_circle_list.html'
            },
            {
                from: 'html/h5/activity/invite/index_new/index_new.html',
                to: 'html/wap/activity/invite/index_new.html'
            },
            {
                from: 'html/h5',
                to: 'html/wap'
            },
            {
                from: 'html/app',
                to: 'html/wap/app'
            }
        ]
    })
)