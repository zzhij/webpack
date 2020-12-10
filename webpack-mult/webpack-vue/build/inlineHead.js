const fs = require('fs')
const path = require('path')
const Config = require('../config')
const GlobalSetting = require('./globalSetting')
//读取meta文件，并进行替换拼装
let inlineFile = {} // fs.readFileSync(path.resolve(__dirname, '../src/assets/js/lib/meta/meta.js'), 'utf-8')//'../src/assets/js/lib/meta/meta.js'
inlineFile += GlobalSetting()//拼装全局globalPath
let metaCode = `<head><script  type="text/javascript">${inlineFile}</script>`

function inlineHead(options) {
    this.options = options;
}

inlineHead.prototype.apply = function (compiler) {
    compiler.hooks.compilation.tap('inlineMeta', (compilation) => {
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
            'inlineMeta',
            (data, cb) => {
                //正则替换 将meta文件内嵌到页面中
                data.html = data.html.replace(/<head>/, metaCode)
                cb(null, data)
            }
        )

        compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
            'replaceUrl',
            (data, cb) => {
                let homePage = Config.COMPANY_INFO.HOME_PAGE_LEVEL_DOMAIN,
                    topLevelDomain = Config.URL.TOP_LEVEL_DOMAIN
                data.html = `<!--
* Copyright (c) ${homePage}.${topLevelDomain}
* Created by ${topLevelDomain.replace(/\.com|\.cn/, '')}
-->
` + data.html.replace(/\/static/gm, '').replace(/static\//g,'/')
                cb(null, data)
            }
        )
    })
}

module.exports = inlineHead;
