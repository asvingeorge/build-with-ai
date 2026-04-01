import { useEffect, useRef, useState } from 'react'
import { hasGoogleMapsKey, loadGoogleMaps } from '../lib/googleMapsLoader'

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export default function GoogleIncidentMap({ lat, lng, severity, incidents }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [mapStatus, setMapStatus] = useState(hasGoogleMapsKey() ? 'loading' : 'missing-key')

  useEffect(() => {
    let mounted = true

    const initMap = async () => {
      if (!hasGoogleMapsKey() || !mapRef.current) {
        return
      }

      try {
        const maps = await loadGoogleMaps()
        if (!mounted || !mapRef.current) {
          return
        }

        const fallbackCenter = { lat: 20.5937, lng: 78.9629 }
        const primaryLat = toNumber(lat)
        const primaryLng = toNumber(lng)
        const center =
          primaryLat !== null && primaryLng !== null
            ? { lat: primaryLat, lng: primaryLng }
            : fallbackCenter

        mapInstanceRef.current = new maps.Map(mapRef.current, {
          center,
          zoom: primaryLat !== null && primaryLng !== null ? 13 : 4,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        setMapStatus('ready')
      } catch {
        if (mounted) {
          setMapStatus('error')
        }
      }
    }

    initMap()

    return () => {
      mounted = false
    }
  }, [lat, lng])

  useEffect(() => {
    const maps = window.google?.maps
    const map = mapInstanceRef.current
    if (!maps || !map) {
      return
    }

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    const validIncidents = incidents
      .map((incident) => {
        const incidentLat = toNumber(incident.location?.lat)
        const incidentLng = toNumber(incident.location?.lng)
        if (incidentLat === null || incidentLng === null) {
          return null
        }
        return {
          ...incident,
          coordinates: { lat: incidentLat, lng: incidentLng },
        }
      })
      .filter(Boolean)

    validIncidents.forEach((incident) => {
      const marker = new maps.Marker({
        map,
        position: incident.coordinates,
        title: incident.analysis?.type || 'Incident',
      })

      const infoWindow = new maps.InfoWindow({
        content: `
          <div style="max-width:220px;padding:4px 2px;color:#111827;">
            <strong>${incident.analysis?.type || 'Incident'} - ${incident.analysis?.severity || 'Low'}</strong>
            <p style="margin:8px 0 0;line-height:1.4;">${incident.description}</p>
          </div>
        `,
      })

      marker.addListener('click', () => {
        infoWindow.open({ anchor: marker, map })
      })

      markersRef.current.push(marker)
    })

    const primaryLat = toNumber(lat)
    const primaryLng = toNumber(lng)

    if (primaryLat !== null && primaryLng !== null) {
      map.setCenter({ lat: primaryLat, lng: primaryLng })
      map.setZoom(severity === 'Critical' ? 14 : 13)
    } else if (validIncidents[0]) {
      map.setCenter(validIncidents[0].coordinates)
      map.setZoom(11)
    }
  }, [incidents, lat, lng, severity])

  if (mapStatus === 'missing-key') {
    return (
      <div className="map-card">
        <div className="panel-head">
          <h2>Location Sync</h2>
          <span className="status-pill neutral">Map key missing</span>
        </div>
        <div className="map-empty-state">
          Add `VITE_GOOGLE_MAPS_API_KEY` to `.env.local` to replace the fallback map with live Google Maps.
        </div>
      </div>
    )
  }

  if (mapStatus === 'error') {
    return (
      <div className="map-card">
        <div className="panel-head">
          <h2>Location Sync</h2>
          <span className="status-pill high">Map failed</span>
        </div>
        <div className="map-empty-state">
          Google Maps did not load. Check your API key, enabled APIs, billing, and referrer restrictions.
        </div>
      </div>
    )
  }

  return (
    <div className="map-card">
      <div className="panel-head">
        <h2>Location Sync</h2>
        <span className={`status-pill ${mapStatus === 'ready' ? 'medium' : 'neutral'}`}>
          {mapStatus === 'ready' ? 'Google Maps live' : 'Loading map'}
        </span>
      </div>
      <div ref={mapRef} className="google-map-canvas" />
      <p className="map-caption">
        {lat && lng ? `Tracking selected incident at Lat ${lat}, Lng ${lng}` : 'Showing known incident coordinates on the live map.'}
      </p>
    </div>
  )
}
