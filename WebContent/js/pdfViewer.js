// module "pdfViewer.js"
"use strict"

class PDFViewer {
  constructor(canvas) {
    this.pdfDoc = undefined
    this.pageNum = 1
    this.scale = 1
    this.canvas = canvas
  }

  load(file) {
    let pdfjsLib = window["pdfjs-dist/build/pdf"]

    pdfjsLib.GlobalWorkerOptions.workerSrc = fileUrl("js/lib/pdf.min-2.0.943.worker.js")

    pdfjsLib.getDocument({url: file, disableRange: true, disableStream: true})
    .then(pdf => this.initialPage(pdf))
    .catch(error => reportError(file, error))
  }

  async initialPage(pdfDoc) {
    this.pdfDoc = pdfDoc

    await this.showPage(1)
  }

  async showPage(pageNum) {
    this.pageNum = pageNum

    this.pdfDoc.getPage(pageNum)
    .then(page => this.renderPage(page))
    .catch(error => reportError("showPage", error))
  }

  async renderPage(page) {
    let canvas = this.canvas
    let viewport = page.getViewport(this.scale)

    let context = canvas.getContext("2d")
    canvas.height = viewport.height
    canvas.width = viewport.width

    let renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    return await page.render(renderContext)
  }

  async zoom(newScale) {
    this.scale = newScale
    await this.showPage(this.pageNum)
  }

  async prevPage() {
    let prev = this.pageNum > 1 ? this.pageNum - 1 : 1
    await this.showPage(prev)
  }

  async nextPage() {
    let next = this.pageNum < this.pdfDoc.numPages ? this.pageNum + 1 : this.pdfDoc.numPages
    await this.showPage(next)
  }
}