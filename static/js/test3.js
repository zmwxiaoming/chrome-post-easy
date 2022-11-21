function run(argv) {
    var trackNum = argv[0];
    var channelsNum = argv[1];
    var result = des_decrypt(trackNum, stringToHex(channelsNum));
    console.log(result);
    console.log(parseInt(result, 16).toString(10));
    return result;
}

// pc置换表1 将64位密钥置换成56位
let pc_table_1 = [
    57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];

// pc置换表2 将56位子密钥置换成48位
let pc_table_2 = [
    14, 17, 11, 24, 1, 5,
    3, 28, 15, 6, 21, 10,
    23, 19, 12, 4, 26, 8,
    16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32
];

// ip置换表
let ip_table = [
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7
];

// 将32位映射为48位表
let e_table = [
    32, 1, 2, 3, 4, 5,
    4, 5, 6, 7, 8, 9,
    8, 9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17,
    16, 17, 18, 19, 20, 21,
    20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29,
    28, 29, 30, 31, 32, 1
];

// 8个S盒
let s_tables = [
    [
        14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
        0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
        4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
        15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13
    ],
    [
        15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
        3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
        0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
        13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 10, 5, 14, 9
    ],
    [
        10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
        13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
        13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
        1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12
    ],
    [
        7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
        13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
        10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
        3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14
    ],
    [
        2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
        14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
        4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
        11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3
    ],
    [
        12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
        10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
        9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
        4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13
    ],
    [
        4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
        13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
        1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
        6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12
    ],
    [
        13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
        1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
        7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
        2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11
    ]
]

// p表
let p_table = [
    16, 7, 20, 21, 29, 12, 28, 17,
    1, 15, 23, 26, 5, 18, 31, 10,
    2, 8, 24, 14, 32, 27, 3, 9,
    19, 13, 30, 6, 22, 11, 4, 25
];

// ip逆置换表
let ip_inverse_table = [
    40, 8, 48, 16, 56, 24, 64, 32,
    39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41, 9, 49, 17, 57, 25,
];

// 计算子密钥的旋转次数
let rotations = [
    1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1,
];

/**
 * 密钥pc置换，将64位密钥通过ip表转化为56位
 * @param key 指定的密钥，只会读取其中64位
 * @returns {string|null} 为null时返回null，其它时候返回56位数据
 */
let pc_substitution = (key) => {
    if (key == null) {
        return null;
    }
    let result = "";
    for (let i in pc_table_1) {
        result += key.charAt(pc_table_1[i] - 1);
    }
    return result;
}

/**
 * 获取子密钥表
 * @param compressedKey 56位压缩密钥
 * @returns {null|[]} 16个56位子密钥数组
 */
let sub_key_table = (compressedKey) => {
    if (compressedKey == null) {
        return null;
    }
    let C_temp = compressedKey.substr(0, 28);
    let D_temp = compressedKey.substr(28, 28);
    let result = [];
    for (let i = 0; i < rotations.length; i++) {
        C_temp = left_move(C_temp, rotations[i]);
        D_temp = left_move(D_temp, rotations[i]);
        result.push(C_temp + D_temp + '\n');
    }
    return result;
}

/**
 * 获取被压缩后的子密钥表
 * 将16个56位子密钥压缩成48位子密钥
 * @param sub_table 16位子密钥表
 * @returns {null|[]} 16位48位子密钥数组
 */
let sub_key_table_compress = (sub_table) => {
    if (sub_table == null) {
        return null;
    }
    let result = [];
    for (let i = 0; i < sub_table.length; i++) {
        let temp = "";
        // pc2置换
        for (let j in pc_table_2) {
            temp += String(sub_table[i]).charAt(pc_table_2[j] - 1);
        }
        result.push(temp + '\n');
    }
    return result;
}

/**
 * e盒置换
 * @param text
 * @returns {string}
 */
let e = (text) => {
    if (text.length !== 32) {
        throw new Error("e函数的参数长度不为32位")
    }
    let result = "";
    for (let i in e_table) {
        result += text.charAt(e_table[i] - 1);
    }
    return result;
}

// 手动异或函数
let xor = (x, y) => {
    let result = "";
    for (let i = 0; i < x.length; i++) {
        if (String(x).charAt(i) === String(y).charAt(i)) {
            result += "0";
        } else {
            result += "1";
        }
    }
    return result;
}

