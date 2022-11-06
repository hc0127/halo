import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import ButtonWithIcon from '../common/ButtonWithIcon'
import HaloCheckUploader from '../common/HaloCheckUploader'
import { BUTTON_ICONS, VARIANT, USER_PERMISSIONS } from '../../utils/constants'

import { SearchInput, SelectorEvents } from '.'
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
  filterPlaceholder: PropTypes.string.isRequired,

  search: PropTypes.string.isRequired,
  filter: PropTypes.string.isRequired,
  eventId: PropTypes.string,
  selectedFilter: PropTypes.string,

  selectedRows: PropTypes.arrayOf(PropTypes.object),
  afterGlobalAction: PropTypes.func,
  onSearch: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
  eventsData: PropTypes.arrayOf(PropTypes.object),
  onFilterChange: PropTypes.func,

  hasRowsSelected: PropTypes.bool,

  onCreateClick: PropTypes.func,
  onUploadClick: PropTypes.func,
  onSelectClick: PropTypes.func,
  onDownloadClick: PropTypes.func,

  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  reloadHaloDocs: PropTypes.func,
  toggleHaloDocsLoadingModal: PropTypes.func,
}

const AdminTableHeaderSecond = ({
  globalActions,
  searchPlaceholder,

  filterPlaceholder,

  search,
  filter,
  selectedFilter,

  selectedRows,
  afterGlobalAction,
  onSearch,
  onFilter,
  eventsData,
  onFilterChange,

  hasRowsSelected,

  onCreateClick,
  onUploadClick,
  onSelectClick,

  currentUser,
  eventId,
  reloadHaloDocs,
  toggleHaloDocsLoadingModal,
}) => {
  return (
    <div className="admin-table__header">
      {onCreateClick && (
        <ButtonWithIcon
          icon={BUTTON_ICONS.Add}
          title="Upload"
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
      <SearchInput
        placeholder={searchPlaceholder}
        value={search}
        onChange={onSearch}
      />
      {onSelectClick && onUploadClick && (
        <HaloCheckUploader
          reloadHaloDocs={reloadHaloDocs}
          toggleHaloDocsLoadingModal={toggleHaloDocsLoadingModal}
          eventId={eventId}
          position="right"
        />
      )}
      {eventsData &&
        currentUser.permission_role === USER_PERMISSIONS.CrestAdmin && (
          <SelectorEvents
            value={filter}
            label={filterPlaceholder}
            onChange={onFilter}
            data={eventsData}
          />
        )}
    </div>
  )
}

AdminTableHeaderSecond.propTypes = propTypes

AdminTableHeaderSecond.defaultProps = {
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
  eventsData: null,
  reloadHaloDocs: () => {},
  toggleHaloDocsLoadingModal: () => {},
}

export default withUserContext(AdminTableHeaderSecond)