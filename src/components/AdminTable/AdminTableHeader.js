import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import ButtonWithIcon from '../common/ButtonWithIcon'
import HaloCheckUploader from '../common/HaloCheckUploader'
import { BUTTON_ICONS, VARIANT, USER_PERMISSIONS } from '../../utils/constants'

import { SearchInput, Selector } from '.'
import { withUserContext } from '../../Contexts'

const propTypes = {
  globalActions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOf(Object.values(BUTTON_ICONS)),
      title: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  ),
  searchPlaceholder: PropTypes.string.isRequired,

  search: PropTypes.string.isRequired,
  eventId: PropTypes.string,
  selectedFilter: PropTypes.string,

  selectedRows: PropTypes.arrayOf(PropTypes.object),
  afterGlobalAction: PropTypes.func,
  onSearch: PropTypes.func.isRequired,
  clientsData: PropTypes.arrayOf(PropTypes.object),
  onFilterChange: PropTypes.func,

  hasRowsSelected: PropTypes.bool,

  onCreateClick: PropTypes.func,
  onUploadClick: PropTypes.func,
  onSelectClick: PropTypes.func,
  onDownloadClick: PropTypes.func,

  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  reloadHaloChecks: PropTypes.func,
  toggleHaloChecksLoadingModal: PropTypes.func,
  isSearchDisplay: PropTypes.bool,
}

const AdminTableHeader = ({
  globalActions,
  searchPlaceholder,

  search,
  selectedFilter,

  selectedRows,
  afterGlobalAction,
  onSearch,
  clientsData,
  onFilterChange,

  hasRowsSelected,

  onCreateClick,
  onUploadClick,
  onSelectClick,

  currentUser,
  eventId,
  reloadHaloChecks,
  toggleHaloChecksLoadingModal,
  isSearchDisplay,
}) => {
  return (
    <div className="admin-table__header">
      {onCreateClick && (
        <ButtonWithIcon
          icon={BUTTON_ICONS.Add}
          title="Create"
          onClick={onCreateClick}
        />
      )}
      {globalActions.map(globalAction => (
        <ButtonWithIcon
          key={globalAction.icon}
          {...globalAction}
          onClick={() => {
            globalAction.onClick(selectedRows)
            afterGlobalAction()
          }}
          hollow
          disabled={!hasRowsSelected}
          variant={VARIANT.Secondary}
        />
      ))}
      {isSearchDisplay && (
        <SearchInput
          placeholder={searchPlaceholder}
          value={search}
          onChange={onSearch}
        />
      )}
      {onSelectClick && onUploadClick && (
        <HaloCheckUploader
          reloadHaloChecks={reloadHaloChecks}
          toggleHaloChecksLoadingModal={toggleHaloChecksLoadingModal}
          eventId={eventId}
          position="right"
        />
      )}
      {clientsData &&
        currentUser.permission_role === USER_PERMISSIONS.CrestAdmin && (
          <Selector
            value={selectedFilter}
            label="Clients"
            onChange={onFilterChange}
            data={clientsData}
          />
        )}
    </div>
  )
}

AdminTableHeader.propTypes = propTypes

AdminTableHeader.defaultProps = {
  globalActions: [],
  selectedFilter: '',
  selectedRows: [],
  afterGlobalAction: () => {},
  onFilterChange: () => {},
  hasRowsSelected: false,
  onCreateClick: null,
  onUploadClick: null,
  onSelectClick: null,
  onDownloadClick: null,
  eventId: null,
  clientsData: null,
  reloadHaloChecks: () => {},
  toggleHaloChecksLoadingModal: () => {},
  isSearchDisplay: true,
}

export default withUserContext(AdminTableHeader)
