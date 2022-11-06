export default class CsvBuilder {
  constructor() {
    this.header = null
    this.body = null
    this.file = null
  }

  setHeader(header) {
    this.header = header

    return this
  }

  getHeader() {
    return this.header
  }

  setBody(body) {
    this.body = body

    return this
  }

  getBody() {
    return this.body
  }

  getFile() {
    return this.file
  }

  getFileSize() {
    return this.file ? this.file.size : 0
  }

  getCsvData() {
    const csvHeader = [this.arrayToCsv([this.getHeader()])]
    const csvBody = this.arrayToCsv(this.getBody())

    const csv = csvHeader

    return csv.concat(csvBody).join('\n')
  }

  arrayToCsv(data) {
    return data.map(row => row.join(',')).join('\n')
  }

  build() {
    this.file = new Blob([this.getCsvData()], { type: 'text/csv' })
    return this.file
  }
}
