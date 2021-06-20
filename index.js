/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import i18n
import './libs/i18n';

AppRegistry.registerComponent(appName, () => App);
// Requests shown in network, but messed with data until the point that broke the app
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
