import React from 'react'

import { api } from 'apiClient/api'
import { getError, isErrorAPIError } from 'apiClient/helpers'
import { PostVenueProviderBody, VenueProviderResponse } from 'apiClient/v1'
import { isAllocineProvider, isCinemaProvider } from 'core/Providers'
import { Providers, Venue } from 'core/Venue/types'
import useNotification from 'hooks/useNotification'

import AllocineProviderForm from '../AllocineProviderForm/AllocineProviderForm'
import { CinemaProviderForm } from '../CinemaProviderForm/CinemaProviderForm'
import StocksProviderForm from '../StocksProviderForm/StocksProviderForm'
import { getRequestErrorStringFromErrors } from '../utils/getRequestErrorStringFromErrors'

interface VenueProviderFormProps {
  afterSubmit: (createdVenueProvider?: VenueProviderResponse) => void
  provider: Providers
  venue: Venue
}

const VenueProviderForm = ({
  afterSubmit,
  provider,
  venue,
}: VenueProviderFormProps) => {
  const displayAllocineProviderForm = isAllocineProvider(provider)
  const displayCDSProviderForm = isCinemaProvider(provider)
  const notify = useNotification()
  const createVenueProvider = (payload?: PostVenueProviderBody): boolean => {
    let isSucess = false

    api
      .createVenueProvider(payload)
      .then((createdVenueProvider) => {
        isSucess = true
        notify.success('La synchronisation a bien été initiée.')
        afterSubmit(createdVenueProvider)
      })
      .catch((error) => {
        isSucess = false
        if (isErrorAPIError(error)) {
          notify.error(getRequestErrorStringFromErrors(getError(error)))
          afterSubmit()
        }
      })

    return isSucess
  }

  return displayAllocineProviderForm ? (
    <AllocineProviderForm
      isCreatedEntity
      providerId={Number(provider.id)}
      saveVenueProvider={createVenueProvider}
      venueId={venue.id}
      offererId={venue.managingOfferer.id}
    />
  ) : displayCDSProviderForm ? (
    <CinemaProviderForm
      isCreatedEntity
      providerId={Number(provider.id)}
      saveVenueProvider={createVenueProvider}
      venueId={venue.id}
      offererId={venue.managingOfferer.id}
    />
  ) : (
    <StocksProviderForm
      providerId={Number(provider.id)}
      saveVenueProvider={createVenueProvider}
      siret={venue.siret}
      venueId={venue.id}
      hasOffererProvider={provider.hasOffererProvider}
      offererId={venue.managingOfferer.id}
    />
  )
}

export default VenueProviderForm
