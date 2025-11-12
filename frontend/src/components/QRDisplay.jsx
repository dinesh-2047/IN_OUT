import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

function QRDisplay({ tokenValue, gatepass }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const generateQr = async () => {
      if (!tokenValue) {
        setQrCodeDataUrl('')
        return
      }

      try {
        const url = await QRCode.toDataURL(tokenValue, {
          width: 320,
          margin: 2,
          errorCorrectionLevel: 'M',
        })

        if (!cancelled) {
          setQrCodeDataUrl(url)
          setError('')
        }
      } catch (generationError) {
        console.error('Failed to generate QR code', generationError)
        if (!cancelled) {
          setError('Unable to generate QR code')
          setQrCodeDataUrl('')
        }
      }
    }

    generateQr()

    return () => {
      cancelled = true
    }
  }, [tokenValue])

  const outTime = gatepass?.outTime ? new Date(gatepass.outTime) : null
  const returnTime = gatepass?.expectedReturnTime ? new Date(gatepass.expectedReturnTime) : null
  const expiresAt = gatepass?.gatePassToken?.expiresAt
    ? new Date(gatepass.gatePassToken.expiresAt)
    : null
  const formattedOut = outTime
    ? `${outTime.toLocaleDateString()} ${outTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '--'
  const formattedReturn = returnTime
    ? `${returnTime.toLocaleDateString()} ${returnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '--'
  const formattedExpiry = expiresAt
    ? `${expiresAt.toLocaleDateString()} ${expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '--'

  const usesAllowed = gatepass?.gatePassToken?.usesAllowed || 0
  const usesCount = gatepass?.gatePassToken?.usesCount || 0
  const remainingUses = Math.max(usesAllowed - usesCount, 0)

  return (
    <div className="bg-white/95 p-6 rounded-lg shadow-md border border-primary-100 text-gray-800">
      <h3 className="text-lg font-semibold mb-4 text-center">Gate Pass QR Code</h3>
      <div className="flex flex-col items-center space-y-4">
        {qrCodeDataUrl ? (
          <div className="p-4 bg-white rounded-lg border-4 border-primary-500 shadow-inner">
            <img src={qrCodeDataUrl} alt="Gate Pass QR" className="w-48 h-48 object-contain" />
          </div>
        ) : (
          <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg text-sm text-gray-500 border border-dashed border-gray-300">
            {error || 'QR code will appear once generated'}
          </div>
        )}

        {tokenValue && (
          <div className="text-center space-y-1 text-sm">
            <p><strong>Token:</strong> {tokenValue}</p>
            <p><strong>Out:</strong> {formattedOut}</p>
            <p><strong>Expected Return:</strong> {formattedReturn}</p>
            <p><strong>Expires:</strong> {formattedExpiry}</p>
            <p><strong>Remaining Uses:</strong> {remainingUses}</p>
            <p className="text-xs text-gray-600 mt-3">
              Present this QR code to security at entry and exit. Keep the screen brightness high for easy scanning.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRDisplay





