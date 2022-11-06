export const reportIncidentUrl = '/report-incident'

const ROUTES = {
  Public: {
    Login: '/login',
    PasswordReset: '/password-reset',
    ReportIncidentStadium: `${reportIncidentUrl}/stadium/:id`,
    ReportIncidentFestival: `${reportIncidentUrl}/festival/:id`,
    ReportIncidentARFestival: `${reportIncidentUrl}/arfestival/:id`,
    ReportIncidentGlastonbury: `${reportIncidentUrl}/glastonbury/:id`,
  },
  Private: {
    EventList: '/EventList',
    Dashboard: '/dashboard/:id',
    DashboardMap: '/dashboard/:id/map',
    DashboardBans: '/dashboard/:id/bans',
    DashboardReport: '/dashboard/:id/report',
    DashboardDebrief: '/dashboard/:id/debrief',
    DashboardDocumentLibrary: '/dashboard/:id/document-library',
    DashboardAnalytics: '/dashboard/:id/analytics',
    DashboardTicketScanningReport: '/dashboard/:id/ticket-scanning-report',

    DashboardVenueChecks: '/dashboard/:id/venue-checks',

    Admin: '/admin',

    AdminClients: '/admin/clients',
    AdminClientCreate: '/admin/clients/create',
    AdminClientEdit: '/admin/clients/:id',

    AdminEvents: '/admin/events',
    AdminEventCreate: '/admin/events/create',
    AdminEventEdit: '/admin/events/:id',
    AdminEventCopy: '/admin/events/:id/copy',

    AdminTicketScanning: '/admin/ticket-scanning',

    AdminDocumentUpload: '/admin/document-upload',

    AdminUsers: '/admin/users',
    AdminUserCreate: '/admin/users/create',
    AdminUserEdit: '/admin/users/:id',

    AdminUserGroups: '/admin/groups',
    AdminUserGroupCreate: '/admin/groups/create',
    AdminUserGroupEdit: '/admin/groups/:id',
  },
}

const PILL_VARIANT = {
  Suspended: 'suspended',
  Live: 'live',
  Closed: 'closed',
}

const INCIDENT_PRIORITY = {
  Critical: { label: 'Critical', color: 'rgba(106, 13, 173, .8)', priority: 1 }, //Purple
  High: { label: 'High', color: 'rgba(255, 0, 0, .8)', priority: 2 }, //Red
  Medium: { label: 'Medium', color: 'rgba(255, 191, 0, .8)', priority: 3 }, //Amber
  Low: { label: 'Low', color: 'rgba(0, 150, 255, .8)', priority: 4 }, //Blue
  Info: { label: 'Info', color: 'rgba(115, 147, 179, .8)', priority: 5 }, //Gray
}

const BG_COLORS_INCIDENT_STATUS_FOR_USER = {
  Color_Default: null,
  Color_NotViewed: { background: 'Purple', code: 'rgba(127, 17, 224, .8)' },
  Color_NotViewed_mins: {
    background: 'Red',
    code: 'rgba(255, 0, 0, .8)',
  },
  Color_UpdateNotViewed: { background: 'Amber', code: 'rgba(255, 191, 0, .8)' },
}

const INCIDENT_STATUS_FOR_USER = {
  Default: '',
  NotViewed: 'not-viewed',
  NotViewed_mins: 'update-not-viewed-15mins',
  UpdateNotViewed: 'update-not-viewed',
}

const INCIDENT_STATUS = {
  New: 'New',
  Resolved: 'Resolved',
  Archived: 'Closed',
}

const BUTTON_ICONS = {
  Add: 'plus',
  CreateHollow: 'plus-hollow',
  Delete: 'delete',
  Suspend: 'suspend',
  Edit: 'edit',
  Client: 'clients',
  Event: 'events',
  Users: 'users',
  User: 'user',
  Copy: 'duplicate',
  CopyRed: 'duplicate-red',
  Dashboard: 'dashboard',
  Report: 'report',
  Password: 'passwordreset',
  Search: 'search',
  ShiftManager: 'shiftmanager',
  Upload: 'upload',
  Calendar: 'calendar',
  RightArrow: 'arrowright',
  LeftArrow: 'arrowleft',
  NextPage: 'page-forward',
  PreviousPage: 'page-back',
  Remove: 'remove',
  Download: 'download',
  HidePassword: 'hide-password',
  ShowPassword: 'show-password',
  DeleteBan: 'delete-white',
  EditBan: 'edit-white',
  TicketScanning: 'ticket-scanning',
  DocumentUpload: 'duplicate',
}

