import axios from 'axios'
// @ts-ignore
import qs from 'qs'

const $axios = axios.create({
  timeout: 15000, // 15秒
  responseType: 'json'
})

// 添加请求拦截器
$axios.interceptors.request.use((config) => {
    return config
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
})

// 响应拦截
$axios.interceptors.response.use(
  (response) => {
    return response
  },
  (e) => {
    console.log('responseERR=====', e['response'])
    const res = e['response']
    // 验证令牌失败，弹出登录页
    if (res && res.status === 403) {
        return e['response']
    }
    return Promise.reject(e)
  }
)

export const postURLPJ = (url: string, params: any, header?: object) => {
  let paramsPJ = ''
  // 拼接参数到URL
  Object.keys(params).forEach(item => {
      // encodeURI() 不会转义：! @ # $ & ( ) = ： / ; ? + '   encodeURIComponent() 不会转义：! * ( )   >>  decodeURI()  decodeURIComponent()
      paramsPJ = paramsPJ + `&${item}=${encodeURIComponent(params[item])}`
  })
  let urlPJ = `${url}?1=1${paramsPJ}`
  return new Promise((resolve, reject) => {
    $axios({
      method: 'POST',
      url: urlPJ,
      headers: header
    }).then((result: any) => {
      resolve(result)
    }).catch((error: any) => {
      reject(error)
    })
  })
}
export const post = (url: string, params: any, header = {}, type = '') => {
    let headerPj = {}
  if (url.includes('/hjdzmx/')) {
      Object.assign(headerPj, {
          token: window.sessionStorage.getItem('token'),
          usr: window.sessionStorage.getItem('usr'),
      }, header)
  } else {
      headerPj = header
  }
  return new Promise((resolve, reject) => {
    const req = {
      method: 'POST',
      url: url,
      // params: params,
      data: { ...params },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        ...headerPj
      }
    }
      if (type === 'file') {
          // @ts-ignore
          req.responseType = 'arraybuffer'
      } else if (type) {
          // @ts-ignore
          req.responseType = type
      }
    $axios(req).then((result: any) => {
      resolve(result)
    }).catch((error: Error) => {
      reject(error)
    })
  })
}
export const get = (url: string, params: {}, header = {}, type = '') => {
  return new Promise((resolve, reject) => {
    const req = {
      method: 'GET',
      url: url,
      // params: params,
      data: { ...params },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        ...header
      }
    }
    if (type === 'file') {
      // @ts-ignore
      req.responseType = 'arraybuffer'
    } else if (type) {
        // @ts-ignore
        req.responseType = type
    }
    $axios(req).then((result: any) => {
      resolve(result)
    }).catch((error: any) => {
      reject(error)
    })
  })
}
export const postform = (url: string, params: any, header = {}) => {
    return new Promise((resolve, reject) => {
        $axios({
            method: 'POST',
            url: url,
            // params: params,
            data: qs.stringify(params),
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              header
            }
        }).then((result: any) => {
            resolve(result)
        }).catch((error: any) => {
            reject(error)
        })
    })
}
