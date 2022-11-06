import React from 'react'

import { Loading, Overlay } from '../components/common'

export default function PaginationLoader() {
  return (
    <>
      <Overlay opacity={0.5} color="white" zIndex="0" width="50%" />
      <section className="pagination-loader--container">
        <div className="pagination-loader--wrapper">
          <h3 className="pagination-loader--text">Loading</h3>
          <div className="pagination-loader--spinner">
            <Loading />
          </div>
        </div>
      </section>
    </>
  )
}
