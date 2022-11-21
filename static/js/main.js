$("#doSend").bind("click", doSend);
$("#doParse").bind("click", setFormDataFromLinkParams);
$("#addRow").bind("click", addRow);
$("#clearRow").bind("click", clearRow);
$("#doSign").bind("click", doSign);
$("#all_sign_check").bind("click", all_sign_check);
$("#all_params_check").bind("click", all_params_check);
$("#doDesEnc").bind("click", doDesEnc);
$("#doDesDec").bind("click", doDesDec);
var paramsTr = `<tr>
                    <th scope="row"> <input class="form-check-input"  name="paramCheck" type="checkbox" value="" id="check_{random_1}" checked="checked" > </th>
                    <td><input type="text" name="paramKey" style="width: 80%;" class="form-control-no" value='{key}'></td>
                    <td><input type="text" name="paramValue" style="width: 80%;" class="form-control-no" value='{value}'></td>
                    <td><input class="form-check-input" type="checkbox" name="signCheck" value="" id="check_{random_2}" checked="checked"></td>
                    <td><button class="btn btn-outline-primary" type="button" id="addRow_{random_1}">+</button>
                        <button class="btn btn-outline-warning" type="button" id="delRow_{random_2}">-</button></td>
                </tr>`
function all_sign_check() {
    if ($(this).is(":checked") == true) {
        let inputCheckBox = $("input:checkbox[name=signCheck]")
        for (input of inputCheckBox) {
            $(input).attr("checked", true)
        }
    } else {
        let inputCheckBox = $("input:checkbox[name=signCheck]")
        for (input of inputCheckBox) {
            $(input).removeAttr("checked")
        }

    }
}

function all_params_check() {
    if ($(this).is(":checked") == true) {
        let inputCheckBox = $("input:checkbox[name=paramCheck]")
        for (input of inputCheckBox) {
            $(input).attr("checked", true)
        }
    } else {
        let inputCheckBox = $("input:checkbox[name=paramCheck]")
        for (input of inputCheckBox) {
            $(input).removeAttr("checked")
        }

    }
}
function checkBoxClick() {
    console.log($(this).is(":checked"));
    if ($(this).is(":checked") == true) {
        $(this).attr("checked", true)
    } else {
        $(this).removeAttr("checked")
    }
}

function setFormDataFromLinkParams() {
    let argsLink = $("#argsLink input").val();
    let params_type = $("#params_type").find("input[name='params_type']:checked").val();

    if (argsLink && argsLink != '') {
        if (params_type == "params_list") {
            let args = argsLink.split("&");
            for (let i = 0; i < args.length; i++) {
                const kvParam = args[i];
                let eqIndex = kvParam.indexOf("=");
                let newParamsTr = paramsTr.replaceAll("{key}", kvParam.substring(0, eqIndex));
                newParamsTr = newParamsTr.replaceAll("{value}", kvParam.substring(eqIndex + 1, kvParam.length));
                let num1 = getUUID();
                let num2 = getUUID();
                newParamsTr = newParamsTr.replaceAll("{random_1}", num1);
                newParamsTr = newParamsTr.replaceAll("{random_2}", num2);
                $("#paramsList table tbody").append(newParamsTr)
                $("#addRow_" + num1).bind("click", addRow);
                $("#delRow_" + num2).bind("click", delRow);
                $("#check_" + num1).bind("click", checkBoxClick);
                $("#check_" + num2).bind("click", checkBoxClick);
            }
        } else if (params_type == "params_json") {
            let args = JSON.parse(argsLink);
            for (key in args) {
                let newParamsTr = paramsTr.replaceAll("{key}", key);
                let value = args[key];
                if (typeof (value) == 'object') {
                    // console.log(value)
                    console.log(JSON.stringify(value))
                    newParamsTr = newParamsTr.replaceAll("{value}", JSON.stringify(value));
                } else {
                    newParamsTr = newParamsTr.replaceAll("{value}", value);
                }
                let num1 = getUUID();
                let num2 = getUUID();
                newParamsTr = newParamsTr.replaceAll("{random_1}", num1);
                newParamsTr = newParamsTr.replaceAll("{random_2}", num2);
                $("#paramsList table tbody").append(newParamsTr)
                $("#addRow_" + num1).bind("click", addRow);
                $("#delRow_" + num2).bind("click", delRow);
                $("#check_" + num1).bind("click", checkBoxClick);
                $("#check_" + num2).bind("click", checkBoxClick);

            }
        }

    }
}

function delRow() {
    $($(this).closest("tr")).remove()
}

function getUUID() {
    return Math.random().toString(36).substring(3, 10);
}

function addRow() {
    var newParamsTr = paramsTr.replaceAll("{key}", "");
    newParamsTr = newParamsTr.replaceAll("{value}", "");
    let num1 = getUUID();
    let num2 = getUUID();
    newParamsTr = newParamsTr.replaceAll("{random_1}", num1);
    newParamsTr = newParamsTr.replaceAll("{random_2}", num2);
    $("#paramsList table tbody").append(newParamsTr)
    $("#addRow_" + num1).bind("click", addRow);
    $("#delRow_" + num2).bind("click", delRow);
}
function clearRow() {
    $("#paramsList table tbody").children().remove();
}

function getData() {
    let data = {};
    let tableTrs = $("#paramsList tr");
    for (let i = 0; i < tableTrs.length; i++) {
        const tr = tableTrs[i];
        if ($(tr).find("input[name='paramCheck']:checked")[0] != undefined) {
            let key = $(tr).find("input[name='paramKey']").val();
            let value = $(tr).find("input[name='paramValue']").val();
            if (key && key != '') {
                data[key] = value;
            }
        }
    }
    return data;
}
function getSignParamsData() {
    let data = {};
    let tableTrs = $("#paramsList tr");
    for (let i = 0; i < tableTrs.length; i++) {
        const tr = tableTrs[i];
        if ($(tr).find("input:checkbox[name=signCheck]:checked")[0] != undefined) {
            let key = $(tr).find("input[name='paramKey']").val();
            let value = $(tr).find("input[name='paramValue']").val();
            if (key && key != '') {
                data[key] = value;
            }
        }
    }
    return data;
}
function doSend() {
    let url = $("#requestUrl").val();
    if (!url || url == '') {
        alert("请求地址为空!");
        return;
    }

    let configData = new Object();
    let contentType = $("input[name='contentType']:checked").val();
    let signType = $("input[name='sign_radio']:checked").val();
    let method = $("#doMethod").find("option:selected").val();
    let data = getData();
    if (method == "POST") {
        doPost(url, contentType, data);
    } else {
        doGet(url, contentType, data);
    }

}
function doPost(url, contentType, data) {
    if (contentType == "application/json") {
        let keys = Object.keys(data);
        let requestBody = {};
        for (let key of keys) {
            try {
                requestBody[key] = JSON.parse(data[key]);
            } catch {
                requestBody[key] = data[key];
            }
        }
        data = JSON.stringify(requestBody);
    }
    return $.ajax({
        type: "POST",   //请求方式
        url: url,    //请求的url地址
        async: false, //请求是否异步，默认为异步
        contentType: contentType,
        data: data,//发送到服务器的参数
        dataType: "json",   //服务器返回的值类型
        beforeSend: function () {
            //请求前的处理
        },
        success: function (data) {
            //请求成功时处理
            console.log(data);
            return $("#jsonResult").val(JSON.stringify(data));
        },
        complete: function () {
            //请求完成的处理
        },
        error: function (data) {
            //请求出错处理
            console.log(data);
            return $("#jsonResult").val(data.responseText);
        }
    });
}

function doGet(url, contentType, data) {
    return $.ajax({
        type: "GET",   //请求方式
        url: url,    //请求的url地址
        async: false, //请求是否异步，默认为异步
        contentType: contentType,
        data: data,//发送到服务器的参数
        crossDomain: true,
        dataType: "json",   //服务器返回的值类型
        beforeSend: function () {
            //请求前的处理
        },
        success: function (data) {
            //请求成功时处理
            console.log(data);
            return $("#jsonResult").val(JSON.stringify(data));
        },
        complete: function () {
            //请求完成的处理
        },
        error: function (data) {
            //请求出错处理
            console.log(data);
            return $("#jsonResult").val(data.responseText);
        }
    });

}

function doSign() {
    let preSignParams = "";
    let data = getSignParamsData();
    //构造数据为 key=param&key=param....字符串
    let keys = Object.keys(data);
    keys.sort();
    for (var index in keys) {
        if (keys[index] == "sign") {
            continue;
        }

        preSignParams += keys[index] + "=" + data[keys[index]] + "&";
    }

    preSignParams = preSignParams.substring(0, preSignParams.length - 1);
    let signKey = $("#sign_key").val();
    let signKeyValue = $("#sign_key_value").val();
    if (signKey) {
        preSignParams += "&" + signKey + "=" + signKeyValue;
    }
    //生成密钥
    var md5 = CryptoJS.MD5(preSignParams);
    $("#sign_params_link").val(preSignParams);
    $("#sign_result").val(md5);
}


//DES加密
function encryptByDES(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return 'T'+encrypted.ciphertext.toString().toUpperCase();
  }
  
  //DES解密
  function decryptByDES(ciphertext, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var decrypted = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertext)
    }, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }


function doDesEnc() {
    let desEncText = $("#des_text").val();
    let desEncKey = $("#des_key").val();
    //生成密钥
    let result = encryptByDES(desEncText,desEncKey);
    console.log(result)
    $("#des_enc_value").val(result);
}

function doDesDec() {
    let desEncText = $("#des_text_value").val();
    let desEncKey = $("#des_key_channel").val();
    console.log(desEncText)
    console.log(desEncKey)
    //生成密钥
    let result = decryptByDES(desEncText,desEncKey);
    console.log(result)
    $("#des_dec_value").val(result);
}

  
  