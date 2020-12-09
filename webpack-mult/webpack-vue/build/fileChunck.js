function fileChunck(options) {
    this.options = options;
}

fileChunck.prototype.apply = function (compiler) {
    let delFileNameArr = this.options.del//删除指定文件
    let copyArr = this.options.copy//移动指定文件
    compiler.hooks.emit
        .tapAsync('fileChunck', function (compilation, callback) {
            Object.keys(compilation.assets).filter((filePath) => {

                /* 删除指定文件 */
                let targetFilePathArr = filePath.split('?')[0].split('/'),
                    targetFilePath = targetFilePathArr[targetFilePathArr.length - 1];
                if (delFileNameArr.indexOf(targetFilePath) >= 0) {
                    delete compilation.assets[filePath]
                }

                /* 复制指定文件 */
                copyArr.filter((obj) => {
                    if (obj.from.indexOf('.html') != -1) {
                        if (filePath === obj.from) {
                            compilation.assets[obj.to] = compilation.assets[filePath]
                        }
                    } else {
                        if (filePath.indexOf('.html') != -1 && filePath.indexOf(obj.from) != -1) {
                            let targetStr = obj.to + filePath.replace(obj.from, '');
                            compilation.assets[targetStr] = compilation.assets[filePath]
                        }
                    }
                    return obj
                })
                return (filePath)
            })
            callback();
        })
};

module.exports = fileChunck;