import React, { useState, useEffect, useCallback } from 'react'
// @ts-ignore
import XModal from 'Components/XModal'
// @ts-ignore
import { post, get } from 'Utils/request'
import {
    Card,
    Input,
    List,
    Toast,
    Button
} from 'antd-mobile'
import { RedoOutline, UserOutline, GlobalOutline, CalendarOutline } from 'antd-mobile-icons'

interface propsType {
    visible: boolean|undefined
    updateFwxx: Function
    close: Function
    fwxx: any
}

const Style: any = {
    Card: {
        position: 'relation',
        margin: '10px 1em'
    },
    Card2: {
        position: 'relation',
        marginTop: '10px',
        margin: '10px 1em'
    },
    reload: {
        position: 'absolute',
        top: '0.5em',
        right: '0.5em',
    },
    ListItem: {
        color: 'green'
    }
}
let fwsetTime: any
const initfwxx = {
    playerCount: undefined,
    maxPlayer: undefined,
    version: undefined,
    opencommand: '未知',
    UID: '',
    token: ''
}

export default function RC(props: propsType) {

    const [fwurl, setFwurl] = useState('')
    const [yzm, setYzm] = useState('')
    const [fwqxx, setFwqxx] = useState(initfwxx)
    const [sffsyzm, setSffsyzm] = useState(false)
    const getfwxx = (url: string) => {
        try {
            if (!url || !/^((http:\/\/)|(https:\/\/)).+$/.test(url)) {
                setFwqxx(initfwxx)
                return
            }
            Toast.show({
                content: '加载中',
                icon: 'loading',
                duration: 0
            })
            get(`/status/server`, {}, {
                reqip: url
            }).then((res: any) => {
                if (res.data.retcode === 0) {
                    const { playerCount, version } = res.data.status
                    const fwxx: any = {
                        ...fwqxx,
                        version,
                        playerCount
                    }

                    post('/opencommand/api', {
                        token: '',
                        action: 'ping',
                        data: null
                    }, {
                        reqip: url
                    }).then((res: any) => {
                        fwxx.opencommand = res.data.retcode === 200 ? '支持' : '不支持'
                        setFwqxx(fwxx)
                        Toast.show({
                            icon: fwxx.opencommand === '支持' ? 'success' : 'fail',
                            content: fwxx.opencommand === '支持' ? '请输入UID完成后续验证' : '你输入的服务器不支持'
                        })
                    }).catch((err: any) => {
                        console.error(err)
                        fwxx.opencommand = '不支持'
                        setFwqxx(fwxx)
                        Toast.show({
                            icon: 'fail',
                            content: '你输入的服务器不支持'
                        })
                    })
                }
            }).catch((err: any) => {
                console.error(err)
                setFwqxx(initfwxx)
                Toast.clear()
            })

        } catch (e) {
            console.error(e)
            setFwqxx(initfwxx)
        }
    }
    useEffect(() => {
        const { fwurl, UID } = props.fwxx || {}
        UID && setFwqxx({ ...fwqxx, UID })
        fwurl && setFwurl(fwurl)
    }, [])
    useEffect(() => {
        fwsetTime = setTimeout(() => {
            getfwxx(fwurl)
        }, 1500)
        return () => { fwsetTime && clearTimeout(fwsetTime); fwsetTime && (fwsetTime = undefined) }
    }, [fwurl])
    const yzmfs = () => {
        // if (fwqxx.UID) {
        //     Toast.show({
        //         icon: 'fail',
        //         content: '功能暂未开放,敬请期待'
        //     })
        //     return
        // }
        if (!fwqxx.UID) {
            Toast.show({
                icon: 'fail',
                content: '请输入UID'
            })
            return
        }
        Toast.show({
            content: '发送中',
            icon: 'loading',
            duration: 0
        })
        post('/opencommand/api', {
            token: '',
            action: 'sendCode',
            data: Number.parseInt(fwqxx.UID)
        }, {
            reqip: fwurl
        }).then((res: any) => {
            Toast.clear()
            if (res.data.retcode === 200) {
                setSffsyzm(true)
                Toast.show({
                    icon: 'success',
                    content: '发送成功,请在游戏聊天框查看验证码'
                })
                const fwxx: any = {
                    ...fwqxx,
                    token: res.data.data
                }
                setFwqxx(fwxx)
            } else {
                Toast.show({
                    icon: 'fail',
                    content: `发送失败:${res.data.message}`
                })
            }
        }).catch((err: any) => {
            console.error(err)
            Toast.show({
                icon: 'fail',
                content: '发送失败'
            })
        })
    }
    const yzmyz = () => {
        if (!yzm) {
            Toast.show({
                icon: 'fail',
                content: '请输入验证码'
            })
            return
        }
        Toast.show({
            content: '验证中',
            icon: 'loading',
            duration: 0
        })
        post('/opencommand/api', {
            token: fwqxx.token || '',
            action: 'verify',
            data: Number.parseInt(yzm)
        }, {
            reqip: fwurl
        }).then((res: any) => {
            Toast.clear()
            if (res.data.retcode === 200) {
                Toast.show({
                    icon: 'success',
                    content: '验证成功,现在你可以在生成指令时直接执行了'
                })
                props.updateFwxx({ ...fwqxx, fwurl })
                props.close()
            } else {
                Toast.show({
                    icon: 'fail',
                    content: `验证失败:${res.data.message}`
                })
            }
        }).catch((err: any) => {
            console.error(err)
            Toast.show({
                icon: 'fail',
                content: '验证失败'
            })
        })
    }
    return (
        <XModal
            showNavBar
            title={'远程指令'}
            style={{ background: '#eee', padding: 0 }}
            navBarConfig={{
                onBack: props.close,
                style: {
                    background: '#fff'
                }
            }}
            visible={props.visible}
        >
            <Card
                style={Style.Card}
                extra={<RedoOutline
                    onClick={() => getfwxx(fwurl)}
                    style={Style.reload}
                />}
                title={<Input
                    placeholder='请输入服务器地址'
                    value={fwurl}
                    onChange={(val) => setFwurl(val)}
                />}>
                <List>
                    <List.Item
                        prefix={<><UserOutline color={'aqua'} />在线人数：</>}
                        extra={<span style={Style.ListItem}>{fwqxx.playerCount}</span>}
                    />
                    <List.Item
                        prefix={<><CalendarOutline color={'mediumorchid'} />版本：</>}
                        extra={<span style={Style.ListItem}>{fwqxx.version}</span>}
                    />
                    <List.Item
                        prefix={<><GlobalOutline color={'burlywood'} />远程插件：</>}
                        extra={<span style={Style.ListItem}>{fwqxx.opencommand}</span>}
                    />
                </List>
            </Card>
            {fwqxx.opencommand === '支持' && <Card
                style={Style.Card2}
                title={<Input
                    placeholder='请输入游戏右下角所显示UID'
                    value={fwqxx.UID}
                    onChange={(val) => setFwqxx({
                        ...fwqxx,
                        UID: val && val.replace(/[^\d]/g, '')
                    })}
                />}>
                <List>
                    <List.Item
                        prefix={<><UserOutline color={'aqua'} /></>}
                        extra={<Button color='primary' onClick={yzmfs}>发送</Button>}
                    >
                      <Input
                        value={yzm}
                        onChange={(val) => setYzm(val)}
                        disabled={!sffsyzm}
                        placeholder={sffsyzm ? '请输入验证码' : '请先发送验证码'}/>
                    </List.Item>
                </List>
              <br/>
              <Button style={{ width: '100%' }} onClick={yzmyz} color='primary'>验证</Button>
            </Card>}
        </XModal>
    )
}
