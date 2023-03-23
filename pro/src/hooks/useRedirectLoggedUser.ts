import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { api } from 'apiClient/api'

import useActiveFeature from './useActiveFeature'
import useCurrentUser from './useCurrentUser'

const useRedirectLoggedUser = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useCurrentUser()
  const newOnboardingActive = useActiveFeature('WIP_ENABLE_NEW_ONBOARDING')

  useEffect(() => {
    async function fetchOfferersNames() {
      try {
        const listOfferer = await api.listOfferersNames()
        if (listOfferer.offerersNames.length === 0) {
          navigate('/parcours-inscription')
        }
      } catch (error) {
        navigate('/parcours-inscription')
      }
    }

    if (currentUser) {
      let redirectUrl = null

      if (newOnboardingActive && !currentUser.isAdmin) {
        fetchOfferersNames()
      }

      const queryParams = new URLSearchParams(location.search)
      if (queryParams.has('de')) {
        redirectUrl = queryParams.get('de')
      } else if (currentUser.isAdmin) {
        redirectUrl = `/structures${location.search}`
      } else {
        redirectUrl = `/accueil${location.search}`
      }
      redirectUrl && navigate(redirectUrl)
    }
  }, [currentUser])
}

export default useRedirectLoggedUser
