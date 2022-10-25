import React from 'react'

import PageTitle from 'components/layout/PageTitle/PageTitle'
import { useOfferIndividualContext } from 'context/OfferIndividualContext'
import { IOfferIndividual } from 'core/Offers/types'
import useIsCreation from 'new_components/OfferIndividualStepper/hooks/useIsCreation'
import {
  Summary as SummaryScreen,
  Template as WizardTemplate,
} from 'screens/OfferIndividual'

import { serializePropsFromOfferIndividual } from '.'

const Summary = (): JSX.Element | null => {
  const isCreation = useIsCreation()
  const {
    offer: contextOffer,
    categories,
    subCategories,
  } = useOfferIndividualContext()
  // FIXME : we should not need  as IOfferIndividual cause parent route would redirect on offer loading error
  const offer = contextOffer as IOfferIndividual
  const {
    providerName,
    offer: offerData,
    stockThing,
    stockEventList,
    preview,
  } = serializePropsFromOfferIndividual(
    offer as IOfferIndividual,
    categories,
    subCategories
  )

  return (
    <WizardTemplate title="Récapitulatif" withStepper={isCreation}>
      <PageTitle title="Récapitulatif" />
      <SummaryScreen
        offerId={offer.id}
        providerName={providerName}
        isCreation={isCreation}
        offer={offerData}
        stockThing={stockThing}
        stockEventList={stockEventList}
        subCategories={subCategories}
        preview={preview}
        isDraft={isCreation}
      />
    </WizardTemplate>
  )
}

export default Summary
