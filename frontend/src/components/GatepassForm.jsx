import React, { useMemo, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const initialState = {
  reason: '',
  destination: '',
  outTime: '',
  expectedReturnTime: ''
}

function GatepassForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(initialState)
  const [formError, setFormError] = useState('')
  const { isDark } = useTheme()

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-indigo-100' : 'text-gray-700'}`
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 ${
    isDark
      ? 'bg-gray-900/70 border-indigo-500/30 text-white placeholder-indigo-200/60'
      : 'bg-white border-gray-300 text-gray-900'
  }`

  const minDateTime = useMemo(() => new Date().toISOString().slice(0, 16), [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!formData.reason.trim() || !formData.destination.trim()) {
      setFormError('Reason and destination are required')
      return
    }

    if (!formData.outTime || !formData.expectedReturnTime) {
      setFormError('Provide both out time and expected return time')
      return
    }

    const outTime = new Date(formData.outTime)
    const expectedReturnTime = new Date(formData.expectedReturnTime)

    if (Number.isNaN(outTime.getTime()) || Number.isNaN(expectedReturnTime.getTime())) {
      setFormError('Invalid date or time selected')
      return
    }

    if (expectedReturnTime <= outTime) {
      setFormError('Expected return must be after the out time')
      return
    }

    const payload = {
      reason: formData.reason.trim(),
      destination: formData.destination.trim(),
      outTime: outTime.toISOString(),
      expectedReturnTime: expectedReturnTime.toISOString()
    }

    try {
      await onSubmit(payload)
      setFormData(initialState)
    } catch (submitError) {
      const message = submitError?.message || 'Unable to submit gate pass request'
      setFormError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Reason</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          rows={4}
          className={`${inputClass} min-h-[120px] resize-none`}
          placeholder="Enter reason for gate pass"
        />
      </div>

      <div>
        <label className={labelClass}>Destination</label>
        <input
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          required
          className={inputClass}
          placeholder="Enter destination"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Out Time</label>
          <input
            type="datetime-local"
            name="outTime"
            value={formData.outTime}
            onChange={handleChange}
            required
            min={minDateTime}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Expected Return Time</label>
          <input
            type="datetime-local"
            name="expectedReturnTime"
            value={formData.expectedReturnTime}
            onChange={handleChange}
            required
            min={formData.outTime || minDateTime}
            className={inputClass}
          />
        </div>
      </div>

      {formError && (
        <p className="text-sm text-red-600">{formError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}

export default GatepassForm





