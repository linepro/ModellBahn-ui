// module "pdfViewer.js";
"use strict";

const pdfViewer = () => {
  let container = createDiv(undefined, "display-pdf-container");

  let canvas = createCanvas(container, "canvas", "display-pdf-canvas");

  let bar = createDiv(container, "display-pdf-bar");

  let prev = createButton(bar, "vorig", "prev", undefined, "table-prev");
  prev.disabled = true;
  prev.style.visible = "hidden";

  let next = createButton(bar, "nachste", "next", undefined, "table-next");
  next.disabled = true;
  next.style.visible = "hidden";

  let pageNum = 1;

  let showPage = async (pdf, newPage) => {
    await pdf.getPage(pageNum)
      .then((page) => {
        pageNum = newPage;

        prev.disabled = pageNum <= 1;
        prev.style.visibility = prev.disabled ? "hidden" : "visible";

        next.disabled = pageNum >= pdf.numPages;
        next.style.visibility = next.disabled ? "hidden" : "visible";
         
        let viewport = page.getViewport(1);
        let context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        return page.render({
          canvasContext: context,
          viewport: viewport,
        });
      })
      .catch(error => reportError("showPage", error));
  };

  return {
    element: container,
    load: async (file) => {
      let pdfjsLib = window["pdfjs-dist/build/pdf"];
      pdfjsLib.GlobalWorkerOptions.workerSrc = fileUrl("js/lib/pdf.worker.js");
      await pdfjsLib.getDocument({
        url: file,
        disableRange: true,
        disableStream: true
      })
      .then(pdf => {
        prev.addEventListener("click", () => showPage(pdf, pageNum > 1 ? pageNum - 1 : 1), false);
        next.addEventListener("click", () => showPage(pdf, pageNum < pdf.numPages - 1 ? pageNum + 1 : pdf.numPages - 1), false);

        showPage(pdf, 1);
      })
      .catch(error => reportError(file, error));
    }
  };
};
