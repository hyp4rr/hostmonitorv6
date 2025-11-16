import ConfigurationController from './ConfigurationController'
import Api from './Api'
import MonitorController from './MonitorController'
import TopologyController from './TopologyController'
import Settings from './Settings'
const Controllers = {
    ConfigurationController: Object.assign(ConfigurationController, ConfigurationController),
Api: Object.assign(Api, Api),
MonitorController: Object.assign(MonitorController, MonitorController),
TopologyController: Object.assign(TopologyController, TopologyController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers