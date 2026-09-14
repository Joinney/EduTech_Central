import React, { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { FileText, Loader2 } from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfCoverPreview({ fileUrl, width = 82, height = 114, title = "PDF" }) {
  const [isError, setIsError] = useState(false)
  const isPdf = (fileUrl || "").toLowerCase().endsWith(".pdf")

  if (!isPdf || isError) {
    return (
      <div 
        className="bg-slate-100 border border-slate-200 rounded flex flex-col items-center justify-center p-1 text-center shrink-0"
        style={{ width, height }}
      >
        <FileText className="w-5 h-5 text-slate-400 mb-1" />
        <span className="text-[7px] font-bold text-slate-500 line-clamp-2 leading-tight">
          {title}
        </span>
      </div>
    )
  }

  return (
    <div 
      className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs shrink-0 flex items-center justify-center relative group"
      style={{ width, height }}
    >
      <Document
        file={fileUrl}
        loading={
          <div className="flex items-center justify-center w-full h-full bg-slate-50">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-900" />
          </div>
        }
        error={() => setIsError(true)}
      >
        <Page
          pageNumber={1}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="pointer-events-none"
        />
      </Document>
      <span className="absolute top-1 left-1 bg-red-600 text-white text-[7px] font-black px-1 rounded uppercase z-10">
        PDF
      </span>
    </div>
  )
}