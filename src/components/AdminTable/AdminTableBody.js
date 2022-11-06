import React, { useCallback, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import ButtonWithIcon from '../common/ButtonWithIcon'
import { BUTTON_ICONS, VARIANT } from '../../utils/constants'
import { NiceCheckbox } from '.'
import utils from '../../utils/helpers'

const propTypes = {
  customRenders: PropTypes.arrayOf(
    PropTypes.shape({
      column: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    }),
  ),
  rowActions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOf(Object.values(BUTTON_ICONS)),
      onClick: PropTypes.func.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ),
  onRowClick: PropTypes.func,
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  rowPerPage: PropTypes.number,

  selectedRowIds: PropTypes.arrayOf(PropTypes.string),

  onAllCheckboxChange: PropTypes.func,
  onRowCheckboxChange: PropTypes.func,
  showCheckboxes: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,

  onOrderChange: PropTypes.func,

  centerColumnIndexes: PropTypes.arrayOf(PropTypes.number),
  currentPage: PropTypes.number.isRequired,
}

const AdminTableBody = React.forwardRef(
  (
    {
      rowPerPage,
      headers,
      rowActions,
      columns,
      customRenders,
      onRowClick,
      selectedRowIds,
      onAllCheckboxChange,
      onRowCheckboxChange,
      showCheckboxes,
      data,
      centerColumnIndexes,
      onOrderChange,
      currentPage,
      incidentTable,
    },
    ref,
  ) => {
    const id = useMemo(
      () =>
        Math.round()
          .toString(36)
          .substr(2),
      [],
    )

    const tableHeadRef = useRef()
    const [widths, setWidths] = useState(null)

    const getThId = useCallback(
      key => {
        return 'th-' + id + '-' + key
      },
      [id],
    )

    const onBeforeDragStart = useCallback(() => {
      if (!tableHeadRef.current || !onOrderChange) {
        return
      }

      const w = []
      tableHeadRef.current.querySelectorAll('th').forEach(th => {
        const ind = parseInt(th.id.split('-').pop(), 10)
        w[ind] = getComputedStyle(th).width
      })

      setWidths(w)
    }, [tableHeadRef, setWidths, onOrderChange])

    const onDragEnd = useCallback(
      (...attrs) => {
        setWidths(null)
        if (onOrderChange) {
          onOrderChange(...attrs)
        }
      },
      [setWidths, onOrderChange],
    )

    const getWidth = ind => {
      return widths ? widths[ind] : null
    }

    return (
      <div
        ref={ref}
        className={`admin-table__body ${
          rowPerPage === 0 ? 'admin-table__body--scrollable' : ''
        }`}
        style={{ height: rowPerPage ? (rowPerPage + 1) * 56 + 3 : null }}
      >
        <DragDropContext
          onBeforeDragStart={onBeforeDragStart}
          onDragEnd={onDragEnd}
        >
          <table>
            <thead ref={tableHeadRef}>
              <tr>
                {onOrderChange && <th id={getThId(0)}>Order</th>}
                {showCheckboxes && (
                  <th className="checkbox-column" id={getThId(1)}>
                    <NiceCheckbox
                      checked={
                        data
                          .map(({ id }) => id)
                          .every(rowId => selectedRowIds.includes(rowId)) &&
                        selectedRowIds.length > 0
                      }
                      onChange={onAllCheckboxChange}
                    />
                  </th>
                )}
                {headers.map((header, ind) => (
                  <th key={header} id={getThId(ind + 2)}>
                    {header}
                  </th>
                ))}

                {rowActions.length > 0 && (
                  <th
                    className="centered-column"
                    id={getThId(headers.length + 3)}
                  >
                    {rowActions.length === 1 ? rowActions[0].title : 'Options'}
                  </th>
                )}
              </tr>
            </thead>
            <Droppable droppableId="droppable" isDropDisabled={!onOrderChange}>
              {provided => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {data.map((row, i) => {
                    return (
                      <Draggable
                        key={row.id}
                        draggableId={row.id}
                        index={i}
                        isDragDisabled={!onOrderChange}
                      >
                        {draggableProvided => (
                          <tr
                            className={`${
                              selectedRowIds.includes(row.id) ? 'selected' : ''
                            } ${onRowClick === null ? 'no-click' : ''} ${
                              incidentTable ? 'tr-height' : ''
                            }`}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            ref={draggableProvided.innerRef}
                            style={{
                              background: row?.rowBgColor?.code
                                ? row.rowBgColor.code
                                : '',
                              color: row?.rowBgColor?.code ? 'white' : '',
                            }}
                          >
                            {!!onOrderChange && (
                              <td
                                className="admin-table-order-cell"
                                style={{ width: getWidth(0) }}
                              >
                                {utils.calculateIndex(
                                  i + 1,
                                  currentPage,
                                  data.length,
                                )}
                              </td>
                            )}
                            {showCheckboxes && (
                              <td
                                className="checkbox-column"
                                style={{ width: getWidth(1) }}
                              >
                                <NiceCheckbox
                                  checked={selectedRowIds.includes(row.id)}
                                  onChange={value =>
                                    onRowCheckboxChange(row, value)
                                  }
                                />
                              </td>
                            )}
                            {columns.map((column, index) => {
                              const customRender = customRenders.find(
                                custom => custom.column === column,
                              )
                              return (
                                <td /* eslint-disable-line */
                                  key={`${row.id}-${column}`}
                                  style={{ width: getWidth(index + 2) }}
                                  onClick={() =>
                                    onRowClick ? onRowClick(row) : null
                                  }
                                  className={
                                    centerColumnIndexes.includes(index + 1)
                                      ? 'centered-column'
                                      : ''
                                  }
                                >
                                  {customRender
                                    ? customRender.render(row)
                                    : row[column]}
                                </td>
                              )
                            })}
                            {rowActions.length > 0 && (
                              <td
                                className="action-buttons centered-column"
                                style={{ width: getWidth(columns.length + 3) }}
                              >
                                {rowActions.map(rowAction => (
                                  <ButtonWithIcon
                                    key={rowAction.icon}
                                    icon={rowAction.icon}
                                    onClick={() => rowAction.onClick(row)}
                                    variant={VARIANT.Primary}
                                    disabled={rowAction.disabled}
                                    hollow
                                    noBorder
                                  />
                                ))}

                                <div className="action-buttons__ellipsis">
                                  ...
                                </div>
                              </td>
                            )}
                          </tr>
                        )}
                      </Draggable>
                    )
                  })}

                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>
    )
  },
)

AdminTableBody.propTypes = propTypes

AdminTableBody.defaultProps = {
  customRenders: [],
  rowActions: [],
  onRowClick: null,
  rowPerPage: 0,

  selectedRowIds: [],
  onAllCheckboxChange: () => {},
  onRowCheckboxChange: () => {},

  centerColumnIndexes: [],
  onOrderChange: () => {},
}

export default AdminTableBody
