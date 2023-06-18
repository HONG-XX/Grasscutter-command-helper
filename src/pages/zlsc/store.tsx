import React from 'react'
import { observable, action, runInAction } from 'mobx'
// @ts-ignore
import { post, get } from 'Utils/request'
// @ts-ignore
import ApiPath from 'Public/apiPath'
// @ts-ignore
import { CryptoJSTripleDES } from 'Utils/Utils'
const { protocol, hostname, port } = window.location
const origin = `${protocol}//${hostname}${port && `:${port}` || ''}`
class Store {
    decrypt = (str: string) => CryptoJSTripleDES.decrypt(str)
    encrypt = (str: string) => CryptoJSTripleDES.encrypt(str)
    @observable origin = origin
    @observable noticeText = [
        `${this.decrypt('BHlCjF4X+nb3blp5QesvraiUeOL+ZCAW')}${this.origin}${this.decrypt('kn3vE10+wPu75I+NM7fCM2c7AN1uHFT80hVL0LQVDQgHvnyay76abA4/+TxU1M+VQjQ2OOl2orrZw/odWTdAk/rawMo1O8bVk7ko/i3lFvdJG1BAL/y1pElMNJXU4bdFtIw+r6tk8ZWWKEFHurqjbg==')}`,
        this.decrypt('nO28ZKjP1ud3Zs1JdMxSY2YdZN/YLKGtmceDsrWNjpkPDVHKAgkxdKq5mfSet6WJH7YpMy7pA/hu3V5n65ziog8lVhKWHqaj0wnhkU5NeyhcRPTtXUaTRkdHwXHMCEtHQsjxxK2FU4cdiOuRvdYeeT7411hChAM0pP/zhprMJOd1K3aj3ARzgj80uWyCucn7s9pr11JKxUFj5Q2B+X/T4w==')
    ]
    @observable zlxx: any = {}
    @action setZlxx = (v: any): void => {
        this.zlxx = v
    }
    @action.bound getZlxx = async (zhiling: string) => {
        const djm = await this.getJson(`zlparams/${zhiling}`, 'string', 'zl')
        this.setZlxx(JSON.parse(this.decrypt(djm)))
    }
    @action.bound getJson = async (name: string, type:string, wjhz: string) => {
        try {
            const res = await get(`${ApiPath.ZLSC_GET_LIST}${name}.${wjhz}`, {}, {}, type)
            if (res.data) {
                return res.data
            }
        } catch {
            console.log('请求失败')
            return []
        }
    }
    @observable zlData: any = []
    @action setZlData = (v: any): void => {
        this.zlData = v
    }
    /**
     * 指令查询
     */
    @action.bound getZlData = async () => {
        try {
            const res = await get(`${ApiPath.ZLSC_GET_LIST}zhilingList.json`, {})
            runInAction(() => {
                this.setZlData(res.data || [])
            })
        } catch (e) {
            this.setZlData([])
        }
    }
    /*
    * 远程指令发送
    * */
    @action.bound sendOpencommand = async (params: any, fwurl: string) => {
        try {
            const res = await post('/opencommand/api', params, {
                reqip: fwurl
            })
            return res.data.data || '执行失败'
        } catch (e) {
            return '执行失败';
        }
    }
}
export default new Store()
