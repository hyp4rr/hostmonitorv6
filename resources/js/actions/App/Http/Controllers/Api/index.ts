import ConfigController from './ConfigController'
import DeviceController from './DeviceController'
import BranchController from './BranchController'
import AlertController from './AlertController'
import LocationController from './LocationController'
import UserController from './UserController'
import BrandController from './BrandController'
import HardwareModelController from './HardwareModelController'
import ModelController from './ModelController'
import TopologyController from './TopologyController'
import ActivityLogController from './ActivityLogController'
import ReportsController from './ReportsController'
import MonitoringController from './MonitoringController'
import SwitchController from './SwitchController'
const Api = {
    ConfigController: Object.assign(ConfigController, ConfigController),
DeviceController: Object.assign(DeviceController, DeviceController),
BranchController: Object.assign(BranchController, BranchController),
AlertController: Object.assign(AlertController, AlertController),
LocationController: Object.assign(LocationController, LocationController),
UserController: Object.assign(UserController, UserController),
BrandController: Object.assign(BrandController, BrandController),
HardwareModelController: Object.assign(HardwareModelController, HardwareModelController),
ModelController: Object.assign(ModelController, ModelController),
TopologyController: Object.assign(TopologyController, TopologyController),
ActivityLogController: Object.assign(ActivityLogController, ActivityLogController),
ReportsController: Object.assign(ReportsController, ReportsController),
MonitoringController: Object.assign(MonitoringController, MonitoringController),
SwitchController: Object.assign(SwitchController, SwitchController),
}

export default Api