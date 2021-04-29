/**
 *
 * commonjs
 *
 */
var common = (function ($, w, d) {
    //-----私有-------------------
    var renderers = {};
    var plugins = {};
    var actionSheets = {};

    /**
     *
     *
     * 数据渲染以及插件的运行机制
     *
     *
     */

    function getRenderer(temId) {
        if (!renderers[temId]) {
            renderers[temId] = renderer();
            this[temId] = renderers[temId];
        }
        return renderers[temId];
    }

    function rendererAll(element) {
        var renderersEls = element.find("[renderer]");
        if (element.attr("renderer")) { //如果element本身有renderer
            renderersEls = renderersEls.add(element);
        }
        for (var i = 0, leng = renderersEls.length; i < leng; i++) {
            var rendererEl = renderersEls.eq(i);
            var temId = rendererEl.attr("renderer");
            var data = rendererEl.attr("data");
            var ajax = rendererEl.attr("ajax");
            var dataLoaded = rendererEl.attr("dataloaded");
            if (temId && !dataLoaded) {  //dataLoaded判断数据是否被加载过（即不能多次重复加载）
                var renderer = getRenderer(temId);
                renderer.el = rendererEl;
                if (data || ajax) {
                    renderer.getData();
                }
                renderer.initRender();
                var subElements = rendererEl.find("[id]");
//				这里让所有的带id 的元素，成为render对象的成员变量
                for (var j = 0, lengj = subElements.length; j < lengj; j++) {
                    var subId = subElements.eq(j).attr("id");
                    renderer[subId] = subElements.eq(j);
                }
                if (renderer.method) {
                    renderer.method(rendererEl);  //数据静态渲染(初始化)
                }
                rendererEl.attr("dataloaded", true);
                common[temId] = renderer;
            }
        }
        initPlugin(element);

        //初始化结束
        renderersEls.each(function () {
            var temId = $(this).attr("renderer");
            if (common[temId] && common[temId].initDone) {
                common[temId].initDone();
            }
        });
    }

    function getAjax(url, opt) {
        var ajaxdata = null;
        const token = getToken()
        let urlStr
        if (url.indexOf('?')) {
            urlStr = url + '&token=' + token
        } else {
            urlStr = url + '?token=' + token
        }
        var deta = {
            url: urlStr,
            dataType: "json",
            async: false,
            type: "GET",
            success: function (data) {
                ajaxdata = data.data;
                //返回错误
                if (data.result == "error" && data.status == -1 && (data.errorCode!=1104 || data.errorCode!=1105)) {
                    // alertc(data.info);
                    swal(data.info);
                    if (data.info.indexOf("用户未登录") > -1) {
                        window.location = "/system/home/home";
                    }
                    if(opt && opt.error){
                        opt.error(data);
                    }
                }
            },
            error: function (data) {
                console.log("getAjax Error." + url);
                //alert('error');
            },

        };
        $.ajax(deta);
        $.extend(true, deta, opt);
        return ajaxdata;
    }

    function postAjax(url, requestdata, opt) {
        console.log('url' + url)
        console.log('requestdata' , requestdata)
        if(!requestdata){
            requestdata = {}
        }
        var ajaxdata = null;
        requestdata.token = getToken()
        console.log(getToken())
        console.log('opt' , opt)
        var deta = {
            url: url,
            dataType: "json",
            async: false,//同步
            traditional: true,
            type: "POST",
            data: requestdata,
            success: function (data) {
                ajaxdata = data.data;
                //返回错误
                if (data.result == "error" && data.status == -1) {
                    swal(data.info);
                    if (data.info.indexOf("用户未登录") > -1) {
                        window.location = "/system/home/home";
                    }
                }

                if (opt && opt.callback) {
                    opt.callback(ajaxdata);
                }
            },
            error: function () {
                console.log("postAjax Error." + url);

                if (opt && opt.error) {
                    opt.error();
                }
            },
        };
        $.extend(true, deta, opt);
        $.ajax(deta);
        return ajaxdata;
    }

    function promiseAjax(url, requestdata, opt) {
        requestdata.token = getToken()
        var deta = {
            url: url,
            dataType: "json",
            async: false,//同步
            traditional: true,
            type: "POST",
            data: requestdata,
            success: function (data) {
                ajaxdata = data.data;
                //返回错误
                if (data.result == "error" && data.status == -1) {
                    swal(data.info);
                    if (data.info.indexOf("用户未登录") > -1) {
                        window.location = "/system/home/home";
                    }
                }

                if (opt && opt.callback) {
                    opt.callback(ajaxdata);
                }
            },
            error: function () {
                console.log("postAjax Error." + url);

                if (opt && opt.error) {
                    opt.error();
                }
            },
        };
        $.extend(true, deta, opt);
        return $.ajax(deta);
    }
    function getToken(){
        var token;
        var strcookie = document.cookie;//获取cookie字符串
        var arrcookie = strcookie.split("; ");//分割
        //遍历匹配
        for ( var i = 0; i < arrcookie.length; i++) {
            var arr = arrcookie[i].split("=");
            if (arr[0] == "token"){
                return arr[1];
            }
        }
        return "";
    }

    function initPlugin(element) {
        for (var key in plugins) {
            var els = element.find("[" + key + "]");
            if (element.attr(key) || element.attr(key) === "") {//当有这个属性且有值的时候或者有这个属性没有值的时候执行
                els = els.add(element);
            }
            for (i = 0, leng = els.length; i < leng; i++) {
                var el1 = els.eq(i);
                var pluginDataStr = el1.attr("plugin-data");
                if (pluginDataStr) {
                    if (pluginDataStr.split(':').length >= 2) {  //多条数据的处理
                        var pluginData = eval("({" + pluginDataStr + "})");
                        var idealPluginData = (function () {
                            var temData = {};
                            for (var key in pluginData) {
                                temData[key] = eval("(" + pluginData[key] + ")");
                            }
                            return temData;
                        })();
                        el1.data = idealPluginData;
                    } else {
                        el1.data = eval("(" + pluginDataStr + ")");
                    }
                }
                plugins[key](el1);  //数据动态渲染
            }
        }
    }


    function renderer() {
        return {
            el: null,
            data: null,
            status: 0,
            result: "",
            templates: {},
            getData: function () {
                var hasajax = this.el.attr('ajax');
                var hasdata = this.el.attr('data');
                var self = this;
                console.log('进入成功')
                if (hasajax) {
                    this.data = common.getAjax(hasajax);
                } else {
                    this.data = eval("(" + hasdata + ")");
                }
                this.data = this.formatData(this.data);

            },
            initRender: function () {
                var templateEls = this.el.find("[template]");
                var render = this;

                templateEls.each(function (index, temp) {
                    temp = $(temp);
                    var parent = temp.parent()
                    var tmp_id = temp.attr("template");
                    render.templates[tmp_id] = temp;
                    temp.parent = parent;
                });
                this.refresh();
            },
            initForm: function () {
                var valueEls = this.el.find("[name]");
                for (var i = 0, leng = valueEls.length; i < leng; i++) {
                    var valueEl = valueEls.eq(i);
                    base.val(valueEl, "");
                }
                $(this.el).find("input:checkbox").each(function (index, item) {
                    $(item).removeAttr("checked");
                });
                $(this.el).find(".showuploadFiles").remove();
            },
            refresh: function () {
                var valueEls = this.el.find("[name]");
                for (var i = 0, leng = valueEls.length; i < leng; i++) {
                    var valueEl = valueEls.eq(i);
                    var name = valueEl.attr("name");
                    var value = base.eval(name);
                    try {
                        if (typeof (value) == "object") {
                            value = "";
                            if (value && value.outerHTML && value.outerHTML.startsWith("<") && value.outerHTML.endsWith(">")) {
                                console.log("name为" + name + "的input的name值是另一个元素的id值");
                            }
                        }
                    } catch (err) {
                        value = "";
                        console.log(err);
                    }
                    if (value != "" || value === 0)
                        base.val(valueEl, value);
                    else
                        base.val(valueEl, '');
                }
                for (var tmp_id in this.templates) {
                    var temp = this.templates[tmp_id];
                    var parent = temp.parent;
                    var render = this;

                    parent.empty();
                    if (render.data) {
                        for (var i = 0, leng = render.data.length; i < leng; i++) {
                            var vo = render.data[i];
                            vo.key_code = tmp_id;
                            var t_clone = temp.clone(true);
                            common.eachChild(t_clone, function (child) {
                                base.replace(vo, child);
                            });
                            parent.append(t_clone);
                        }
                    }
                }

                // 对checkbox 的处理
                $(this.el).find("input:checkbox").each(function (index, item) {
                    var needAdd = false;
                    if ($(this).prev()[0] == undefined) {
                        needAdd = true;
                    } else {
                      var  classvalue=  $(this).prev()[0].classList.value;
                        if(classvalue!=null&&classvalue!=undefined){
                            if ($(this).prev()[0].classList.value.indexOf("ace-switch") < 0) {
                                needAdd = true;
                            }
                        }else {
                            needAdd = true;
                        }

                    }
                    if (needAdd) {
                        var cNode = item.cloneNode(true);
                        $(cNode).attr("type", "hidden");
                        //var value = base.eval(cNode.name);
                        $(cNode).val(0);
                        if($(item.parentElement).find("input").length==2){
                            return;
                        }
                        $(item).before(cNode)
                        //item.before(cNode);
                        item.name = "";
                        $(item).change(function () {
                            var hiddenInput = $(this).prev()[0];
                            if (hiddenInput.value == 0) {
                                $(hiddenInput).val(1);
                            } else {
                                $(hiddenInput).val(0);
                            }
                        });
                    }

                    var nameStr = $(item).prev()[0].name;
                    var checkboxValue = base.eval(nameStr);
                    if (checkboxValue == 1) {
                        item.checked = true;
                    } else {
                        item.checked = false;
                    }
                });

                var images = this.el.find(".uploader-list");
                for (var i = 0; i < images.length; i++) {
                    var imagesHtml = "";
                    var canDelete = $(images[i].parentNode).hasClass("canDelete");
                    var nameStr = $(images[i].parentNode).attr("data-uploadfile");
                    var isRequired = $(images[i].parentNode).hasClass("required") ? ' required="required" ' : ' ';

                    var value = base.eval(nameStr);
                    try {
                        if (typeof (value) == "object" && value) {
                            if (value.outerHTML.startsWith("<") && value.outerHTML.endsWith(">")) {
                                value = "";
                                console.log("name为" + nameStr + "的input的name值是另一个元素的id值");
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }

                    var strValue = decodeURI(value);
                    var devlist =[];
                    var fileUrl = "";
                    if (strValue && strValue != "null" && strValue != "undefined" && strValue != "") {
                        if (strValue.indexOf("[") == 0 && strValue.indexOf("]") > 0) {
                            var arrValue = JSON.parse(strValue);
                            if (arrValue.length > 0) {
                                for (var m = 0; m < arrValue.length; m++) {
                                    var file_dev ="";
                                    var url_address = arrValue[m];
                                    var nameStartpoint = url_address.lastIndexOf("/") + 1;
                                    var endpoint = url_address.lastIndexOf("?");
                                    var endStr = url_address.substring(endpoint + 1);

                                    var fileId = endStr.split("=")[1];
                                    if(fileId){
                                        var fileInfo = common.getAjax(url_address.replace("/download?","/getFileInfo?"));
                                        if (fileInfo) {
                                            endStr = fileInfo.fileType;
                                            fileUrl = fileInfo.fileUrl;
                                        }
                                    }
                                    else{
                                        endStr = url_address.substring(url_address.lastIndexOf(".") + 1);
                                        fileUrl = url_address;
                                    }

                                    if (endStr == "jpg" || endStr == "jgeg" || endStr == "png" || endStr == "gif" || endStr == "bmp") {
                                        if(canDelete && arrValue[m]){
                                            file_dev = "<div><img class='showuploadFiles' src="+arrValue[m]+" width='180px' height='150px' onclick='savepic(\""+arrValue[m]+"\")' style='height: 170px; width: 180px;margin:5px; display: block;'>" +
                                             "<i class='fa fa-times-circle showuploadFilesCircle' data-url='"+arrValue[m]+"'  aria-hidden='true' onclick='ossDeleteImage(this)'></i>";
                                        } else{
                                            file_dev= "<img class='showuploadFiles' src=" + arrValue[m] + " width='180px' height='150px' onclick='savepic(\"" + arrValue[m] + "\")' style='height: 170px; width: 180px;margin:5px; display: block;'>";
                                        }
                                        file_dev = file_dev + '</div>';
                                    } else {
                                        var fileName;
                                        if (endpoint > 0) {
                                            fileName = url_address.substring(nameStartpoint, endpoint);
                                        } else {
                                            fileName = url_address.substring(nameStartpoint, url_address.length);
                                        }
                                        file_dev = "<div><a href='" + arrValue[m] + "' target='_black' download='" + arrValue[m] + "' >" + fileName + "</a>";
                                        if (canDelete) {
                                            file_dev = file_dev + "<i class='fa fa-times-circle showuploadFilesCircle' data-url='" + arrValue[m] + "'  aria-hidden='true' onclick='ossDeleteImage(this)'></i>";
                                        }
                                        file_dev = file_dev + "<br>";
                                        file_dev = file_dev + '</div>';
                                    }
                                    devlist.push(file_dev);
                                }
                            }
                        }
                    }

                    if (!value || value == "undefined" || value == "null") {
                        value = "";
                    }
                    var inputStr = '<input type="hidden" name="' + nameStr + '" value="' + value + '" class="upload_file" data-fileUrl="' + fileUrl + '" ' + isRequired + ' />';
                    devlist.push(inputStr);
                    // imagesHtml += inputStr;
                    $(images[i]).parent().find(".showuploadFiles").remove();
                    $(images[i]).parent().find(".showuploadFilesCircle").remove();
                    $(images[i]).parent().prepend(devlist);
                }
            },
            formatData: function (data) {
                console.log('jinru form data')
                return data;
            },
            formDone: function () {
            },
            formError: function () {
                return false;
            },
            extends: function (object) {
                $.extend(true, this, object);
            },
            hide: function () {
                this.show(false);
            },
            show: function (isShow) {
                isShow = (typeof isShow == "undefined") ? true : isShow;
                if (isShow && this.ishidden()) {
                    this.el.show();
                    this.e_show(isShow);  //该renderer显示后会调用里面的e_show()
                }
                if (!isShow && !this.ishidden())
                    this.el.hide();
            },
            e_show: function () {
            },
            ishidden: function () {
                return this.el.is(':hidden');
            },
            method: null
        }

    }

    function eachChild(parent, func) {
        func(parent);
        parent.children().each(function (index, child) {
            common.eachChild($(child), func);
        });
    }

    function getUrlParam(paramName) {
        var url = d.location.toString();
        var arrObj = url.split("?");

        if (arrObj.length > 1) {
            var arrPara = arrObj[1].split("&");
            var arr;

            for (var i = 0; i < arrPara.length; i++) {
                arr = arrPara[i].split("=");

                if (arr != null && arr[0] == paramName) {
                    return arr[1];
                }
            }
            return "";
        }
        else {
            return "";
        }
    }

    //-----公有-------------------
    return {
        renderers: renderers,
        plugins: plugins,
        rendererAll: rendererAll,
        initPlugin: initPlugin,
        getRenderer: getRenderer,
        actionSheets: actionSheets,
        getAjax: getAjax,
        postAjax: postAjax,
        promiseAjax: promiseAjax,
        eachChild: eachChild,
        convertCurrency: convertCurrency,
        convertCurrencyWithDecimal: convertCurrencyWithDecimal,
        dual: function (dual) {
            console.log(dual);
        },
        checktoken: function () {
            //var tokenValue  = myToken;//$("#myToken").val();
            if (myToken == null) {
                window.location.href = "/system/login/index.action";
            }
        },
        getUrlParam: getUrlParam
    }


})(jQuery, window, document);

function myBrowser() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera) {
        return "Opera"
    }
    ; //判断是否Opera浏览器
    if (userAgent.indexOf("Firefox") > -1) {
        return "FF";
    } //判断是否Firefox浏览器
    if (userAgent.indexOf("Chrome") > -1) {
        return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
        return "Safari";
    } //判断是否Safari浏览器
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
        return "IE";
    }
    ; //判断是否IE浏览器
}

