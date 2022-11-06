import other from '../images/icons/icon-incident-other-white-sml.svg'
import drugs from '../images/icons/icon-incident-drink-drug-white-sml.svg'
import emergency from '../images/icons/icon-incident-emergency-white-sml.png'
import healthSafety from '../images/icons/icon-incident-health-safety-white-sml.svg'
import hostile from '../images/icons/icon-incident-hostile-white-sml.png'
import suspicious from '../images/icons/icon-incident-suspicious-white-sml.svg'
import theft from '../images/icons/icon-incident-theft-white-sml.png'
import violence from '../images/icons/icon-incident-violence-white-sml.svg'
import weapon from '../images/icons/icon-incident-weapon-white-sml.png'
import medical from '../images/icons/icon-incident-medical-white-sml.svg'
import missingPerson from '../images/icons/icon-incident-missing-person-white-sml.svg'
import pinMedical from '../images/icons/pin-medical.svg'
import pinPolice from '../images/icons/pin-police.svg'
import pinStandard from '../images/icons/pin-standard.svg'
import pinIncident from '../images/icons/pin-incident.svg'
import iconChat from '../images/icons/icon-chat-sml.png'
import chatSpeechLeft from '../images/icons/icon-message-current-user-bubble.png'
import chatSpeechRight from '../images/icons/icon-message-other-users-bubble.png'
import warning from '../images/icons/icon-warning-yellow.svg'
import lostProperty from '../images/icons/icon-incident-lost-property-white-sml.svg'
import perimeterBreach from '../images/icons/icon-incident-perimeter-breach-white-sml.svg'
import message from '../images/icons/icon-message.svg'
import lockdown from '../images/icons/icon-lockdown.svg'
import evacuate from '../images/icons/icon-evacuate.svg'
import tick from '../images/icons/icon-tick.svg'
import tickGreen from '../images/icons/icon-tick-green.svg'
import cross from '../images/icons/icon-cross.svg'
import showPassword from '../images/icons/show-password.svg'
import hidePassword from '../images/icons/hide-password.svg'
import necCleaning from '../images/icons/icon-incident-cleaning.svg'
import customerService from '../images/icons/icon-incident-customer-service.svg'
import image from '../images/icons/image-solid.svg'
import cross_white from '../images/icons/cross-white.svg'
import crossRed from '../images/icons/icon-cross-red.svg'
import analytics from '../images/icons/icon-analytics.svg'
import dashboard from '../images/icons/icon-dashboard-side.svg'
import debrief from '../images/icons/icon-debrief.svg'
import documentLibrary from '../images/icons/icon-document-lib.svg'
import eventChange from '../images/icons/icon-event-change.svg'
import mapIcon from '../images/icons/icon-map.svg'
import reports from '../images/icons/icon-reports.svg'
import taskList from '../images/icons/icon-tasks.svg'
import logoutIcon from '../images/icons/icon-log-out.svg'
import hamburger from '../images/icons/icon-hamburger.svg'
import scanner from '../images/icons/icon-scanner.svg'
import support from '../images/icons/icon-support.svg'
import settings from '../images/icons/icon-settings.svg'
import calendarIcon from '../images/icons/icon-calendar-side.svg'
import userIcon from '../images/icons/icon-user-side.svg'
import people from '../images/icons/icon-users-side.svg'
import relaseNote from '../images/icons/icon-relase-notes.svg'

const icons = {
  other,
  drugs,
  drink: drugs,
  emergency,
  healthSafety,
  hostile,
  intrusion: hostile,
  suspicious,
  theft,
  violence,
  weapon,
  medical,
  missingPerson,
  pinMedical,
  pinPolice,
  pinStandard,
  pinIncident,
  iconChat,
  chatSpeechLeft,
  chatSpeechRight,
  unread: warning,
  lostProperty,
  perimeterBreach,
  message,
  lockdown,
  evacuate,
  image,
  mapIncidents:
    'https://cdn2.iconfinder.com/data/icons/social-productivity-line-art-1/128/alert-triangle-512.png',
  mapStaff: 'https://image.flaticon.com/icons/png/512/23/23228.png',
  tick,
  cross,
  showPassword,
  hidePassword,
  necCleaning,
  customerService,
  cross_white,
  tickGreen,
  crossRed,
  analytics,
  dashboard,
  debrief,
  documentLibrary,
  eventChange,
  mapIcon,
  reports,
  taskList,
  logoutIcon,
  hamburger,
  scanner,
  support,
  settings,
  calendarIcon,
  userIcon,
  people,
  relaseNote,
}

export function getIcon(name) {
  return icons[name] || icons.other
}
export function getIconNoFallback(name) {
  return icons[name]
}

export default {
  getIcon,
}
