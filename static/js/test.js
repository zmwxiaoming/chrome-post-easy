// ==UserScript==
// @name         订单跳转到客服详情页-load
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       zhaomingwei
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js
// @match        http://inside-open-admin.01zhuanche.com/order/mapping/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=01zhuanche.com
// @grant        none
// ==/UserScript==
let detail_link = 'http://inside-zcads.01zhuanche.com/manage/orderNew/view/'
let order_url = 'http://inside-order-center.01zhuanche.com/order/getOrderInfo'
window.addEventListener('load', async function () {
    let lastChildNodes = document.getElementsByClassName("table table-striped jambo_table bulk_action")[1].lastElementChild.childNodes
    let trNodes;
    for (let itemNode of lastChildNodes) {
        if (itemNode.tagName == 'TR') {
            trNodes = itemNode;
            break;
        }
    }
    if (trNodes) {
        let thNodes = trNodes.childNodes;
        let originOrderNo = '';
        let originLink = '';
        let index = 0;
        for (let th of thNodes) {
            if (th.tagName == 'TH') {
                index++;
                if (index == 1) {
                    continue;
                }
                let orderNo = th.innerText.trim();
                if (originOrderNo == orderNo) {
                    th.innerHTML = '<a target="_blank" url="' + originLink + '">' + orderNo + '</a>'
                } else {
                    originOrderNo = orderNo;
                    let link = detail_link + '' + queryOrderId(orderNo);
                    originLink = link;
                    th.innerHTML = '<a target="_blank" url="' + link + '">' + orderNo + '</a>'
                }
                if (index >= 3) {
                    break;
                }
            }
        }
    }

});


function queryOrderId(orderNo) {
    let request = new XMLHttpRequest();
    request.open("POST", order_url, false);
    request.onreadystatechange = function () {
        if (request.readyState !== 4) return;
        if (request.status === 200) {
            return JSON.parse(request.responseText)['data']['orderId'];
        }
    }
    let formData = new FormData();
    formData.append('bId', '14');
    formData.append('orderNo', orderNo);
    formData.append('columns', 'order_id');
    formData.append('sign', getSign(orderNo));
    console.log('formadata:' + JSON.stringify(formData))
    request.send(formData);
}
const appkey = '96f47f1c2fd244b5806014f8847f5902'; // 自动化测试的key，根据接口需求修改
function getSign(orderNo) {
    let requestBody = 'bId=14&columns=order_id&orderNo=' + orderNo + '&key=' + appkey
    //生成密钥
    let md5 = CryptoJS.MD5(requestBody, appkey);
    var base64md5 = CryptoJS.enc.Base64.stringify(md5);
    console.log(base64md5);
    return base64md5;
}