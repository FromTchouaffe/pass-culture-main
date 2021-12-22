import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import useNotification from 'components/hooks/useNotification'
import Spinner from 'components/layout/Spinner'
import {
  DEFAULT_EAC_STOCK_FORM_VALUES,
  getStockOfferAdapter,
  GetStockOfferSuccessPayload,
  Mode,
  OfferEducationalStockFormValues,
} from 'core/OfferEducational'
import { OfferBreadcrumbStep } from 'new_components/OfferBreadcrumb'
import OfferEducationalLayout from 'new_components/OfferEducationalLayout'
import OfferEducationalStockScreen from 'screens/OfferEducationalStock'

import postEducationalStockAdapter from './adapters/postEducationalStock'

const OfferEducationalStockCreation = (): JSX.Element => {
  const [offer, setOffer] = useState<GetStockOfferSuccessPayload | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  const { offerId } = useParams<{ offerId: string }>()
  const notify = useNotification()
  const history = useHistory()

  const handleSubmitStock = async (
    offer: GetStockOfferSuccessPayload,
    values: OfferEducationalStockFormValues
  ) => {
    const { isOk, message } = await postEducationalStockAdapter({
      offer,
      values,
    })

    if (!isOk) {
      return notify.error(message)
    }
    history.push(`/offre/${offer.id}/scolaire/confirmation`)
  }

  useEffect(() => {
    if (!isReady) {
      const loadOffer = async () => {
        const { payload, message, isOk } = await getStockOfferAdapter(offerId)

        if (!isOk) {
          return notify.error(message)
        }

        setOffer(payload)
        setIsReady(true)
      }

      loadOffer()
    }
  }, [offerId, notify, isReady])

  return (
    <OfferEducationalLayout
      activeStep={OfferBreadcrumbStep.STOCKS}
      isCreatingOffer
      title="Créer une nouvelle offre scolaire"
    >
      {offer && isReady ? (
        <OfferEducationalStockScreen
          initialValues={DEFAULT_EAC_STOCK_FORM_VALUES}
          mode={Mode.CREATION}
          offer={offer}
          onSubmit={handleSubmitStock}
        />
      ) : (
        <Spinner />
      )}
    </OfferEducationalLayout>
  )
}

export default OfferEducationalStockCreation