const VARIANT = {
  Primary: 'primary',
  Secondary: 'secondary',
  Warning: 'warning',
  NoBackground: 'no-background',
  Link: 'link',
}

const INCIDENT_TYPES = [
  'missingPerson',
  'medical',
  'lostProperty',
  'other',
  'healthSafety',
  'perimeterBreach',
  'violence',
  'theft',
  'drugs',
  'ejection',
  'emergency',
  'suspicious',
  'hotline',
  'coded',
  'noise',
]

const INCIDENT_FIELD_TYPES = {
  photo: 'photo',
  modal: 'modal',
  map: 'map',
  field: 'field',
  picker: 'picker',
  table: 'table',
  collection: 'collection',
  textview: 'textview',
  review: 'review',
  numberfield: 'numberfield',
}

const DIALOG_TYPE = {
  ResetPassword: 'reset-password',
  CreateUser: 'create-user',
  EditUser: 'edit-user',
  GroupDetails: 'group-details',
  Confirm: 'confirm',
  Comment: 'comment',
  AddActivityLog: 'add-activity-log',
  ResolveIncident: 'resolve-incident',
  ArchiveIncident: 'archive-incident',
  ShareIncident: 'share-incident',
  EvacuateSite: 'evacuate-site',
  LockdownZone: 'lockdown-zone',
  SendNotification: 'send-notification',
  AssignUserToCheck: 'assign-user-to-check',
  Uploader: 'uploader',
  AddBeacon: 'beacon-dialog',
}

const USER_PERMISSIONS = {
  NormalUser: 'NormalUser',
  TargetedDashboardUser: 'TargetedDashboardUser',
  EventManager: 'EventManager',
  ClientManager: 'ClientManager',
  CrestAdmin: 'CrestAdmin',
}

const USER_PERMISSIONS_ALL = [
  'NormalUser',
  'TargetedDashboardUser',
  'EventManager',
  'ClientManager',
  'CrestAdmin',
]

const AUTHORISATION_MATCH_TYPES = {
  one: 'one',
  all: 'all',
}

const ROLE_OPTIONS = [
  { value: 'NormalUser', label: 'App' },
  { value: 'TargetedDashboardUser', label: 'App & Multi Agency Logging' },
  { value: 'EventManager', label: 'App & Dashboard' },
  { value: 'ClientManager', label: 'Admin User' },
  { value: 'CrestAdmin', label: 'HALO Admin' },
]

const IMPORT_TYPES = {
  audienceView: 'AudienceView',
}

const IMPORT_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'audienceView', label: 'AudienceView' },
]

const IMPORT_TYPE_FIELDS = {
  audienceView: {
    serverUrl: {
      label: 'Server URL',
      placeholder: '',
      type: '',
      required: 'Enter the server URL for your AudienceView server',
    },
    username: {
      label: 'Username',
      placeholder: '',
      type: '',
      required: 'Enter your username',
    },
    password: {
      label: 'Password',
      placeholder: 'Enter password',
      type: 'password',
      required: 'Enter your password*',
      warning:
        '* Please note in order to save any changes, please re-enter your password.',
    },
  },
}

const CLIENT_FEATURES = {
  MultiGeofences: 'multiGeofences',
  UserGroups: 'userGroups',
  DashboardFiltering: 'dashboardFiltering',
  IncidentTriaging: 'incidentTriaging',
  TargetedDashboard: 'targetedDashboard',
  TicketScanning: 'ticketScanning',
  ClientBranding: 'clientBranding',
  VenueChecks: 'venueChecks',
  PublicReporting: 'publicReport',
  Hotline: 'hotline',
  GDPRChecks: 'GDPRChecks',
  CapacityCounter: 'capacityCounter',
  CrowdManagement: 'crowdManagement',
  PrintIncidents: 'printIncidents',
}