var browser;
$(function () {
    browser = myBrowser();//以下是调用上面的函数
//	if ("IE" == browser) {  alert("我是 IE"); }
//	if ("FF" == browser) {  alert("我是 Firefox"); }
//	if ("Chrome" == browser) {  alert("我是 Chrome"); }
//	if ("Opera" == browser) {  alert("我是 Opera"); }
//	if ("Safari" == browser) {   alert("我是 Safari"); }
});

function savepic(src) {
}

/**
 * 初始化
 *
 */
~function () {
    $(function () {
        common.rendererAll($("body"));
        //用于在全局环境中保存对象，比如window.nwei.art
        window.nwei = {};
    })
}();

//处理键盘事件 禁止后退键（Backspace）密码或单行、多行文本框除外
function forbidBackSpace(e) {
    var ev = e || window.event; //获取event对象
    var obj = ev.target || ev.srcElement; //获取事件源
    var t = obj.type || obj.getAttribute('type'); //获取事件源类型
    //获取作为判断条件的事件类型
    var vReadOnly = obj.readOnly;
    var vDisabled = obj.disabled;
    //处理undefined值情况
    vReadOnly = (vReadOnly == undefined) ? false : vReadOnly;
    vDisabled = (vDisabled == undefined) ? true : vDisabled;
    //当敲Backspace键时，事件源类型为密码或单行、多行文本的，
    //并且readOnly属性为true或disabled属性为true的，则退格键失效
    var flag1 = ev.keyCode == 8 && (t == "password" || t == "text" || t == "textarea" || t == "number") && (vReadOnly == true || vDisabled == true);
    //当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
    var flag2 = ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea" && t != "number";
    //判断
    if (flag2 || flag1) return false;
}

$(document).ready(function () {
    //禁止后退键 作用于Firefox、Opera
    document.onkeypress = forbidBackSpace;
    //禁止后退键  作用于IE、Chrome
    document.onkeydown = forbidBackSpace;
});

function formatNumberData(data) {
    if (data != null && data != "" && data != undefined) {
        if (data == 0) {
            return "0.00";
        } else {
            return data.toFixed(2);
        }
    } else if (data == 0) {
        return "0.00";
    }
    return "";
}

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function (m, i) {
            return args[i];
        });
}

function convertCurrencyWithDecimal(money) {
    //汉字的数字
    var cnNums = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九');//new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
    //基本单位
    var cnIntRadice = new Array('', '拾', '佰', '仟');
    //对应整数部分扩展单位
    var cnIntUnits = new Array('', '万', '亿', '兆');
    //对应小数部分单位
    var cnDecUnits = new Array('角', '分', '毫', '厘');
    //整数金额时后面跟的字符
    var cnInteger = '整';
    //整型完以后的单位
    var cnIntLast = '元';
    //最大处理的数字
    var maxNum = 999999999999999.9999;
    //金额整数部分
    var integerNum;
    //金额小数部分
    var decimalNum;
    //输出的中文金额字符串
    var chineseStr = '';
    //分离金额后用的数组，预定义
    var parts;
    if (money == '') {
        return '';
    }
    money = parseFloat(money);
    if (money >= maxNum) {
        //超出最大处理数字
        return '';
    }
    if (money == 0) {
        chineseStr = cnNums[0] + cnIntLast + cnInteger;
        return chineseStr;
    }
    //转换为字符串
    money = money.toString();
    if (money.indexOf('.') == -1) {
        integerNum = money;
        decimalNum = '';
    } else {
        parts = money.split('.');
        integerNum = parts[0];
        decimalNum = parts[1].substr(0, 4);
    }
    //获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
        var zeroCount = 0;
        var IntLen = integerNum.length;
        for (var i = 0; i < IntLen; i++) {
            var n = integerNum.substr(i, 1);
            var p = IntLen - i - 1;
            var q = p / 4;
            var m = p % 4;
            if (n == '0') {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0];
                }
                //归零
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }

            if (m == 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q];
            }
        }
        chineseStr += cnIntLast;
    }
    //小数部分
    if (decimalNum != '') {
        var decLen = decimalNum.length;
        for (var i = 0; i < decLen; i++) {
            var n = decimalNum.substr(i, 1);
            if (n != '0') {
                chineseStr += cnNums[Number(n)] + cnDecUnits[i];
            }
        }
    }

    if (chineseStr == '') {
        chineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (decimalNum == '') {
        chineseStr += cnInteger;
    }
    return chineseStr;
}


