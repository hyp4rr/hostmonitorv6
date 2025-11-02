import DeviceController from './DeviceController'
import SwitchController from './SwitchController'
import AlertController from './AlertController'
const Api = {
    DeviceController: Object.assign(DeviceController, DeviceController),
SwitchController: Object.assign(SwitchController, SwitchController),
AlertController: Object.assign(AlertController, AlertController),
}

export default Api