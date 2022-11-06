import React from 'react'

import Loading from '../../Loading/Loading'

export default function AdminDialogUploader() {
  return (
    <section>
      <header>
        <h1>Uploading tasks</h1>
        <Loading />
      </header>
      <p>This may take a few moments, please don&apos;t refresh the page</p>
    </section>
  )
}
