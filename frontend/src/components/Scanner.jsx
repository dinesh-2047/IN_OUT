import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

function Scanner({ onScan, onError }) {
  const [scanning, setScanning] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [qrboxSize, setQrboxSize] = useState(280)
  const html5QrcodeRef = useRef(null)
  const scannerContainerRef = useRef(null)
  const scannerIdRef = useRef(null)

  if (!scannerIdRef.current) {
    scannerIdRef.current = `qr-reader-${Math.random().toString(36).slice(2, 10)}`
  }

  const updateQrboxSize = useCallback(() => {
    if (!scannerContainerRef.current) return
    const containerWidth = scannerContainerRef.current.getBoundingClientRect().width || 320
    const nextSize = Math.max(200, Math.min(420, Math.round(containerWidth * 0.85)))
    setQrboxSize(nextSize)
  }, [])

  const startScanning = async () => {
    if (html5QrcodeRef.current) {
      await stopScanning()
    }

    setInitializing(true)
    
    // Render the scanner container first
    setScanning(true)
    
    // Wait for DOM to update and element to be available
    await new Promise(resolve => setTimeout(resolve, 450))

    try {
      // Get cameras
      let devices = []
      try {
        devices = await Html5Qrcode.getCameras()
      } catch (camError) {
        console.error('Error getting cameras:', camError)
        setScanning(false)
        setInitializing(false)
        throw new Error('Unable to access camera. Please check permissions and allow camera access in your browser settings.')
      }

      if (!devices || devices.length === 0) {
        setScanning(false)
        setInitializing(false)
        throw new Error('No camera found. Please connect a webcam or use a mobile device with a camera.')
      }

      // Get the scanner element - it should exist now
      const scannerElement = document.getElementById(scannerIdRef.current)
      if (!scannerElement) {
        setScanning(false)
        setInitializing(false)
        throw new Error('Scanner element not found. Please refresh the page and try again.')
      }

      if (html5QrcodeRef.current) {
        await stopScanning()
      }

      html5QrcodeRef.current = new Html5Qrcode(scannerIdRef.current)
      
      // Select camera - prefer back camera on mobile
      let cameraId
      const backCamera = devices.find(device => {
        const label = (device.label || '').toLowerCase()
        return label.includes('back') || label.includes('rear') || label.includes('environment')
      })
      
      if (backCamera) {
        cameraId = backCamera.id
      } else {
        // Try environment facing mode (back camera on mobile)
        cameraId = { facingMode: 'environment' }
      }

      await html5QrcodeRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
          disableFlip: false
        },
        (decodedText, decodedResult) => {
          if (onScan && decodedText) {
            onScan(decodedText)
            stopScanning()
          }
        },
        (errorMessage) => {
          // Ignore common scanning errors (normal noise during scanning)
          if (!errorMessage.includes('NotFoundException') && 
              !errorMessage.includes('No MultiFormat Readers') &&
              !errorMessage.includes('QR code parse error')) {
            // Only log non-critical errors
            console.log('Scanner info:', errorMessage)
          }
        }
      )
      
      setInitializing(false)
    } catch (err) {
      console.error('Error starting scanner:', err)
      setScanning(false)
      setInitializing(false)
      
      let errorMessage = 'Failed to start camera'
      if (err.message.includes('Permission denied') || 
          err.message.includes('NotAllowedError') || 
          err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission is required. Please allow camera access in your browser settings and try again.'
      } else if (err.message.includes('No cameras') || err.message.includes('No camera')) {
        errorMessage = 'No camera found. Please connect a webcam or use a mobile device with a camera.'
      } else if (err.message.includes('Unable to access')) {
        errorMessage = err.message
      } else if (err.message.includes('Scanner element not found')) {
        errorMessage = 'Scanner initialization error. Please refresh the page and try again.'
      } else {
        errorMessage = `Error accessing camera: ${err.message}`
      }
      
      if (onError) {
        onError({ message: errorMessage, originalError: err })
      } else {
        alert(errorMessage)
      }
    }
  }

  const stopScanning = async () => {
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop()
        await html5QrcodeRef.current.clear()
      } catch (err) {
        console.log('Error stopping scanner:', err)
      }
      html5QrcodeRef.current = null
    }
    setScanning(false)
    setInitializing(false)
  }

  useEffect(() => {
    updateQrboxSize()

    let resizeObserver
    const hasWindow = typeof window !== 'undefined'
    if (hasWindow && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => updateQrboxSize())
      if (scannerContainerRef.current) {
        resizeObserver.observe(scannerContainerRef.current)
      }
    } else if (hasWindow) {
      window.addEventListener('resize', updateQrboxSize)
      window.addEventListener('orientationchange', updateQrboxSize)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else if (hasWindow) {
        window.removeEventListener('resize', updateQrboxSize)
        window.removeEventListener('orientationchange', updateQrboxSize)
      }
      if (html5QrcodeRef.current) {
        stopScanning()
      }
    }
  }, [updateQrboxSize])

  return (
    <div className="w-full max-w-2xl mx-auto" ref={scannerContainerRef}>
      <div className={`${!scanning && !initializing ? 'block' : 'hidden'}`}>
        <button
          onClick={startScanning}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Start Scanning
        </button>
      </div>

      <div className={`${initializing ? 'block' : 'hidden'}`}>
        <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4" />
          <p className="text-white font-semibold text-lg">Initializing camera...</p>
          <p className="text-white/80 text-sm mt-2">Please allow camera access when prompted</p>
        </div>
      </div>

      <div className={`${scanning ? 'space-y-4' : 'hidden'}`}>
        <div
          id={scannerIdRef.current}
          className="rounded-xl overflow-hidden bg-black w-full border-4 border-white/50 shadow-2xl aspect-square max-h-[480px]"
          style={{ minHeight: `${Math.max(200, qrboxSize)}px` }}
        />
        <p className="text-center text-white font-medium text-lg">Point camera at QR code</p>
        <button
          onClick={stopScanning}
          className="w-full bg-white/20 backdrop-blur-sm text-white py-3 px-4 rounded-xl hover:bg-white/30 transition-all font-semibold shadow-lg border border-white/30"
        >
          Stop Scanning
        </button>
      </div>
    </div>
  )
}

export default Scanner

