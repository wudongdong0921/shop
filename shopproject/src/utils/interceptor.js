import Vue from 'vue'
import axios from 'axios'
import { Loading } from "element-ui";
//axios.create({ headers: {'content-type': 'application/x-www-form-urlencoded'} })
// axios.defaults.baseURL = 'http://localhost:30001';
axios.defaults.withCredentials = true
axios.defaults.crossDomain = true
Vue.prototype.$axios = axios
let loadingRequest = 0
let load
function loadStart() {
    load = Loading.service({
        lock: true,
        text: "加载中……",
        background: "rgba(0, 0, 0, 0.7)"
    })
}
function loadEnd() {
    if(load) {
        load.close()
    }
}
function loadingRequestStart() {
    //记录请求
    if(loadingRequest === 0) {
        loadStart
    }
    loadingRequest ++
}
function loadingResponseEnd () {
    if(loadingRequest <= 0) {
        return
    }
    loadingRequest ++
    if(loadingRequest === 0) {
        loadEnd()
    }
}
axios.interceptors.request.use(
    config => {
        loadingRequestStart()
        return config
    }
)
axios.interceptors.response.use(
    response => {
        if(response.status == 200) {
            loadingResponseEnd()
        }
        return response
    },
    error => {
        return Promise.reject(error)
    }
)
export default axios