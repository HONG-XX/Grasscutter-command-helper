import React, { useEffect, useState } from 'react'
import {Modal, NavBar, Divider, WaterMark} from 'antd-mobile'
import './index.less'
interface navBarConfig {
    onBack: Function
    right?: any
    back?: any
    left?: any
}
interface PropsType {
    style?: {}
    navBarConfig: navBarConfig
    showNavBar?: boolean
    visible: boolean
    title?: React.ReactNode|string
    children: React.ReactNode|string|number
    waterContent?: string
}

let popstateListener: any
function Index(props: PropsType) {

    const [isLeftBack, setIsLeftBack] = useState(false)

    useEffect(() => {
        if (props.visible) {
            window.history.pushState(
                {
                    title: 'title',
                    url: '#'
                },
                'title',
                ''
            )
            setIsLeftBack(false)
            popstateListener = window.addEventListener('popstate', onPopstate)
        } else {
            popstateListener && window.removeEventListener('popstate', onPopstate)
            if (isLeftBack) {
                window.history.back()
                setIsLeftBack(false)
            }
        }
    }, [props.visible])

    const onLeftBack = () => {
        setIsLeftBack(true)
        onPopstate()
    }
    const onPopstate = () => {
        props.navBarConfig.onBack && props.navBarConfig.onBack()
    }

    return <span className={'XModal'}>
        <Modal
            visible={props.visible}
            bodyStyle={props.style || {}}
            afterShow={() => {}}
            bodyClassName={'XModalContent'}
            content={(
                <>
                    {props.showNavBar && <>
                      <NavBar
                          {...props.navBarConfig}
                          onBack={() => onLeftBack()}
                      >
                        {props.title || ''}
                      </NavBar>
                      <Divider />
                    </>}
                    <div
                        style={props.showNavBar ? {
                            height: 'calc(100vh - 50px)',
                            overflow: 'auto',
                            position: 'relative'
                        } : {
                            position: 'relative'
                        }}
                    ><WaterMark fullPage={false} content={props.waterContent || 'xmmt免费生成器'} fontSize={12} />{props.children}</div>
                </>
            )}
        />
    </span>
}
export default Index