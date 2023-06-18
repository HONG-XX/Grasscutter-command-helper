import React from 'react'
import {
    Tag
} from 'antd-mobile'

class SelectZl extends React.Component<any, any>{
    static defaultProps: any = {
        l: 'l',
        v: 'v'
    }
    value: any
    constructor(props: any) {
        super(props)
        this.state = {
            value: []
        }
    }
    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (JSON.stringify(this.props.value || []) !== JSON.stringify(prevProps.value || [])) {
            this.updateValue(this.props.value)
        }
    }
    updateValue = (val: any) => {
        this.props.onChange && this.props.onChange(val)
        return this.setState({
            value: val
        })
    }
    componentDidMount() {
        this.props.value && this.updateValue(this.props.value)
    }

    render() {
        const { value } = this.state
        const { v, l } = this.props
        return <>
            {(!value || value.length === 0) && <span style={{ color: '#999' }}>{this.props.placeholder || ''}</span>}
            {value && value.map((item: any) => <Tag key={item[v]} color='primary' fill='outline'>{item[l]}</Tag>)}
        </>
    }
}
export default SelectZl