// 将text按number位数切割成一个数组
let division = (text, number) => {
    let result = [];
    let temp = "";
    for (let i = 0; i < text.length; i++) {
        if (i !== 0 && i % number === 0) {
            result.push(temp);
            temp = "";
        }
        temp += text[i];
    }
    result.push(temp);
    return result;
}

/*
* 将48位的text分成8个6位的数，
* 然后将每个6位数的第一位和第六位组成S盒的行数，
* 中间四位组成S盒的列数，
* 然后获取到一个四位的数，
* 最后组合8个S盒的数，并通过p置换返回一个32位的文本
*
* */
let s = (text) => {
    let table = division(text, 6);
    let result = "";
    for (let i = 0; i < s_tables.length; i++) {
        let row = table[i].charAt(0) + table[i].charAt(5);
        let column = table[i].substr(1, 4);
        row = parseInt(row, 2);
        column = parseInt(column, 2);
        let temp = s_tables[i][row * 16 + column];
        temp = decimal_to_binary(temp);
        result += temp;
    }
    let p_temp = "";
    for (let i in p_table) {
        p_temp += result.charAt(p_table[i] - 1);
    }
    return p_temp;
}

// f轮函数
let f = (R, K) => {
    let E_R = e(R);
    let temp = xor(E_R, K);
    // 进行s盒替换
    return s(temp);
}

// 明文ip置换
let ip_substitution = (text) => {
    if (text == null) {
        return null;
    }
    let result = "";
    for (let i in ip_table) {
        result += text.charAt(ip_table[i] - 1);
    }
    return result;
}

// ip逆置换
let ip_inverse_substitution = (text) => {
    if (text == null) {
        return null;
    }
    let result = "";
    for (let i in ip_inverse_table) {
        result += text.charAt(ip_inverse_table[i] - 1);
    }
    return result;
}

/**
 * des通过明文和密钥加密
 * 明文 密钥都为64位
 *
 * 加密流程：
 * 密钥部分
 * 1、将64位密钥通过pc1置换成56位密钥
 * 2、用56位密钥移位生成16个56位子密钥
 * 3、将16个56位子密钥通过pc2置换成16个48位子密钥，等待加密时使用（K1,K2,K3...）
 *
 * 加密部分
 * 1、将64位明文进行ip置换
 * 2、截取前32位为L0, 后32位为R0
 * 3、进行轮运算
 *    第一轮
 *      L1 = R0
 *      R1 = L0 ^ f(R0, K1)
 *    第二轮
 *      L2 = R1
 *      R2 = L1 ^ f(R1, K2)
 *    ...
 *    f为 f(R, K)
 *      {
 *        let E_R = e(R);
 *        let temp = xor(E_R, K);
 *        return s(temp);
 *      }
 *      首先将32位的R扩展成48位，
 *      然后将48位的R和48位K进行异或，
 *      最后进行S盒替换，变成32位的文本。
 *    f为 S(text)
 *      首先将48位的text分割成8个6位的数，
 *      然后每个6位的数对应一个S盒，
 *      将6位数的第一位和第六位组成行号，中间四位组成列号，置换成相应S盒的数，
 *      然后按S0S1S2...变成32的文本输出
 * 4、将16轮变化后的L16,R16变成R16L16
 * 5、对R16L16进行ip逆置换
 * */
let des_encrypt = (text, key) => {
    if (text === null || key === null) {
        return "文本或密钥为空";
    }
    // 十六进制文本，故64位时长度为16
    if (text.length < 16 || key.length < 16) {
        return "长度不足64位"
    }
    let binaryKey = to_4binary(key);
    // 压缩64位密钥到56位
    let compressedKey = pc_substitution(binaryKey);
    // 生成16个56位子密钥
    let subKeyTable = sub_key_table(compressedKey);
    // 通过pc2置换生成16个48位子密钥
    let subKeyCompressTable = sub_key_table_compress(subKeyTable);
    let binaryText = to_4binary(text);
    // ip置换后的明文
    let ipText = ip_substitution(binaryText);
    let L0 = ipText.substr(0, 32);
    let R0 = ipText.substr(32, 32);
    // 16轮子密钥变化
    for (let i = 0; i < subKeyCompressTable.length; i++) {
        let K = subKeyCompressTable[i];
        let temp = L0;
        L0 = R0;
        let F = f(R0, K);
        R0 = xor(temp, F);
    }
    // 16轮加密后的结果倒过来
    let R0L0 = R0 + L0;
    let result = ip_inverse_substitution(R0L0);
    return binary_to_hex(result);
}

