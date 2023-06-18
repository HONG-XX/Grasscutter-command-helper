// @ts-ignore
import React from 'react'
// @ts-ignore
import ReactDOM from 'react-dom'
import './index.less'
import reportWebVitals from './reportWebVitals'
// @ts-ignore
import Zlsc from 'Pages/zlsc'
// @ts-ignore
import { getLower32SignMD5String } from 'Utils/Utils'

ReactDOM.render(
    <React.StrictMode>
        <Zlsc titlemd5={getLower32SignMD5String(document.title)} />
    </React.StrictMode>,
    document.getElementById('root')
)
reportWebVitals();