const CLIENT_FEATURES_LABEL = {
  [CLIENT_FEATURES.TargetedDashboard]: 'Multi Agency Logging',
  [CLIENT_FEATURES.IncidentTriaging]: 'Incident Triaging',
  [CLIENT_FEATURES.DashboardFiltering]: 'Dashboard Filtering',
  [CLIENT_FEATURES.UserGroups]: 'Teams',
  [CLIENT_FEATURES.MultiGeofences]: 'Multi Geofences',
  [CLIENT_FEATURES.TicketScanning]: 'Ticket Scanning',
  [CLIENT_FEATURES.ClientBranding]: 'Client Branding',
  [CLIENT_FEATURES.VenueChecks]: 'Tasks',
  [CLIENT_FEATURES.PublicReporting]: 'Public Reporting',
  [CLIENT_FEATURES.Hotline]: 'Hotline Call Handling',
  [CLIENT_FEATURES.GDPRChecks]: 'GDPR Checks',
  [CLIENT_FEATURES.CapacityCounter]: 'Capacity Counter',
  [CLIENT_FEATURES.CrowdManagement]: 'Crowd Management',
  [CLIENT_FEATURES.PrintIncidents]: 'Print Incidents',
}

const MAX_GEOFENCE_COUNT = 20

const ADMIN_TABLE_VARIANTS = {
  FullPage: 'full-page',
  Contained: 'contained',
}

const DASHBOARD_PANEL = {
  Left: 'left',
  Right: 'right',
  Sliding: 'sliding',
  Dialog: 'dialog',
}

const MAP_GEOFENCE_STYLE = {
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#FF0000',
  fillOpacity: 0.35,
}

const MAP_TYPES = {
  Dashboard: 'dashboard',
  Incident: 'incident',
}

const TITLE_TYPES = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
}

const ALERT_BOX_VARIANTS = {
  Success: 'success',
  Info: 'info',
  Warning: 'warning',
  Danger: 'danger',
}

const ALERT_MINUTES_WITHOUT_UPDATE = 15

const INCIDENT_WHAT_TEXT_BY_TYPE = {
  theft: 'propertyDetails',
  lostProperty: 'propertyDetails',
  default: 'medicalNotes',
  hotline: 'hotlineCallType',
  noise: 'typeOfNoise',
}

const DEFAULT_CENTER = { lat: 54.0, lng: -2.0 }

const FILTER_DATE_FORMAT = {
  event: 'DD/MM/YYYY HH:mm',
  today: 'HH:mm',
  lastFifteen: 'HH:mm',
}

const TICKET_SCANNING_FILTERS = {
  event: 'event',
  today: 'today',
  lastFifteen: 'lastFifteen',
}

const CHECK_TYPE = {
  Standard: 'standard',
  PreEvent: 'pre-event',
  Event: 'event',
  PostEvent: 'post-event',
  PreEgress: 'pre-egress',
}

const CHECK_TYPE_TEXT = {
  [CHECK_TYPE.Standard]: 'Standard',
  [CHECK_TYPE.PreEvent]: 'Pre-Event',
  [CHECK_TYPE.Event]: 'During Event',
  [CHECK_TYPE.PostEvent]: 'Post-Event',
  [CHECK_TYPE.PreEgress]: 'Pre-Egress',
}

const RECURRING_PERIOD = {
  Never: 'never',
  EveryFifteenMinutes: 'every-fifteen-minutes',
  EveryThirtyMinutes: 'every-thirty-minutes',
  Hourly: 'hourly',
  Daily: 'daily',
  Weekly: 'weekly',
  Monthly: 'monthly',
  Yearly: 'yearly',
}

const RECURRING_PERIOD_TEXT = {
  [RECURRING_PERIOD.Never]: 'Never',
  [RECURRING_PERIOD.EveryFifteenMinutes]: 'Every 15 Minutes',
  [RECURRING_PERIOD.EveryThirtyMinutes]: 'Every 30 Minutes',
  [RECURRING_PERIOD.Hourly]: 'Every Hour',
  [RECURRING_PERIOD.Daily]: 'Every Day',
  [RECURRING_PERIOD.Weekly]: 'Every Week',
  [RECURRING_PERIOD.Monthly]: 'Every Month',
  [RECURRING_PERIOD.Yearly]: 'Every Year',
}