//数字转大写
function convertCurrency(sum, last) {
    //汉字的数字
    var cnNums = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九');
    //基本单位
    var cnIntRadice = new Array('', '十', '百', '千');
    //对应整数部分扩展单位
    var cnIntUnits = new Array('', '万', '亿', '兆');
    //整型完以后的单位
    var cnIntLast = last == undefined ? '个' : last;
    //最大处理的数字
    var maxNum = 999999999999999;
    //整数部分
    var integerNum;
    //输出的中文字符串
    var chineseStr = '';
    if (!sum) {
        return '零';
    }
    sum = parseFloat(sum);
    if (sum >= maxNum) {
        //超出最大处理数字
        return '';
    }
    if (sum == 0) {
        chineseStr = cnNums[0] + cnIntLast;
        return chineseStr;
    }
    //转换为字符串
    sum = sum.toString();
    integerNum = sum;
    //获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
        var zeroCount = 0;
        var IntLen = integerNum.length;
        for (var i = 0; i < IntLen; i++) {
            var n = integerNum.substr(i, 1);
            var p = IntLen - i - 1;
            var q = p / 4;
            var m = p % 4;
            if (n == '0') {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0];
                }
                //归零
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }
            if (m == 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q];
            }
        }
        chineseStr += cnIntLast;
    }
    return chineseStr;
}

function setHidden(name, value) {
    $("[name='" + name + "']").remove();
    var tpl = "<input type='hidden' name='{0}' value='{1}' />";
    $("form").append(tpl.format(name, value));
}

function setRadio(key, val) {
    $("[name='" + key + "']").each(function (i, item) {
        if ($(item).val() == val) {
            $(item).attr("checked", "checked");
        }
    })
};

// function formatDateTime(timeStamp) {
//     var d = new Date(timeStamp);
//     var dformat = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-')
//         + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
//     return dformat;
// }
// function formatDate(timeStamp) {
//     var d = new Date(timeStamp);
//     var dformat = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');
//     return dformat;
// }

//日期格式化
Date.prototype.Format = function(fmt)
{ //author: meizz
    var o = {
        "M+" : this.getMonth()+1, //月份
        "d+" : this.getDate(), //日
        "h+" : this.getHours(), //小时
        "m+" : this.getMinutes(), //分
        "s+" : this.getSeconds(), //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds() //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

/*const userInfo = window.localStorage.getItem('loginUserInfo')
if (userInfo) {
    var u = JSON.parse(userInfo);
    var token = u.token;
    if(token) {
        $.ajaxSetup({
        	data: {
        		"token" : token
        	}
        });
    }
}*/

