// module "pdfViewer.js"
"use strict";

const pdfViewer = (canvas) => {
  return {
    pdfDoc: undefined,
    pageNum: 1,
    scale: 1,
    canvas: canvas
  };
};

const showPdfPage = async (pageNum, viewer) => {
  viewer.pageNum = pageNum;
  await viewer.pdfDoc
              .getPage(pageNum)
              .then(page => renderPdf(page, viewer))
              .catch(error => reportError("showPdfPage", error));
};

const loadPdf = async (file, viewer) => {
  let pdfjsLib = window["pdfjs-dist/build/pdf"];
  pdfjsLib.GlobalWorkerOptions.workerSrc = fileUrl("js/lib/pdf.min-2.0.943.worker.js");
  await pdfjsLib.getDocument({
                  url: file,
                  disableRange: true,
                  disableStream: true
                })
                .then(pdf => {
      viewer.pdfDoc = pdf;
      showPdfPage(1, viewer);
                })
                .catch(error => reportError(file, error));
};

const renderPdf = async (page, viewer) => {
  let canvas = viewer.canvas;
  let viewport = page.getViewport(viewer.scale);
  let context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  return page.render({
    canvasContext: context,
    viewport: viewport,
  });
};

const zoomPdf = async (newScale, viewer) => {
  viewer.scale = newScale;
  await showPdfPage(viewer.pageNum, viewer);
};

const prevPdfPage = async (viewer) => {
  let prev = viewer.pageNum > 1 ? viewer.pageNum - 1 : 1;
  await showPdfPage(prev, viewer);
};

const nextPdfPage = async (viewer) => {
  let next = viewer.pageNum < viewer.pdfDoc.numPages ? viewer.pageNum + 1 : viewer.pdfDoc.numPages;
  await showPdfPage(next, viewer);
};
