import { Toast } from 'antd-mobile'
import moment from 'moment'
// @ts-ignore
import md5 from 'md5'
// @ts-ignore
import CryptoJS from 'crypto-js'

export const showLoading = (val: string) => {
    Toast.show({
        content: val || '加载中...',
        icon: 'loading',
        maskClickable: false,
        duration: 0
    })
}
// md5加密
export function getLower32SignMD5String(sign: string) {
    return md5(sign)
}
// 加密 秘钥
let keyHex = CryptoJS.enc.Utf8.parse("1326270696@lx100$#365#$") // 秘钥
let iv = CryptoJS.enc.Utf8.parse('648541') // 密钥偏移量
export const CryptoJSTripleDES = {
    encrypt: (password: string) => {
        let encrypted = CryptoJS.TripleDES.encrypt(password, keyHex, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
        // 加密end
    },
    decrypt: (password: string) => {
        let encrypted = CryptoJS.TripleDES.decrypt(password, keyHex, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString(CryptoJS.enc.Utf8);
        // 解密end
    }
}
