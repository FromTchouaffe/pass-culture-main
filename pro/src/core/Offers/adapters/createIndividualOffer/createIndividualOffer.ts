/* istanbul ignore file: DEBT, TO FIX */

import { api } from 'apiClient/api'
import { isErrorAPIError, serializeApiErrors } from 'apiClient/helpers'
import { OfferIndividualFormValues } from 'components/OfferIndividualForm'

import { serializePostOffer } from './serializers'

type TSuccessPayload = { nonHumanizedId: number }
type TFailurePayload = { errors: Record<string, string> }
type TCreateIndividualOffer = Adapter<
  OfferIndividualFormValues,
  TSuccessPayload,
  TFailurePayload
>

const createIndividualOffer: TCreateIndividualOffer = async formValues => {
  try {
    const response = await api.postOffer(serializePostOffer(formValues))
    return {
      isOk: true,
      message: '',
      payload: {
        nonHumanizedId: response.nonHumanizedId,
      },
    }
  } catch (error) {
    let formErrors = {}
    /* istanbul ignore next: DEBT, TO FIX */
    if (isErrorAPIError(error)) {
      formErrors = error.body
    }
    const apiFieldsMap: Record<string, string> = {
      venue: 'venueId',
    }
    return {
      isOk: false,
      message: 'Une erreur est survenue lors de la création de votre offre',
      payload: {
        errors: serializeApiErrors(formErrors, apiFieldsMap),
      },
    }
  }
}

export default createIndividualOffer
