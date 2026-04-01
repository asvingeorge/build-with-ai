const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const CALLBACK_NAME = '__crisissyncGoogleMapsInit'

let loaderPromise = null

export function hasGoogleMapsKey() {
  return Boolean(GOOGLE_MAPS_API_KEY)
}

export function loadGoogleMaps() {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error('Google Maps API key is not configured.'))
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps)
  }

  if (loaderPromise) {
    return loaderPromise
  }

  loaderPromise = new Promise((resolve, reject) => {
    window[CALLBACK_NAME] = () => {
      resolve(window.google.maps)
      delete window[CALLBACK_NAME]
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&callback=${CALLBACK_NAME}`
    script.async = true
    script.onerror = () => {
      reject(new Error('Google Maps failed to load.'))
      delete window[CALLBACK_NAME]
      loaderPromise = null
    }

    document.head.append(script)
  })

  return loaderPromise
}
