import React, {ReactElement} from 'react'
import {
    Button,
    SearchBar,
    Form,
    Input,
    List,
    InfiniteScroll,
    Toast,
    NavBar,
    Dialog,
    Popover,
    Selector,
    CapsuleTabs,
    // NumberKeyboard,
    Divider,
    CheckList,
    Switch,
    NoticeBar,
    Stepper, WaterMark,
} from 'antd-mobile'
// @ts-ignore
import SelectZl from 'Components/select/SelectZl'
// @ts-ignore
import copy from 'copy-to-clipboard'
// @ts-ignore
import { showLoading } from 'Utils/Utils'
import { DownOutline, SetOutline, UserAddOutline, LinkOutline } from 'antd-mobile-icons'
// @ts-ignore
import XModal from 'Components/XModal'
import Store from './store'
import './zlsc.less'

const title = '00a581c8acfe97f93899634ea8664120'
const Item = Form.Item
interface itemParams {
    v: string
    l: string
}

class Zlsc extends React.Component<any, any> {
    formRef: React.RefObject<any>
    ysJson: any = {}
    ZlscRC: any
    constructor(props: any) {
        super(props)
        let fwxx = {}
        try {
            if (window.localStorage) {
                const storage = window.localStorage
                fwxx = JSON.parse(storage.getItem("fwxx") as string) || {}
            }
        } catch (e) {
            fwxx = {}
        }
        this.state = {
            bunStyle: {
                div: {},
                btn: {}
            }, // 提交按钮样式
            sjxzVisible: '', // 数据选择页是否显示
            zlData: [], // 指令列表
            searchVal: {}, // 查询筛选Val
            zlxzVisible: '', // 指令选择是否显示
            kqdz: {}, // 考勤地址信息
            zlxx: <>未选择指令</>,
            // numberKeyVisible: false, // 打开数字键盘
            showData: [], // 筛选框显示的内容
            showDataType: '', // 筛选框显示的类型
            showDataLoad: {
                page: 1,
                size: 100,
                hasMore: true,
            },
            tabsKey: '',
            fwxx,// 远程指令的信息
            yczlVisible: false,// 远程指令是否弹出
            isNultiple: false, // 是否多选
            nowMultipleData: [],// 多选列表当前选择内容
        }
        this.formRef = React.createRef()
        console.log(this.props.titlemd5)
    }
    async componentDidMount() {
        this.showLoading('加载中')
        await this.loadZl()
        if (this.state.kqdz.v) {
            this.getZlxx(this.state.kqdz.b || this.state.kqdz.v)
        }
        Toast.clear()
    }
    /**
     * 获取指令信息
     */
    getZlxx = async (zhiling: string) => {
        await Store.getZlxx(zhiling)
        let zlxx: React.ReactElement
        if (Store.zlxx && Store.zlxx.length > 0) {
            this.setState({
                tabsKey: Store.zlxx[0].key
            })
            zlxx = Store.zlxx.length > 1 ? <CapsuleTabs
                onChange={(e: any) => {
                    // this.numberKeyChange('close')
                    this.setState({
                        tabsKey: e
                    })
                }}
                >
                {Store.zlxx.map((item: any) => {
                    return <CapsuleTabs.Tab title={item.mc} key={item.key}>
                        {this.getZlxxParam(item.params)}
                    </CapsuleTabs.Tab>
                })}
            </CapsuleTabs> : this.getZlxxParam(Store.zlxx[0].params)
        } else {
            zlxx = <p style={{ textAlign: 'center' }}>此命令无参数</p>
        }
        this.setState({
            zlxx
        })
    }
    getJson = async (key: string) => {
        this.showLoading()
        const res = await Store.getJson(key, 'string', 'json')
        Toast.clear()
        return res
    }
    fwvalidator = (v: any, val: any, param: any) => {
        return new Promise(((resolve, reject) => {
            if (!val) {
                resolve(null)
            }
            if (param.max && param.max < val) {
                reject('超过最大限制')
            }
            if (param.min && param.min > val) {
                reject('低于最小限制')
            }
            resolve(null)
        }))
    }
    getZlxxParam = (params: any) => {
        return <>{params.map((item: any, index: number) => {
            let JSXDOM: any = <Input/>
            let click: Function|undefined
            switch (item.type) {
                case 'number':
                    const stepperParams: {
                        disabled: any,
                        min?: number,
                        max?: number,
                        style: {}
                    } = {
                        disabled: item.disabled,
                        style: {
                            minWidth: '50%'
                        }
                    }
                    item.max && (stepperParams.max = Number.parseInt(item.max))
                    item.min && (stepperParams.min = Number.parseInt(item.min))
                    JSXDOM = <Stepper {...stepperParams}/>
                    break
                case 'string':
                    JSXDOM = <Input readOnly={item.disabled} placeholder={`请输入${item.name}`} />
                    break
                case 'select':
                    JSXDOM = <Selector
                        disabled={item.disabled}
                        options={item.data}
                        multiple={item.radio === 'check'}
                    />
                    break
                case 'switch':
                    JSXDOM = <Switch
                        uncheckedText='关'
                        checkedText='开'
                        disabled={item.disabled}
                    />
                    break
                default:
                    click = async () => {
                        if (!this.ysJson[item.type]) {
                            this.ysJson[item.type] = await this.getJson(item.type)
                        }
                        this.setState({
                            sjxzVisible: item.key,
                            nowMultipleData: [],
                            isNultiple: item.radio === 'check',
                            showDataType: item.type,
                            showData: [],
                            showDataLoad: { ...this.state.showDataLoad, page: 1, hasMore: true }
                        }, this.showDataLoad)
                    }
                    // this.setState({
                    //     [item.key]: item.default
                    // })
                    item.default && (item.default = item.default.map((data: { value: string, label: string }) => ({ v: data.value, l: data.label })))
                    JSXDOM = <SelectZl disabled={item.disabled} placeholder={`选择${item.name}`}/>

            }
            const rules: any = [
                {
                    required: item.required, message: `请输入${item.name}`
                }
            ]
            rules.push({
                validator: (field: any, value: any) => this.fwvalidator(field, value, item)
            })
            const itemParams: {
                key: string,
                initialValue: any,
                name: string,
                label: string,
                rules: any,
                onClick?: any
            } = {
                key: item.key,
                initialValue: item.default && (item.type === 'number' ? Number.parseInt(item.default) : item.default),
                name: item.key,
                label: `${item.name}：`,
                rules
            }
            click && (itemParams.onClick = click)
            return (
                <Item {...itemParams}>
                    {JSXDOM}
                </Item>
            )
        })}</>
    }
    loadZl = async () => {
        this.showLoading()
        await Store.getZlData().then(() => {
            Toast.clear()
            this.setState({
                zlData: Store.zlData,
                // @ts-ignore
                kqdz: Store.zlData.length > 0 && Store.zlData[0]
            })
        })
    }
    /**
     * 加载中
     * @param v
     * @param time
     */
    showLoading = (v: string = '加载中', time: number = 0) => {
        Toast.show({
            content: v,
            icon: 'loading',
            duration: time
        })
    }
    /**
     * 指令选择
     */
    zlxz = (item: any) => {
        this.setState({
            // @ts-ignore
            kqdz: item,
            zlxzVisible: false
        })
        this.showLoading()
        this.getZlxx(item.b || item.v).then(() => {
            Toast.clear()
        })
    }
    /**
     * 搜索框值改变
     * @param val
     */
    kqrsearchValChange = (val: string|undefined, key: string) => {
        this.setState({
            searchVal: { ...this.state.searchVal, [key]: val },
            showDataLoad: { ...this.state.showDataLoad, page: 1, hasMore: true },
        }, this.showDataLoad)
    }
    /**
     * 点击指令选择
     */
    clickZlList = (key: string| boolean) => {
        // this.numberKeyChange('close')
        this.setState({
            zlxzVisible: key
        })
    }
    /**
     * 1 v.v
     * 2 x+v
     * 3 lv+v
     * 4 r+v
     * 5 v[0].v
     * @param v
     * @param lx
     */
    zlRender = (lx: number) => {
        let fun: Function
        switch (lx) {
            case 1:
                fun = (v: itemParams) => {
                    return v.v
                }
                break
            case 2:
                fun = (v: number|string) => {
                    return `x${v}`
                }
                break
            case 3:
                fun = (v: number|string) => {
                    return `lv${v}`
                }
                break
            case 4:
                fun = (v: number|string) => {
                    return `r${v}`
                }
                break
            case 5:
                fun = (v: any) => {
                    return v && v[0].v || ''
                }
                break
            case 6:
                fun = (v: number|string) => {
                    return `@${v}`
                }
                break
            case 7:
                fun = (v: any) => {
                    return v ? '1' : '0'
                }
                break
            default:
                fun = (v: any) => v
        }
        return fun
    }
    // 指令生成
    zlsc = () => {
        const { tabsKey, kqdz } = this.state
        if (!Store.zlxx || Store.zlxx.length === 0) {
            this.copyzl(`${kqdz.v}`)
            return
        }
        const { validateFields } = this.formRef.current
        const zlsj = Store.zlxx.find((item: any) => {
            return item.key === tabsKey
        })
        if (zlsj) {
            const zlParamsKey = zlsj.params.map((param: any) => param.key)
            let zlpj: any = `${kqdz.v}`
            validateFields(zlParamsKey).then((val: any) => {
                let checkKey = ''
                zlsj.params.forEach((zl: any) => {
                    if (zl.radio === 'check' && !checkKey) {
                        checkKey = zl.key
                        zlpj = `${zlpj} ?`
                    } else {
                        if (val[zl.key] == undefined || val[zl.key] == null) return
                        const paramVal = zl.render ? this.zlRender(zl.render)(val[zl.key]) : val[zl.key]
                        zlpj = `${zlpj}${zl.jgf || ' '}${paramVal}`
                    }
                })
                if (checkKey) {
                    const chzl = zlsj.params.find((item: any) => item.key === checkKey)
                    zlpj = val[checkKey].map((checkData: any) => {
                        return zlpj.replace(' ?', `${chzl.fgf || ' '}${chzl.render ? this.zlRender(chzl.render)(checkData) : checkData}`)
                    })
                }
                this.copyzl(zlpj)
            })
        }
    }
    copyzl = (zlpj: any) => {
        const { fwxx } = this.state
        const config = {
            closeOnMaskClick: true,
            confirmText: '复制指令',
            cancelText: '远程执行',
            content: (<div style={{ maxHeight: '200px' }}>
                {typeof zlpj === 'string' ? zlpj : zlpj.map((d: string, index: number) => <>
                    {index + 1}：
                    <span style={{ border: 'black 1px dashed', borderRadius: '0.3em' }}>{d}</span><br/>
                </>)}
            </div>),
            onCancel: async () => {
                if (fwxx.token) {
                    showLoading('正在执行')
                    if (typeof zlpj === 'string') {
                        showLoading('正在执行')
                        const msg = await Store.sendOpencommand({
                            token: fwxx.token,
                            action: 'command',
                            data: zlpj
                        }, fwxx.fwurl)
                        Toast.show({
                            content: msg
                        })
                    } else {
                        const reqArr = zlpj.map((d: string, inx: number) => {
                            return Store.sendOpencommand({
                                token: fwxx.token,
                                action: 'command',
                                data: d
                            }, fwxx.fwurl)
                        })
                        Promise.all(reqArr).then((vals) => {
                            const msg = <div style={{ maxHeight: '500px' }}>{vals.map((d: string, inx: number) => <p key={inx}>{d}</p>)}</div>
                            Toast.show({
                                content: msg
                            })
                        }).catch(() => Toast.clear())
                    }
                } else {
                    Toast.show({
                        content: <>首次需先配置远程执行<br/>即将跳转..</>,
                        afterClose: () => this.leftPopoverClick({ key: 'yczx' })
                    })
                }
            },
            onConfirm: () => {
                let zlCopy = ''
                if (typeof zlpj === 'string') {
                    zlCopy = `/${zlpj}`
                } else {
                    zlpj.forEach((d: string, inx: number) => {
                        zlCopy = `${zlCopy}${inx !== 0 ? '\n' : ''}/${d}`
                    })
                }
                this.copyStr(zlCopy)
            }
        }
        Dialog.confirm(config)
    }
    /**
     * 复制字符串
     * @param str
     */
    copyStr = (str: string) => {
        if (copy(str)) {
            Toast.show({
                icon: 'success',
                content: '复制成功'
            })
        } else {
            Toast.show({
                icon: 'fail',
                content: '复制失败'
            })
        }
    }
    /**
     * 更多选择
     */
    leftPopoverClick = (node: any) => {
        switch (node.key) {
            case 'yczx':
                showLoading('加载中...')
                // @ts-ignore
                import('Pages/zlsc/RemoteControl').then(res => {
                    Toast.clear()
                    this.ZlscRC = res.default
                    this.setState({
                        yczlVisible: true
                    })
                })
                break
            case 'xmgs2':
                this.joinQQ({
                    url: 'https://jq.qq.com/?_wv=1027&k=AKhtRzx2',
                    ms: 'XMMT公益服服2群（3群：538510912；4群：555214409',
                    bm: '346858089',
                })
                break
            case 'zlfk':
                this.joinQQ({
                    url: 'https://jq.qq.com/?_wv=1027&k=eAXSLwJT',
                    ms: '指令生成器2群',
                    bm: '684093273',
                })
                break
            case 'xmmtpd':
                this.joinQQ({
                    url: 'https://qun.qq.com/qqweb/qunpro/share?_wv=3&_wwv=128&appChannel=share&inviteCode=1XOjgeSW6yS&businessType=9&from=246610&biz=ka',
                    ms: '欢迎加入XMMTQQ频道',
                    bm: 'b4k5xmxd85',
                })
                break
            case 'new':
                window.location.href = 'https://cmd.d2n.moe/new/?import=share/artifact.gmh'
                break
            default:
                console.log('无操作')
        }
    }
    joinQQ = (params: { url: string, ms: string|React.ReactElement, bm: string }) => {
        const config = {
            confirmText: '点击加入',
            content: (<div style={{ maxHeight: '200px' }}>
                群号码：{params.bm}<br/>
                {params.ms}
            </div>),
            closeOnMaskClick: true,
            onConfirm: () => {
                window.open(params.url)
            }
        }
        Dialog.alert(config)
    }
    /* numberKeyChange = (type: string, num?: string| number) => {
        if (type === 'close') {
            this.setState({
                numberKeyVisible: false
            })
            return
        }
        const { setFieldsValue, getFieldValue } = this.formRef.current
        let val = getFieldValue(this.state.numberKeyVisible) || ''
        if (type === 'delete') {
            val = val.substring(0, val.length - 1)
        } else {
            val = `${val}${num}`
        }
        setFieldsValue({
            [this.state.numberKeyVisible]: Number.parseInt(val)
        })
    }*/
    showDataLoadTimeOut: any
    showDataLoad = () => {
        if (this.showDataLoadTimeOut) {
            clearTimeout(this.showDataLoadTimeOut)
        }
        this.showDataLoadTimeOut = setTimeout(() => {
            const {showDataLoad, showDataType, sjxzVisible, searchVal} = this.state
            const loadSize = showDataLoad.page * showDataLoad.size
            const arr: { name: any; data: never[] }[] = []
            let inx = 0
            this.ysJson[showDataType] && this.ysJson[showDataType].forEach((item: any, index1: number) => {
                if (inx === loadSize) return
                const data = {
                    name: item.name,
                    data: []
                }
                const isend = index1 === this.ysJson[showDataType].length - 1
                const itemLen = item.data[0].length
                item.data[0].forEach((item2: string|number, index2: number) => {
                    if (inx === loadSize) return
                    if (searchVal[sjxzVisible]) {
                        if (item.name.includes(searchVal[sjxzVisible]) || item.data[1][index2].includes(searchVal[sjxzVisible]) || `${item2}`.includes(searchVal[sjxzVisible])) {
                            // @ts-ignore
                            data.data.push({ v: item2, l: item.data[1][index2] })
                            inx = inx + 1
                        }
                    } else {
                        // @ts-ignore
                        data.data.push({ v: item2, l: item.data[1][index2] })
                        inx = inx + 1
                    }
                    if (isend && index2 === itemLen - 1) {
                        this.setState({
                            showDataLoad: {...this.state.showDataLoad, hasMore: false}
                        })
                    }
                })
                data.data.length > 0 && arr.push(data)
            })
            this.showDataLoadTimeOut = undefined
            this.setState({
                showData: arr
            })
        })
    }
    /*
    * 确认选择
    * */
    searchValSelect = (item: any) => {
        const { sjxzVisible } = this.state
        const { setFieldsValue } = this.formRef.current
        setFieldsValue({
            [sjxzVisible]: item
        })
        this.setState({
            sjxzVisible: ''
        })
    }
    /*修改远程指令服务信息*/
    updateFwxx = (fwxx: any = {}) => {
        this.setState({
            fwxx
        }, () => {
            if (window.localStorage) {
                const storage = window.localStorage
                storage.setItem("fwxx", JSON.stringify({ UID: fwxx.UID || '', fwurl: fwxx.fwurl || ''}))
            }
        })
    }
    updateBunStyle = () => {
        const { bunStyle } = this.state
        const winInnHeight = window.innerHeight
        const winInnWidth = window.innerWidth
        const bodyHeight = document.body.clientHeight
        const bodyWidth = document.body.clientWidth
        if (bunStyle.winInnWidth !== winInnWidth || bodyHeight !== bunStyle.bodyHeight) {
            if (winInnHeight > bodyHeight) {
                this.setState({
                    bunStyle: {
                        winInnWidth,
                        bodyHeight,
                        btn: {
                            maxWidth: `${bodyWidth - 24}px`,
                            width: 'calc(100% - 24px)',
                            // margin: '0 auto'
                        },
                        div: {
                            position: 'fixed',
                            width: '100%',
                            bottom: '3px',
                        }
                    }
                })
            } else {
                this.setState({
                    bunStyle: {
                        winInnWidth,
                        bodyHeight,
                        btn: {},
                        div: {}
                    }
                })
            }
        }
    }
    check = () => {
        let [check, msg] = [false, <></>]
        if (title != this.props.titlemd5) {
            check = true
            msg = <>标题校验未通过</>
        }
        /*if (Store.origin !== 'https://cmd.d2n.moe') {
            check = true
            msg = <>域名不正确</>
        }*/
        return [check, msg]
    }
    render() {
        const { /* numberKeyVisible,*/zlxzVisible, searchVal, sjxzVisible, zlxx, showData, showDataLoad, yczlVisible, fwxx, nowMultipleData, isNultiple, bunStyle } = this.state
        this.updateBunStyle()
        const check = this.check()
        return check[0] ? (check[1]) : (
            <div className={'zlsc'}>
                <NavBar
                    backArrow={''}
                    style={{
                        background: '#fff'
                    }}
                    left={<Popover.Menu
                        actions={[
                            { text: '远程执行', icon: <SetOutline className={'leftPopoverIcon'} />, key: 'yczx' },
                            { text: '新版生成器', icon: <LinkOutline className={'leftPopoverIcon'} />, key: 'new' },
                            { text: '指令生成器2群', icon: <UserAddOutline className={'leftPopoverIcon'} />, key: 'zlfk' },
                            { text: 'XMMT公益服Q群', icon: <UserAddOutline className={'leftPopoverIcon'} />, key: 'xmgs2' },
                            { text: 'XMMTQQ频道', icon: <UserAddOutline className={'leftPopoverIcon'} />, key: 'xmmtpd' },
                        ]}
                        onAction={node => this.leftPopoverClick(node)}
                        placement='bottomRight'
                        trigger='click'
                    ><a>更多<DownOutline /></a></Popover.Menu>}
                    right={<><a onClick={() => this.clickZlList('zhilingList')}>点击切换</a>:{this.state.kqdz.v}</>}
                />
                <NoticeBar content={Store.noticeText.map((item, indx) => `${indx + 1}、${item}；`)} color='alert' closeable />
                <Form
                    ref={this.formRef}
                    mode={'card'}
                    layout={'horizontal'}
                    style={{ position: 'relative' }}
                >
                    <WaterMark fullPage={false} content={'xmmt免费生成器'} fontSize={12} />
                    {zlxx}
                    <br/>
                    <br/>
                    <div style={bunStyle.div}>
                        <Button
                            block
                            style={bunStyle.btn}
                            color='primary'
                            size='large'
                            onClick={this.zlsc}
                            >
                            生成指令
                        </Button>
                    </div>
                </Form>
                <XModal
                    style={{}}
                    showNavBar
                    navBarConfig={{
                        right: isNultiple && <Button onClick={() => this.searchValSelect(nowMultipleData.map((item: string) => JSON.parse(item)))}>确定</Button>,
                        onBack: () => this.setState({ sjxzVisible: false })
                    }}
                    title={'选择'}
                    visible={sjxzVisible}
                >
                    <SearchBar
                        placeholder={'请输入名称或编码'}
                        maxLength={10}
                        value={searchVal[sjxzVisible]}
                        onChange={(e: any) => this.kqrsearchValChange(e, sjxzVisible)}
                    />
                    <div style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
                        {!isNultiple ? <List>
                            {showData.map((item: any) => {
                                const dom = [
                                    <Divider>{item.name}</Divider>
                                ]
                                dom.push(...item.data && item.data.map((item2: itemParams) => {
                                    return <List.Item onClick={() => this.searchValSelect([item2])} key={item2.v}>{item2.v}|{item2.l}</List.Item>
                                }))
                                return dom
                            })}
                        </List> : <CheckList
                            multiple
                            value={nowMultipleData}
                            onChange={v => {
                                this.setState({
                                    nowMultipleData: v || []
                                })
                            }}>
                            {showData.map((item: any) => {
                                const dom = [
                                    <Divider>{item.name}</Divider>
                                ]
                                dom.push(...item.data && item.data.map((item2: itemParams) => {
                                    return <CheckList.Item key={item2.v} value={JSON.stringify(item2)}>{item2.v}|{item2.l}</CheckList.Item>
                                }))
                                return dom
                            })}
                        </CheckList>}
                        <InfiniteScroll loadMore={() => {
                            return new Promise<void>((resolve, reject) => {
                                showDataLoad.hasMore && this.setState({
                                    showDataLoad: { ...this.state.showDataLoad, page: showDataLoad.page + 1 }
                                }, this.showDataLoad)
                                resolve()
                            })
                        }} hasMore={showDataLoad.hasMore} />
                    </div>
                </XModal>
                <XModal
                    style={{}}
                    showNavBar
                    navBarConfig={{
                        onBack: () => this.setState({ zlxzVisible: false })
                    }}
                    title={'指令选择'}
                    visible={zlxzVisible}
                >
                    <SearchBar
                        placeholder={'请输入指令筛选'}
                        maxLength={10}
                        value={searchVal[zlxzVisible]}
                        onChange={e => this.kqrsearchValChange(e, zlxzVisible)}
                    />
                    <div style={{ maxHeight: 'calc(100vh - 7em)', overflowY: 'auto' }}>
                        <List>
                            {this.state.zlData.map((item: any, index: number) => {
                                if (searchVal[zlxzVisible] && !item.l.includes(searchVal[zlxzVisible]) && !item.v.includes(searchVal[zlxzVisible])) return null
                                return <List.Item onClick={() => this.zlxz(item)} key={index}>{item.v}|{item.l}</List.Item>
                            })}
                        </List>
                    </div>
                </XModal>
                {/* <NumberKeyboard
                    visible={numberKeyVisible}
                    onClose={(): void => this.numberKeyChange('close')}
                    onInput={(e: any): void => this.numberKeyChange('input', e)}
                    onDelete={(): void => this.numberKeyChange('delete')}
                />*/}
                {yczlVisible && <this.ZlscRC fwxx={fwxx} updateFwxx={this.updateFwxx} close={() => this.setState({ yczlVisible: false })} visible={yczlVisible}/>}
            </div>
        )
    }
}

export default Zlsc
