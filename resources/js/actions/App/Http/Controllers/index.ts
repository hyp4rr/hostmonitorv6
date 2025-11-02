import Api from './Api'
import PingController from './PingController'
import Settings from './Settings'
const Controllers = {
    Api: Object.assign(Api, Api),
PingController: Object.assign(PingController, PingController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers