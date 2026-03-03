import { ref } from 'vue'

export interface PrintOptions {
  /** Document title for the print window */
  title?: string
  /** CSS styles to inject */
  styles?: string[]
  /** Additional CSS URLs to include */
  cssUrls?: string[]
  /** Timeout for print preparation in ms */
  timeout?: number
  /** Whether to close window after print */
  closeAfterPrint?: boolean
}

const defaultStyles = `
  @media print {
    body {
      margin: 0;
      padding: 20px;
    }

    .no-print {
      display: none !important;
    }

    @page {
      margin: 10mm;
    }
  }
`

export function usePrint() {
  const isPrinting = ref(false)

  /**
   * Print content from an element by selector or element reference
   */
  const printElement = async (
    element: HTMLElement | string,
    options: PrintOptions = {},
  ): Promise<void> => {
    const {
      title = document.title,
      styles = [],
      cssUrls = [],
      timeout = 200,
    } = options

    isPrinting.value = true

    try {
      // Get the target element
      const targetEl = typeof element === 'string'
        ? document.querySelector<HTMLElement>(element)
        : element

      if (!targetEl) {
        throw new Error('Print target element not found')
      }

      // Create print window
      const printWindow = window.open('', '_blank', 'width=800,height=600')

      if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups.')
      }

      // Wait for window to be ready
      await new Promise<void>((resolve) => {
        printWindow.document.open()
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
            </head>
            <body>
              ${targetEl.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()

        // Add CSS URLs
        cssUrls.forEach((url) => {
          const link = printWindow.document.createElement('link')
          link.rel = 'stylesheet'
          link.href = url
          printWindow.document.head.appendChild(link)
        })

        // Add inline styles
        const styleEl = printWindow.document.createElement('style')
        styleEl.textContent = [defaultStyles, ...styles].join('\n')
        printWindow.document.head.appendChild(styleEl)

        // Wait for resources to load
        setTimeout(resolve, timeout)
      })

      // Print and close
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
    finally {
      isPrinting.value = false
    }
  }

  /**
   * Print the current page
   */
  const printPage = (): void => {
    isPrinting.value = true
    try {
      window.print()
    }
    finally {
      isPrinting.value = false
    }
  }

  /**
   * Print content from a URL
   */
  const printUrl = async (url: string, options: PrintOptions = {}): Promise<void> => {
    const { title = document.title } = options

    isPrinting.value = true

    try {
      const printWindow = window.open(url, '_blank', 'width=800,height=600')

      if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups.')
      }

      printWindow.document.title = title

      await new Promise<void>((resolve) => {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
            printWindow.close()
            resolve()
          }, options.timeout || 500)
        }
      })
    }
    finally {
      isPrinting.value = false
    }
  }

  /**
   * Add print event listeners
   */
  const onPrintStart = (callback: () => void) => {
    window.addEventListener('beforeprint', callback)
    return () => window.removeEventListener('beforeprint', callback)
  }

  const onPrintEnd = (callback: () => void) => {
    window.addEventListener('afterprint', callback)
    return () => window.removeEventListener('afterprint', callback)
  }

  return {
    isPrinting,
    printElement,
    printPage,
    printUrl,
    onPrintStart,
    onPrintEnd,
  }
}
