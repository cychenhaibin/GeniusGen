import { toPng, toSvg } from 'html-to-image'
import { jsPDF } from 'jspdf'

export async function exportToPng(element: HTMLElement, filename = 'chart'): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  })

  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = dataUrl
  link.click()
}

export async function exportToSvg(element: HTMLElement, filename = 'chart'): Promise<void> {
  const dataUrl = await toSvg(element, {
    backgroundColor: '#ffffff',
  })

  const link = document.createElement('a')
  link.download = `${filename}.svg`
  link.href = dataUrl
  link.click()
}

export async function exportToPdf(element: HTMLElement, filename = 'chart'): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  })

  const img = new Image()
  img.src = dataUrl

  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
  })

  const pdf = new jsPDF({
    orientation: img.width > img.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [img.width, img.height],
  })

  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height)
  pdf.save(`${filename}.pdf`)
}
