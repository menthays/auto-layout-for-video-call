import './index.scss';
import renderer from '../../render'
import {APP_ID} from '../../agora.config.js'
import { merge } from 'lodash'
// import $ from 'jquery'

// eslint-disable-next-line
const rtcEngine = AgoraRTC

const streamList = []

const client = rtcEngine.createClient({
  mode: 'interop'
})

let mode = 0

renderer.init('video-container', 9/16, 8/5)

const streamInit = (uid, config) => {
  let defaultConfig = {
    streamID: uid,
    audio: true,
    video: true,
    screen: false
  }
  let stream = rtcEngine.createStream(merge(defaultConfig, config))
  stream.setVideoProfile('480p_4')
  return stream
}

const addStream = () => {
  let ts = new Date().getTime();
  // generate user id
  let uid = Number((`${ts}`).slice(5));
  let stream = streamInit(uid)
  stream.init(() => {
    console.log('Success to init stream')
    streamList.push(stream)
    renderer.customRender(streamList, mode, stream.getId())
  }, err => {
    console.error('Stream failed to initialize')
  })
}

const removeStream = () => {
  let streamShouldSplice = streamList.pop()
  let idShouldSplice = streamShouldSplice.getId()
  streamShouldSplice.close()
  document.querySelector(`#video-item-${idShouldSplice}`).remove()
  let id
  if (streamList.length) {
    id = streamList[streamList.length-1].getId()
    renderer.customRender(streamList, mode, id)
  }
}

const isMobileSize = () => {
  if (window.innerWidth <= 800 && window.innerHeight <= 830) {
    return true;
  }
  return false;
};

const getMessage = mode => {
  switch(mode) {
    case 0:
      return 'Tile mode is suitable for 1-N streams'
    case 1:
      return 'PIP mode is suitable for 1-4 streams'
    case 2:
      return 'Screen sharing mode is suitable for 1-8 streams'
    default:
      return ''
  }
}

if (isMobileSize()) {
  renderer.enterFullScreen()
}

client.init(APP_ID, () => {
  // init successfully
  
})

document.querySelector('#add').addEventListener('click', () => {
  addStream()
})

document.querySelector('#remove').addEventListener('click', () => {
  if (streamList.length === 0) {
    return alert('No stream to remove!')
  }
  removeStream()
})

document.querySelector('#mode').addEventListener('change', (e) => {
  mode = Number(e.currentTarget.value)
  if (streamList.length) {
    renderer.customRender(streamList, mode)
  }
  document.querySelector('#message-box').innerHTML = getMessage(mode)
})



window.addEventListener('resize', () => {
  if (isMobileSize()) {
    renderer.enterFullScreen()
  } else {
    renderer.exitFullScreen()
  }
  renderer.customRender(streamList, mode)
})