/**
 * DES解密算法，直接将16个子密钥的调用位置调转即可
 * */
let des_decrypt = (cipher, key) => {
    if (cipher === null || key === null) {
        return "长度不足64位"
    }
    // 十六进制文本，故64位时长度为16
    // if (cipher.length < 16 || key.length < 16) {
    //     return "长度不足64位"
    // }
    let binaryKey = to_4binary(key);
    // 压缩64位密钥到56位
    let compressedKey = pc_substitution(binaryKey);
    // 生成16个56位子密钥
    let subKeyTable = sub_key_table(compressedKey);
    // pc2压缩密钥
    let subKeyCompressTable = sub_key_table_compress(subKeyTable);
    let binaryText = to_4binary(cipher);
    // ip置换后的明文
    let ipText = ip_substitution(binaryText);
    let L0 = ipText.substr(0, 32);
    let R0 = ipText.substr(32, 32);
    // 16轮子密钥变化
    for (let i = 0; i < subKeyCompressTable.length; i++) {
        let K = subKeyCompressTable[15 - i];
        let temp = L0;
        L0 = R0;
        let F = f(R0, K);
        R0 = xor(temp, F);
    }
    // 16轮加密后的结果倒过来
    let R0L0 = R0 + L0;
    let result = ip_inverse_substitution(R0L0);
    return binary_to_hex(result);
}

// 左移
let left_move = (text, number) => {
    if (text == null) {
        return null;
    }
    let result = "";
    for (let i = number; i < text.length; i++) {
        result += text.charAt(i);
    }
    for (let i = 0; i < number; i++) {
        result += text.charAt(i);
    }
    return result;
}

// 将字符串转化为ASCII
let to_8binary = (text) => {
    if (text == null) {
        return null;
    }
    let binary = "";
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i);
        if (charCode > 255) {
            throw new SyntaxError;
        }
        binary += charCode.toString(2).padStart(8, '0');
    }
    return binary;
}

// 将字符串转化为4位二进制格式,比如to_4binary(13)=00010011
let to_4binary = (text) => {
    if (text == null) {
        return null;
    }
    let binary = "";
    for (let i = 0; i < text.length; i++) {
        let charCode = parseInt(text.charAt(i), 16).toString(2);
        binary += charCode.padStart(4, '0');
    }
    return binary;
}

/**
 * 将二进制字符串转成16进制
 * @param bin
 * @returns {string}
 */
let bin_to_hex = (bin) => {
    return parseInt(bin, 2).toString(16);
}

// 将10进制换成4位二进制
let decimal_to_binary = (hex) => {
    let charCode = parseInt(hex, 10).toString(2);
    return charCode.padStart(4, '0');
}

let binary_to_hex = (binary) => {
    let result = "";
    for (let i = 0; i < binary.length; i += 4) {
        result += parseInt(binary.substr(i, 4), 2).toString(16);
    }
    return result;
}

/**
 * 二进制异或
 * @param x 二进制输入X
 * @param y 二进制输入Y
 * @returns {string}
 */
let xor_bin = (x, y) => {
    let result = "";
    for (let i = 0; i < x.length; i++) {
        if (String(x).charAt(i) === String(y).charAt(i)) {
            result += "0";
        } else {
            result += "1";
        }
    }
    return result;
}

/**
 * 两位16进制进行异或
 * @param hexA 两位16进制字符串A
 * @param hexB 两位16进制字符串B
 * @returns {string}
 */
let xor_hex = (hexA, hexB) => {
    let result = "";
    // 先将16进制字符串转换成二进制
    let binaryA = to_4binary(hexA);
    let binaryB = to_4binary(hexB);
    // 对二进制进行异或
    result = xor_bin(binaryA, binaryB);
    // 将异或结果转成16进制
    return bin_to_hex(result).padStart(2, '0');
}

/**
 * 多位16进制进行异或计算
 * @param hexA
 * @param hexB
 * @returns {string}
 */
let xor_hex_fill = (hexA, hexB) => {
    let len = hexA.length > hexB.length ? hexA.length : hexB.length;
    let result = '';
    for (let i = 0; i < len; i += 2) {
        result += xor_hex(hexA.substr(i, 2), hexB.substr(i, 2));
    }
    return result;
}

function stringToHex(str) {
    var val = "";
    for (var i = 0; i < str.length; i++) {
        if (val == "")
            val = str.charCodeAt(i).toString(16);
        else
            val += "," + str.charCodeAt(i).toString(16);
    }
    return val;
}