const RECURRING_PERIOD_TEXT_SHORT = {
  [RECURRING_PERIOD.Never]: 'Once',
  [RECURRING_PERIOD.EveryFifteenMinutes]: '15mins',
  [RECURRING_PERIOD.EveryThirtyMinutes]: '30mins',
  [RECURRING_PERIOD.Hourly]: '1hr',
  [RECURRING_PERIOD.Daily]: 'Daily',
  [RECURRING_PERIOD.Weekly]: 'Weekly',
  [RECURRING_PERIOD.Monthly]: 'Monthly',
  [RECURRING_PERIOD.Yearly]: 'Yearly',
}

const DASHBOARD_RIGHT_PANEL_VIEW = {
  Maps: 'Maps',
  Checklist: 'Tasks',
}

const DASHBOARD_RIGHT_PANEL_FEATURES = {
  [DASHBOARD_RIGHT_PANEL_VIEW.Maps]: [],
  [DASHBOARD_RIGHT_PANEL_VIEW.Checklist]: [CLIENT_FEATURES.VenueChecks],
}

const CHECK_STATUS = {
  Pending: 'pending',
  Complete: 'complete',
  UnableToComplete: 'couldNotComplete',
  Late: 'late', // This value is only used internally
}

const CHECK_STATUS_TEXT = {
  [CHECK_STATUS.Pending]: 'Pending',
  [CHECK_STATUS.Complete]: 'Complete',
  [CHECK_STATUS.UnableToComplete]: 'Unable to complete',
  [CHECK_STATUS.Late]: 'Late',
}

const CHECK_TYPE_FILTERS = [
  { filter: '', text: 'All' },
  { filter: CHECK_TYPE.Standard, text: 'Standard' },
  { filter: CHECK_TYPE.PreEvent, text: 'Pre-event' },
  { filter: CHECK_TYPE.Event, text: 'During Event' },
  { filter: CHECK_TYPE.PreEgress, text: 'Pre-Egress' },
  { filter: CHECK_TYPE.PostEvent, text: 'Post event' },
]

const CHECK_STATUS_PLACEHOLDER = [
  { status: CHECK_STATUS.Complete, text: '{0} complete' },
  { status: CHECK_STATUS.Pending, text: '{0} pending' },
  { status: CHECK_STATUS.UnableToComplete, text: '{0} unable to complete' },
  { status: CHECK_STATUS.Late, text: '{0} late' },
]
const CHECK_DATE_FORMAT = 'YYYY-MM-DD'

export {
  ROUTES,
  BUTTON_ICONS,
  VARIANT,
  INCIDENT_TYPES,
  INCIDENT_FIELD_TYPES,
  INCIDENT_PRIORITY,
  INCIDENT_STATUS_FOR_USER,
  INCIDENT_STATUS,
  BG_COLORS_INCIDENT_STATUS_FOR_USER,
  USER_PERMISSIONS,
  USER_PERMISSIONS_ALL,
  AUTHORISATION_MATCH_TYPES,
  ROLE_OPTIONS,
  DIALOG_TYPE,
  PILL_VARIANT,
  CLIENT_FEATURES,
  CLIENT_FEATURES_LABEL,
  MAX_GEOFENCE_COUNT,
  ADMIN_TABLE_VARIANTS,
  DASHBOARD_PANEL,
  MAP_GEOFENCE_STYLE,
  MAP_TYPES,
  TITLE_TYPES,
  ALERT_BOX_VARIANTS,
  ALERT_MINUTES_WITHOUT_UPDATE,
  INCIDENT_WHAT_TEXT_BY_TYPE,
  DEFAULT_CENTER,
  IMPORT_TYPES,
  IMPORT_TYPE_OPTIONS,
  IMPORT_TYPE_FIELDS,
  FILTER_DATE_FORMAT,
  TICKET_SCANNING_FILTERS,
  CHECK_TYPE,
  CHECK_TYPE_TEXT,
  RECURRING_PERIOD,
  RECURRING_PERIOD_TEXT,
  RECURRING_PERIOD_TEXT_SHORT,
  DASHBOARD_RIGHT_PANEL_VIEW,
  DASHBOARD_RIGHT_PANEL_FEATURES,
  CHECK_STATUS,
  CHECK_STATUS_TEXT,
  CHECK_TYPE_FILTERS,
  CHECK_STATUS_PLACEHOLDER,
  CHECK_DATE_FORMAT,
}
